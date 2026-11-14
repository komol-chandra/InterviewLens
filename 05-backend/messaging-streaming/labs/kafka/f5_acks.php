<?php
// F5 probe: does acks=0 hide a broker-side rejection? Topic "small" has max.message.bytes=1000.
require '/srv/vendor/autoload.php';
use longlang\phpkafka\Producer\{Producer, ProducerConfig};
foreach ([null, 1] as $acks) {
    $cfg = new ProducerConfig();
    $cfg->setBootstrapServers('k1:9092');
    $cfg->setAutoCreateTopic(false);
    if ($acks !== null) $cfg->setAcks($acks);
    $p = new Producer($cfg);
    $label = 'acks=' . $cfg->getAcks() . ($acks === null ? ' (library default, = Sokrio)' : '');
    try {
        $p->send('small', str_repeat('x', 5000), 'k1');
        echo "$label: send() returned normally\n";
    } catch (\Throwable $e) {
        echo "$label: " . get_class($e) . ' — ' . $e->getMessage() . "\n";
    }
    $p->close();
}
