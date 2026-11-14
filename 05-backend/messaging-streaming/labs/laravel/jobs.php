<?php
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\{ShouldQueue, ShouldBeUnique};
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\{InteractsWithQueue, SerializesModels};

// retry_after lab: like GenerateTrackingReport — $timeout = 0, runs longer than retry_after.
class SlowReportJob implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $timeout = 0; public $tries = 3;
    public function __construct(public int $seconds) {}
    public function handle(): void {
        $id = $this->job->getJobId();
        echo sprintf("[%s] pid %d START job %s attempt %d\n", date('H:i:s'), getmypid(), $id, $this->attempts());
        sleep($this->seconds);
        echo sprintf("[%s] pid %d END   job %s\n", date('H:i:s'), getmypid(), $id);
    }
}
// F11 lab: like Stock\BulkStockImportJob — ShouldBeUnique, no uniqueId(), no uniqueFor.
class BulkStockImportLikeJob implements ShouldQueue, ShouldBeUnique {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public function __construct(public string $tenant, public int $startingRow) {}
    public function handle(): void {}
}
