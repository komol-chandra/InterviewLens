# 05 — Networking & Subnetting ⭐ (Day 5)

> **This is the single highest-value topic** — subnetting appeared verbatim in real WellDev tests.
> **Goal:** given IP + mask → network address in under 2 minutes.

---

## 1. IP address basics
- IPv4 = 32 bits = 4 octets (e.g. `192.168.2.100`), each 0–255.
- A mask splits the address into **network part** (1-bits) + **host part** (0-bits).
- **CIDR** `/n` = number of network bits. `/24` = 24 network bits = `255.255.255.0`.

## 2. The magic: "block size" method
**Block size = 256 − (mask octet value)** for the octet where the mask isn't 255.

| CIDR | Mask | Block size | Usable hosts |
|------|------|-----------|--------------|
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /27 | 255.255.255.224 | 32 | 30 |
| /28 | 255.255.255.240 | 16 | 14 |
| /30 | 255.255.255.252 | 4 | 2 |

- **Total addresses in block** = 2^(host bits) = block size.
- **Usable hosts** = block size − 2 (subtract network address + broadcast).

## 3. Steps to find the network address
1. Find the octet the mask "acts on" (the non-255, non-0 octet).
2. Block size = 256 − mask value there.
3. Network address = largest multiple of block size **≤ the IP's octet value**.
4. Broadcast = next multiple − 1. Host range = network+1 … broadcast−1.

---

## 4. THE reported question (solve it cold)
**Q: IP `192.168.2.100`, mask `255.255.255.192` (/26) — network address?**

- Mask acts on the **4th octet** (192). Block size = 256 − 192 = **64**.
- Multiples of 64: 0, **64**, 128, 192.
- IP's 4th octet = 100 → largest multiple ≤ 100 is **64**.
- **Network address = `192.168.2.64`** ✅
- **Broadcast = `192.168.2.127`** (next block 128, minus 1).
- **Host range = `192.168.2.65` – `192.168.2.126`** (62 usable hosts).

## 5. More worked drills
**`10.0.0.200` /27 (255.255.255.224):** block = 32 → multiples 0,32,…,192,**224**? 200 falls in 192–223 → network `10.0.0.192`, broadcast `10.0.0.223`, hosts .193–.222 (30 hosts).

**`172.16.5.10` /30 (255.255.255.252):** block = 4 → 10 falls in 8–11 → network `172.16.5.8`, broadcast `172.16.5.11`, hosts .9–.10 (2 hosts — classic point-to-point link).

---

## 6. OSI vs TCP/IP model
**OSI 7 layers** (mnemonic: *Please Do Not Throw Sausage Pizza Away*):
1. **Physical** — cables, bits
2. **Data-link** — MAC, switches, frames
3. **Network** — IP, routers, packets
4. **Transport** — TCP/UDP, ports, segments
5. **Session** — connections
6. **Presentation** — encryption, encoding
7. **Application** — HTTP, DNS, FTP

**TCP/IP (4 layers):** Application, Transport, Internet, Network Access.

## 7. TCP vs UDP
| | TCP | UDP |
|---|-----|-----|
| Reliability | Reliable, ordered, ACKs | Best-effort, no guarantee |
| Speed | Slower | Faster |
| Use | Web, email, file transfer | Video, voice, gaming, DNS |
| Connection | Handshake (3-way) | Connectionless |

## 8. Common ports
| Port | Service |
|------|---------|
| 20/21 | FTP |
| 22 | SSH |
| 23 | Telnet |
| 25 | SMTP (email send) |
| 53 | DNS |
| 80 | HTTP |
| 443 | HTTPS |
| 3306 | MySQL |

## 9. DNS & HTTP flow (30-second version)
1. Browser asks **DNS** to resolve `example.com` → IP.
2. **TCP 3-way handshake** (SYN → SYN-ACK → ACK) to that IP:443.
3. **TLS** handshake for HTTPS (encryption).
4. HTTP **GET** request → server responds with status + body.

---

## 10. Practice MCQs

1. `/26` subnet mask is: a) 255.255.255.0 b) **255.255.255.192** c) 255.255.255.224 d) 255.255.255.128
2. Block size of a /27: a) 64 b) **32** c) 16 d) 128
3. Network address of `192.168.2.100` /26: a) 192.168.2.0 b) **192.168.2.64** c) 192.168.2.100 d) 192.168.2.128
4. Usable hosts in a /26: a) 64 b) **62** c) 60 d) 30
5. Which is connectionless? a) TCP b) **UDP** c) HTTP d) FTP
6. DNS default port: a) 80 b) 443 c) **53** d) 25
7. Routers operate at OSI layer: a) 2 b) **3 (Network)** c) 4 d) 7
8. HTTPS uses port: a) 80 b) **443** c) 8080 d) 22
9. TCP handshake is: a) 2-way b) **3-way (SYN, SYN-ACK, ACK)** c) 4-way d) None
10. Broadcast address of `192.168.2.64` /26: a) 192.168.2.63 b) **192.168.2.127** c) 192.168.2.128 d) 192.168.2.255

### Answer Key
1-b, 2-b, 3-b, 4-b, 5-b, 6-c, 7-b, 8-b, 9-b, 10-b

---

## 11. Common Traps
- Usable hosts = block size **− 2** (network + broadcast reserved). /30 gives only **2** usable.
- Don't confuse mask value with block size: /26 mask octet = 192, block size = **64**.
- Routers = layer 3 (IP); switches = layer 2 (MAC).
- DNS mostly uses **UDP 53** (fast), TCP 53 for large transfers.
