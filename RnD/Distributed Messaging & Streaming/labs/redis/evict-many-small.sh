docker run -d --name t9lab-redis-small redis:7-alpine redis-server --maxmemory 4mb >/dev/null; sleep 1
r() { docker exec t9lab-redis-small redis-cli "$@"; }
FILL='for i=1,tonumber(ARGV[1]) do redis.call("SET","lab_cache:report:"..i,string.rep("x",200),"EX",3600) end return "ok"'
for policy in noeviction allkeys-lru volatile-lru; do
  r FLUSHALL >/dev/null; r CONFIG SET maxmemory-policy $policy >/dev/null; r CONFIG RESETSTAT >/dev/null
  r RPUSH lab_database_queues:default '{"job":"ApproveOrder"}' >/dev/null
  echo "== $policy"; echo -n "fill cache: "; r EVAL "$FILL" 0 40000
  echo -n "push a job: "; r RPUSH lab_database_queues:default '{"job":"SecondaryOrderSummaryJob"}'
  echo -n "queue still there (EXISTS): "; r EXISTS lab_database_queues:default
  r INFO memory | grep -E "^used_memory_human|^maxmemory_human"; r INFO stats | grep evicted_keys
done
docker rm -f t9lab-redis-small >/dev/null
