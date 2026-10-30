<?php use Illuminate\Support\Facades\{Redis, Cache};
foreach ([['beol', 1], ['beol', 30001], ['pvm', 1]] as [$t, $row]) {
    $before = Redis::llen('queues:default');
    BulkStockImportLikeJob::dispatch($t, $row);
    echo "dispatch $t chunk@$row -> " . (Redis::llen('queues:default') > $before ? 'queued' : 'DROPPED') . "\n";
}
$key = 'laravel_unique_job:BulkStockImportLikeJob';
echo "lock key '$key' TTL = " . Redis::connection('cache')->ttl(config('cache.prefix') . ':' . $key) . " (-1 = never expires)\n";
