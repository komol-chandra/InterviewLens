# 01 — OOP & Design Patterns (Day 1)

> **Goal:** define all 4 pillars without looking + one-line each design pattern.

---

## 1. The 4 Pillars of OOP

### Encapsulation
Bundling data + methods in one class and **hiding internal state** behind access modifiers. Outside code touches data only through public methods (getters/setters).
- **Why:** protects data from invalid changes, keeps code maintainable.
- **Example:** `private double balance;` accessed via `deposit()` / `getBalance()` — no direct `account.balance = -999`.

### Abstraction
Showing **only essential features**, hiding the complex implementation. Achieved with abstract classes / interfaces.
- **Why:** users of a class don't need to know *how* it works, only *what* it does.
- **Example:** `car.drive()` — you press the pedal; the fuel injection logic is hidden.

### Inheritance
A child class **reuses** properties/methods of a parent class (`extends`).
- **Why:** avoids code duplication, models "is-a" relationships.
- **Example:** `class Dog extends Animal` — Dog gets `eat()` from Animal, adds `bark()`.

### Polymorphism
"Many forms" — the **same method call behaves differently** depending on the object.
- **Compile-time (overloading):** same method name, different parameters.
- **Run-time (overriding):** child class redefines a parent method.
- **Example:** `animal.speak()` → Dog prints "bark", Cat prints "meow".

> **Trap:** Abstraction hides *complexity/design*; Encapsulation hides *data*. Interviewers love this distinction.

---

## 2. Overloading vs Overriding

| | Overloading | Overriding |
|---|-------------|------------|
| When | Compile-time (static) | Run-time (dynamic) |
| Signature | Different params | Same signature |
| Classes | Same class | Parent + child |
| Example | `add(int,int)` & `add(int,int,int)` | Child's `toString()` replaces parent's |

---

## 3. Class vs Object vs Interface vs Abstract Class
- **Class** = blueprint. **Object** = instance of a class.
- **Interface** = contract, only method signatures (100% abstract), a class can implement many.
- **Abstract class** = partial implementation, cannot be instantiated, single inheritance.

---

## 4. Design Patterns (one-liners — memorize)

| Pattern | Type | Purpose |
|---------|------|---------|
| **Singleton** | Creational | Ensure only **one instance** exists (e.g. DB connection, config). |
| **Factory** | Creational | Create objects **without exposing `new`** / creation logic. |
| **Observer** | Behavioural | One-to-many: when subject changes, **notify all subscribers** (e.g. event listeners). |
| **Strategy** | Behavioural | **Swap an algorithm** at runtime via a common interface (e.g. payment methods). |
| **Decorator** | Structural | Add behaviour to an object **dynamically** without changing its class. |
| **Adapter** | Structural | Make two **incompatible interfaces** work together. |

---

## 5. Worked Example — OOP inheritance code
```java
class Animal {
    protected String name;
    Animal(String name) { this.name = name; }
    void speak() { System.out.println("Some sound"); }
}
class Dog extends Animal {          // inheritance
    Dog(String name) { super(name); }
    @Override
    void speak() { System.out.println(name + " says: Woof"); }  // polymorphism
}
// Usage
Animal a = new Dog("Rex");
a.speak();   // -> "Rex says: Woof"  (run-time polymorphism)
```

---

## 6. Practice MCQs

1. Which pillar hides an object's internal data behind methods?
   a) Inheritance b) **Encapsulation** c) Polymorphism d) Abstraction

2. Method overloading is resolved at:
   a) **Compile-time** b) Run-time c) Link-time d) Never

3. Which pattern guarantees a single instance?
   a) Factory b) Observer c) **Singleton** d) Strategy

4. `Dog extends Animal` demonstrates:
   a) Encapsulation b) **Inheritance** c) Abstraction d) Overloading

5. An interface in Java can have:
   a) Only fields b) **Method signatures (and default methods)** c) Constructors d) Private state only

6. Overriding requires:
   a) Different parameters b) **Same signature in child class** c) Same class d) Static methods

7. Which pattern notifies many objects when one changes?
   a) Strategy b) Adapter c) **Observer** d) Singleton

8. Abstraction is best described as:
   a) Hiding data b) **Hiding implementation complexity** c) Copying code d) Creating instances

9. Which is NOT an OOP pillar?
   a) Inheritance b) Polymorphism c) **Compilation** d) Encapsulation

10. Strategy pattern lets you:
    a) Create one instance b) **Swap algorithms at runtime** c) Adapt interfaces d) Hide fields

### Answer Key
1-b, 2-a, 3-c, 4-b, 5-b, 6-b, 7-c, 8-b, 9-c, 10-b

---

## 7. Common Traps
- "Abstraction vs Encapsulation" — abstraction = hide *complexity*, encapsulation = hide *data*.
- Overloading = compile-time, Overriding = run-time (don't swap these).
- A class can **implement multiple interfaces** but **extend only one class** (in Java/C#).
- Singleton is often criticized as a global-state anti-pattern — but for MCQs, "one instance" is the answer.
