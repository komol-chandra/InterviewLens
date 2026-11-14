// MC-1: LRU cache. get/put in O(1), evict the least recently used when full.
// Run: npx -y tsx 5-tracks/design-patterns/machine-coding/lru-cache.ts

// ---------- Version 1 (say this first, 5 minutes): JS Map keeps insertion order ----------
class LruMap<K, V> {
  private map = new Map<K, V>();
  constructor(private readonly capacity: number) {
    if (capacity < 1) throw new Error('capacity must be >= 1');
  }
  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const v = this.map.get(key)!;
    this.map.delete(key); // move to the "most recent" end
    this.map.set(key, v);
    return v;
  }
  put(key: K, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.capacity) this.map.delete(this.map.keys().next().value as K); // oldest
    this.map.set(key, value);
  }
  get size() { return this.map.size; }
}

// ---------- Version 2 (what they usually want): hash map + doubly linked list ----------
// head <-> ... <-> tail. head.next = most recent, tail.prev = least recent.
class Node<K, V> {
  prev: Node<K, V> | null = null;
  next: Node<K, V> | null = null;
  constructor(public key: K, public value: V) {}
}

class LruCache<K, V> {
  private index = new Map<K, Node<K, V>>();
  private head = new Node<K, V>(null as K, null as V); // sentinels: no null checks at the ends
  private tail = new Node<K, V>(null as K, null as V);

  constructor(private readonly capacity: number, private readonly onEvict?: (k: K, v: V) => void) {
    if (capacity < 1) throw new Error('capacity must be >= 1');
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: K): V | undefined {
    const node = this.index.get(key);
    if (!node) return undefined;
    this.unlink(node);
    this.pushFront(node);
    return node.value;
  }

  put(key: K, value: V): void {
    const existing = this.index.get(key);
    if (existing) {
      existing.value = value;
      this.unlink(existing);
      this.pushFront(existing);
      return;
    }
    if (this.index.size >= this.capacity) {
      const lru = this.tail.prev!;
      this.unlink(lru);
      this.index.delete(lru.key);
      this.onEvict?.(lru.key, lru.value);
    }
    const node = new Node(key, value);
    this.pushFront(node);
    this.index.set(key, node);
  }

  delete(key: K): boolean {
    const node = this.index.get(key);
    if (!node) return false;
    this.unlink(node);
    return this.index.delete(key);
  }

  get size() { return this.index.size; }

  // most recent first, for debugging/tests
  keys(): K[] {
    const out: K[] = [];
    for (let n = this.head.next; n && n !== this.tail; n = n.next) out.push(n.key);
    return out;
  }

  private unlink(n: Node<K, V>) {
    n.prev!.next = n.next;
    n.next!.prev = n.prev;
    n.prev = n.next = null;
  }
  private pushFront(n: Node<K, V>) {
    n.next = this.head.next;
    n.prev = this.head;
    this.head.next!.prev = n;
    this.head.next = n;
  }
}

// ---------- tests ----------
function assert(cond: boolean, msg: string) { if (!cond) throw new Error('FAIL: ' + msg); console.log('ok  ', msg); }

for (const [name, make] of [['Map', () => new LruMap<string, number>(2)], ['List', () => new LruCache<string, number>(2)]] as const) {
  console.log(`-- ${name} version`);
  const c = make();
  c.put('a', 1); c.put('b', 2);
  assert(c.get('a') === 1, 'get a -> 1 (a becomes most recent)');
  c.put('c', 3); // evicts b, not a
  assert(c.get('b') === undefined, 'b was evicted (least recent)');
  assert(c.get('a') === 1 && c.get('c') === 3, 'a and c still there');
  c.put('a', 10); // update keeps size, refreshes recency
  assert(c.size === 2 && c.get('a') === 10, 'update existing key does not grow size');
}

const evicted: string[] = [];
const c = new LruCache<string, number>(3, (k) => evicted.push(k));
['x', 'y', 'z', 'w'].forEach((k, i) => c.put(k, i));
assert(evicted.join() === 'x', 'onEvict called with x');
assert(c.keys().join() === 'w,z,y', 'order is most-recent first');
assert(c.delete('z') && c.keys().join() === 'w,y', 'delete unlinks node');

// Follow-ups to mention: TTL per entry (store expiresAt, check on get),
// thread safety (a mutex around get/put in other languages; Node is single-threaded),
// distributed LRU = Redis with maxmemory-policy allkeys-lru.
