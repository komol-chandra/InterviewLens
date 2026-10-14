// MC-2: Parking lot. Classic OOP / low-level design round.
// Run: npx -y tsx 5-tracks/design-patterns/machine-coding/parking-lot.ts
//
// Requirements I'd confirm out loud first:
//  - multiple floors, spots of size SMALL / MEDIUM / LARGE
//  - bike -> any spot, car -> MEDIUM or LARGE, truck -> LARGE only
//  - park returns a ticket; unpark(ticket) frees the spot and returns the fee
//  - fee depends on vehicle type and hours (pricing can change -> Strategy)
//  - show free spots per floor

enum SpotSize { SMALL = 1, MEDIUM = 2, LARGE = 3 }
enum VehicleType { BIKE = 'bike', CAR = 'car', TRUCK = 'truck' }

const MIN_SPOT: Record<VehicleType, SpotSize> = {
  [VehicleType.BIKE]: SpotSize.SMALL,
  [VehicleType.CAR]: SpotSize.MEDIUM,
  [VehicleType.TRUCK]: SpotSize.LARGE,
};

class Vehicle {
  constructor(readonly plate: string, readonly type: VehicleType) {}
}

class Spot {
  private vehicle: Vehicle | null = null;
  constructor(readonly id: string, readonly size: SpotSize) {}
  get free() { return this.vehicle === null; }
  fits(v: Vehicle) { return this.free && this.size >= MIN_SPOT[v.type]; }
  park(v: Vehicle) { if (!this.fits(v)) throw new Error(`spot ${this.id} cannot take ${v.plate}`); this.vehicle = v; }
  leave() { this.vehicle = null; }
}

class Floor {
  constructor(readonly level: number, readonly spots: Spot[]) {}
  // Best fit: smallest spot that fits, so a bike doesn't take a truck spot.
  findSpot(v: Vehicle): Spot | undefined {
    return this.spots.filter((s) => s.fits(v)).sort((a, b) => a.size - b.size)[0];
  }
  freeCount() { return this.spots.filter((s) => s.free).length; }
}

class Ticket {
  constructor(readonly id: string, readonly vehicle: Vehicle, readonly spot: Spot, readonly floor: number, readonly entryAt: number) {}
}

// Strategy: pricing changes without touching the lot.
interface PricingStrategy { fee(t: Ticket, exitAt: number): number }

class HourlyPricing implements PricingStrategy {
  constructor(private readonly ratePerHour: Record<VehicleType, number>, private readonly freeMinutes = 15) {}
  fee(t: Ticket, exitAt: number) {
    const minutes = (exitAt - t.entryAt) / 60_000;
    if (minutes <= this.freeMinutes) return 0;
    return Math.ceil(minutes / 60) * this.ratePerHour[t.vehicle.type]; // started hour = full hour
  }
}

class ParkingLot {
  private active = new Map<string, Ticket>();   // ticketId -> ticket
  private byPlate = new Map<string, string>();  // plate -> ticketId (no double parking)
  private seq = 0;

  constructor(private readonly floors: Floor[], private readonly pricing: PricingStrategy, private readonly now = () => Date.now()) {}

  park(v: Vehicle): Ticket {
    if (this.byPlate.has(v.plate)) throw new Error(`${v.plate} is already parked`);
    for (const floor of this.floors) {          // lowest floor first
      const spot = floor.findSpot(v);
      if (spot) {
        spot.park(v);
        const t = new Ticket(`T${++this.seq}`, v, spot, floor.level, this.now());
        this.active.set(t.id, t);
        this.byPlate.set(v.plate, t.id);
        return t;
      }
    }
    throw new Error(`lot full for ${v.type}`);
  }

  unpark(ticketId: string): number {
    const t = this.active.get(ticketId);
    if (!t) throw new Error(`invalid or used ticket ${ticketId}`);
    const fee = this.pricing.fee(t, this.now());
    t.spot.leave();
    this.active.delete(ticketId);
    this.byPlate.delete(t.vehicle.plate);
    return fee;
  }

  availability() {
    return this.floors.map((f) => ({ floor: f.level, free: f.freeCount() }));
  }
}

// ---------- tests ----------
function assert(cond: boolean, msg: string) { if (!cond) throw new Error('FAIL: ' + msg); console.log('ok  ', msg); }

let clock = 0;
const HOUR = 3_600_000;
const lot = new ParkingLot(
  [
    new Floor(0, [new Spot('0-S1', SpotSize.SMALL), new Spot('0-M1', SpotSize.MEDIUM)]),
    new Floor(1, [new Spot('1-L1', SpotSize.LARGE), new Spot('1-M1', SpotSize.MEDIUM)]),
  ],
  new HourlyPricing({ bike: 10, car: 30, truck: 80 }),
  () => clock,
);

const bike = lot.park(new Vehicle('BIKE-1', VehicleType.BIKE));
assert(bike.spot.id === '0-S1', 'bike gets the small spot (best fit)');
const car = lot.park(new Vehicle('CAR-1', VehicleType.CAR));
assert(car.spot.id === '0-M1', 'car gets medium on floor 0');
const truck = lot.park(new Vehicle('TRK-1', VehicleType.TRUCK));
assert(truck.floor === 1 && truck.spot.id === '1-L1', 'truck goes to floor 1 large spot');

let threw = false;
try { lot.park(new Vehicle('TRK-2', VehicleType.TRUCK)); } catch { threw = true; }
assert(threw, 'second truck rejected: no large spot left');
threw = false;
try { lot.park(new Vehicle('CAR-1', VehicleType.CAR)); } catch { threw = true; }
assert(threw, 'same plate cannot park twice');

clock = 2.5 * HOUR;
assert(lot.unpark(car.id) === 90, 'car 2.5h -> 3 started hours x 30 = 90');
clock = 2.5 * HOUR + 10 * 60_000;
const car2 = lot.park(new Vehicle('CAR-2', VehicleType.CAR));
clock += 10 * 60_000;
assert(lot.unpark(car2.id) === 0, 'under 15 free minutes -> 0');
threw = false;
try { lot.unpark(car.id); } catch { threw = true; }
assert(threw, 'a used ticket cannot be reused');
console.log(lot.availability());

// Follow-ups: concurrency (two gates parking into the same spot -> lock per spot,
// or a DB row with `UPDATE spots SET vehicle=? WHERE id=? AND vehicle IS NULL`),
// EV charging spots (new SpotSize/feature flag), payment as a separate service,
// persistence (spots/tickets tables), display boards = Observer on availability.
