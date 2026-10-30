<?php use Illuminate\Support\Facades\Redis;
// F14 / D21: which SCAN call shape and start cursor finds the 120 buffer keys on each client?
Redis::flushdb();
for ($i = 0; $i < 120; $i++) Redis::rpush("feature_tracking:buffer:$i", 'evt');
$match = config('database.redis.options.prefix') . 'feature_tracking:buffer:*';
$out = [];
try { $c = '0'; $n = 0; do { [$c, $k] = Redis::scan($c, 'MATCH', $match, 'COUNT', 50); $n += count($k ?: []); } while ((string) $c !== '0');
      $out[] = "Sokrio call (FlushFeatureEventsJob.php:68): $n/120"; } catch (\Throwable $e) { $out[] = 'Sokrio call: ERROR ' . $e->getMessage(); }
foreach (['null' => null, 'int 0' => 0, "'0'" => '0'] as $label => $start) {
    try { $cursor = $start; $n = 0; $loops = 0;
        do { $r = Redis::scan($cursor, ['match' => $match, 'count' => 50]); if ($r === false) break;
             [$cursor, $keys] = $r; $n += count($keys ?: []); } while ($cursor && (string) $cursor !== '0' && ++$loops < 1000);
        $out[] = "start $label: $n/120";
    } catch (\Throwable $e) { $out[] = "start $label: ERROR " . $e->getMessage(); }
}
echo str_pad(config('database.redis.client'), 9) . implode(' | ', $out) . "\n";
