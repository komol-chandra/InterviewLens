<?php return [
  'default' => 'sqlite',
  'connections' => ['sqlite' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '']],
  'redis' => [
    'client' => getenv('REDIS_CLIENT') ?: 'phpredis',
    'options' => ['prefix' => 'lab_database_'],
    'default' => ['host' => 'redis', 'port' => 6379, 'database' => 0],
    'cache' => ['host' => 'redis', 'port' => 6379, 'database' => 1],
  ],
];
