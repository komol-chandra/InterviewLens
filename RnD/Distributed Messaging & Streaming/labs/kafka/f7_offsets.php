<?php
// F7 probe: phpkafka counts messages instead of reading record offsets.
// Mirrors Sokrio: autoCommit=false, groupInstanceId '', addFetchOffset(p, 1) per message, saveOffsets on flush.
require '/srv/vendor/autoload.php';
use longlang\phpkafka\Producer\{Producer, ProducerConfig, ProduceMessage};
use longlang\phpkafka\Consumer\{Consumer, ConsumerConfig};
const T = 'f7';
function produceBatch(array $values): void {
    $c = new ProducerConfig(); $c->setBootstrapServers('k1:9092'); $c->setAcks(1);
    $p = new Producer($c);
    $p->sendBatch(array_map(fn ($v) => new ProduceMessage(T, (string) $v, 'same-key'), $values)); // one RecordBatch
    $p->close();
}
function consumer(): Consumer {
    $c = new ConsumerConfig(); $c->setBootstrapServers('k1:9092'); $c->setTopic(T);
    $c->setGroupId('f7-group'); $c->setAutoCommit(false); $c->setGroupInstanceId('');
    $c->setSessionTimeout(30); $c->setRebalanceTimeout(30);
    return new Consumer($c);
}
function take(Consumer $c, int $max, int $emptyPolls = 3): array {
    $seen = []; $empty = 0;
    while (count($seen) < $max && $empty < $emptyPolls) {
        $m = $c->consume();
        if ($m === null) { $empty++; continue; }
        $c->getOffsetManager(T)->addFetchOffset($m->getPartition(), 1); // = Sokrio advanceCursor
        $seen[] = $m->getValue();
    }
    $c->getOffsetManager(T)->saveOffsets(0, 3);                        // = Sokrio flush commit
    return $seen;
}
$cursor = fn (Consumer $c) => $c->getOffsetManager(T)->getFetchOffset(0);
produceBatch(range(0, 9));                                   // offsets 0..9, ONE batch
$a = consumer(); $got = take($a, 4);
echo 'run 1 read: ' . implode(',', $got) . ' | committed cursor=' . $cursor($a) . "  (then the process restarts)\n";
$a->close();
$b = consumer(); $got = take($b, 100);
echo 'run 2 read: ' . implode(',', $got) . ' | cursor=' . $cursor($b) . " (log end offset is 10)\n";
produceBatch(range(10, 13));                                 // offsets 10..13, a second batch
$got = take($b, 100, 5);
echo 'run 2 then read: ' . implode(',', $got) . ' | cursor=' . $cursor($b) . " (expected 10,11,12,13)\n";
$b->close();
