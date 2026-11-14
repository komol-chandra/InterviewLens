<?php return [
  'default' => 'redis',
  'connections' => ['redis' => ['driver' => 'redis', 'connection' => 'default', 'queue' => 'default',
                    'retry_after' => (int) (getenv('RETRY_AFTER') ?: 9000), 'block_for' => null]],
  'failed' => ['driver' => 'null'],
];
