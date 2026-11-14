<?php
// F7 probe: phpkafka counts messages instead of reading record offsets.
// Mirrors Sokrio: autoCommit=false, groupInstanceId '', addFetchOffset(p, 1) per message, saveOffsets on flush.
require '/srv/vendor/autoload.php';
use longlang\phpkafka\Producer\{Producer, ProducerConfig, ProduceMessage};
use longlang\phpkafka\Consumer\{Consumer, ConsumerConfig};
const T = 'f7b';
function produceBatch(array $values): void {
    $c = new ProducerConfig(); $c->setBootstrapServers('k1:9092'); $c->setAcks(1);
    $p = new Producer($c);
    $p->sendBatch(array_map(fn ($v) => new ProduceMessage(T, (string) $v, 'same-key'), $values)); // one RecordBatch
    $p->close();
}
function consumer(): Consumer {
    $c = new ConsumerConfig(); $c->setBootstrapServers('k1:9092'); $c->setTopic(T);
    $c->setGroupId('f7b-group'); $c->setAutoCommit(false); $c->setGroupInstanceId('');
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
function single($v): void { $c = new ProducerConfig(); $c->setBootstrapServers('k1:9092'); $c->setAcks(1); $p = new Producer($c); $p->send(T, (string) $v, 'same-key'); $p->close(); }
produceBatch(range(0, 9));
$a = consumer(); echo 'aligned start read: ' . implode(',', take($a, 100)) . ' | cursor=' . $cursor($a) . "\n"; $a->close();
produceBatch(range(10, 19));
$b = consumer(); echo 'aligned restart read: ' . implode(',', take($b, 4)) . ' | cursor=' . $cursor($b) . "  (commit mid-batch, restart)\n"; $b->close();
$c = consumer(); echo 'misaligned read: ' . implode(',', take($c, 100)) . ' | cursor=' . $cursor($c) . "\n";
single(20);
echo 'after one single-record publish: ' . implode(',', take($c, 100, 5)) . ' | cursor=' . $cursor($c) . "\n";
produceBatch(range(21, 23));
echo 'next batch: ' . implode(',', take($c, 100, 5)) . ' | cursor=' . $cursor($c) . "\n"; $c->close();
