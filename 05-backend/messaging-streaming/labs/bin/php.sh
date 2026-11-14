#!/usr/bin/env bash
# PHP 8.3 (memo-phptest:jpeg: phpredis + pcntl + sqlite) on the lab network, with DistroSaaS's vendor mounted READ-ONLY.
# usage (from labs/): bin/php.sh [-e VAR=val ...] -- <script.php|sh> [args]
LABS=$(cd "$(dirname "$0")/.." && pwd)
VENDOR=${APP_VENDOR:?export APP_VENDOR=/path/to/api-server/vendor}
envs=(); while [ "$1" != "--" ]; do envs+=("$1"); shift; done; shift
cmd=php; if [ "$1" = sh ]; then cmd=sh; shift; fi
docker run --rm --network t9lab_default "${envs[@]}" -v "$VENDOR":/srv/vendor:ro -v "$LABS":/lab -w /lab memo-phptest:jpeg $cmd "$@"
