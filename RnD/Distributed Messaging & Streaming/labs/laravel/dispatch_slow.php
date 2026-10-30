<?php SlowReportJob::dispatch(12); echo "dispatched SlowReportJob(12s), retry_after=" . config('queue.connections.redis.retry_after') . "\n";
