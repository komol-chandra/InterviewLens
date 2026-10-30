<?php return [
  'name' => 'lab', 'env' => 'local', 'debug' => true, 'timezone' => 'UTC', 'cipher' => 'AES-256-CBC',
  'key' => 'base64:' . base64_encode(str_repeat('k', 32)),
  'providers' => [
    Illuminate\Bus\BusServiceProvider::class, Illuminate\Cache\CacheServiceProvider::class,
    Illuminate\Database\DatabaseServiceProvider::class, Illuminate\Encryption\EncryptionServiceProvider::class,
    Illuminate\Filesystem\FilesystemServiceProvider::class, Illuminate\Queue\QueueServiceProvider::class,
    Illuminate\Redis\RedisServiceProvider::class, Illuminate\Foundation\Providers\ConsoleSupportServiceProvider::class, Illuminate\Foundation\Providers\FoundationServiceProvider::class,
  ],
];
