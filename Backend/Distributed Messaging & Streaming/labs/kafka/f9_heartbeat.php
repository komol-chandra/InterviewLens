<?php
// F7 probe: phpkafka counts messages instead of reading record offsets.
// Mirrors Sokrio: autoCommit=false, groupInstanceId '', addFetchOffset(p, 1) per message, saveOffsets on flush.
require '/srv/vendor/autoload.php';
use longlang\phpkafka\Producer\{Producer, ProducerConfig, ProduceMessage};
use longlang\phpkafka\Consumer\{Consumer, ConsumerConfig};
const T = 'f9';
function produceBatch(array $values): void {
    $c = new ProducerConfig(); $c->setBootstrapServers('k1:9092'); $c->setAcks(1);
    $p = new Producer($c);
    $p->sendBatch(array_map(fn ($v) => new ProduceMessage(T, (string) $v, 'same-key'), $values)); // one RecordBatch
    $p->close();
}
function consumer(): Consumer {
    $c = new ConsumerConfig(); $c->setBootstrapServers('k1:9092'); $c->setTopic(T);
    $c->setGroupId('f9-group'); $c->setAutoCommit(false); $c->setGroupInstanceId('');
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
$slow = (int) ($argv[1] ?? 40);
produceBatch(['a']); produceBatch(['b']); produceBatch(['c']);   // 3 single-record batches (aligned)
$a = consumer(); $seen = [];
while (count($seen) < 3) { $m = $a->consume(); if ($m) { $a->getOffsetManager(T)->addFetchOffset(0, 1); $seen[] = $m->getValue(); } }
echo 'read ' . implode(',', $seen) . "; now a {$slow}s flush with no fetch (session timeout 30s)\n";
sleep($slow);                                                     // = a slow handler() inside flush()
try { $a->getOffsetManager(T)->saveOffsets(0, 3); echo "commit OK\n"; }
catch (\Throwable $e) { echo 'commit FAILED: ' . get_class($e) . ' — ' . $e->getMessage() . "\n"; }
try { $a->close(); } catch (\Throwable $e) {}
$b = consumer(); echo 'next process reads: ' . implode(',', take($b, 100)) . "\n"; $b->close();
