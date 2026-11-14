# retry_after double run: one 12 s job ($timeout = 0), retry_after = 5, two workers. Run: bin/php.sh -e RETRY_AFTER=5 -- sh laravel/retry_after.sh
php laravel/artisan run laravel/dispatch_slow.php
php laravel/artisan queue:work redis --sleep=1 --max-time=30 --quiet &
sleep 1; php laravel/artisan queue:work redis --sleep=1 --max-time=30 --quiet &
wait
