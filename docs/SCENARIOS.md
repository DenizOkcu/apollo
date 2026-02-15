# Scenario Scripts

Each scenario is a timed, narrated experience that guides the user through a real Apollo 11 moment. The user can interact with the DSKY during scenarios; certain steps pause and wait for specific keypresses.

## Scenario 1: "The Landing" (P63 → P64 → P66 → P68)

**Duration**: ~3 minutes (compressed from the real ~12 minutes of powered descent)
**Difficulty**: Beginner-friendly (guided prompts)

### Script

```
T+0:00  NARRATE  "July 20, 1969. The Lunar Module 'Eagle' is about to begin
                  powered descent to the Moon's surface. The AGC is running
                  Program 63 — the braking phase."

T+0:03  STATE    program=63, verb=16, noun=62
                 r1=+05560 (5560 ft/sec absolute velocity)
                 r2=+00b00 (0 min 0 sec from ignition)
                 r3=+00000 (0 ft/sec delta-V)

T+0:05  NARRATE  "V16 N62: The computer is monitoring absolute velocity,
                  time from engine ignition, and accumulated delta-V."

T+0:07  NARRATE  "Press PRO to confirm descent engine ignition."
T+0:07  WAIT_KEY PRO

T+0:08  STATE    lights.compActy=flash
                 Begin telemetry: velocity decreasing from 5560→500,
                 altitude from 50000→500, time counting up, deltaV increasing

T+0:10  NARRATE  "Engine ignition! The descent engine is throttling up.
                  Watch the velocity drop as Eagle decelerates."

-- Simulated telemetry runs for 30 seconds, updating R1/R2/R3 every second --

T+0:40  NARRATE  "The computer transitions to Program 64 — the approach phase.
                  The crew can now see the landing site ahead."
T+0:40  STATE    program=64, verb=16, noun=64
                 (switch display to LPD angle / alt rate / altitude)

T+0:55  NARRATE  "Program 66 — manual landing phase. Buzz Aldrin calls out
                  altitude and descent rate. Neil Armstrong is flying."
T+0:55  STATE    program=66, verb=16, noun=60
                 r1=+00120 (12.0 ft/sec horizontal)
                 r2=-00032 (-3.2 ft/sec descent rate)
                 r3=+00200 (200 feet altitude)

-- Telemetry: altitude decreasing 200→0, rates decreasing --

T+1:20  NARRATE  "'60 seconds.' — Charlie Duke (CapCom). 60 seconds of fuel."

T+1:40  NARRATE  "'30 seconds.' Fuel running low."

T+1:50  STATE    r1=+00005 (0.5 ft/sec horizontal)
                 r2=-00010 (-1.0 ft/sec descent)
                 r3=+00003 (3 feet)

T+1:55  NARRATE  "'Contact light!' A probe beneath a landing leg has touched
                  the surface."
T+1:55  STATE    r2=+00000, r3=+00000
                 program=68

T+2:00  NARRATE  "Program 68 — Landing Confirmation. The AGC wants you to
                  confirm the landing. Press PRO."
T+2:00  STATE    verb=6, noun=43, verbNounFlash=true
                 r1=+00068 (0.68 deg latitude — Tranquility Base)
                 r2=+02337 (23.37 deg longitude)
                 r3=+00000 (altitude: surface)

T+2:00  WAIT_KEY PRO

T+2:02  NARRATE  "'Houston, Tranquility Base here. The Eagle has landed.'
                  — Neil Armstrong"
T+2:05  STATE    verbNounFlash=false, all lights off except PROG=00
T+2:08  NARRATE  "You just landed on the Moon."
```

### Simulated Telemetry Curves

For N60 (horizontal velocity / altitude rate / altitude):
```
Altitude:     50000 → 7500 → 500 → 100 → 50 → 10 → 3 → 0  (exponential decay)
Alt rate:       -75 →  -40 →  -12 →  -5 → -3 → -1 → 0      (approaching zero)
Horiz vel:     1200 →  200 →   50 →  20 → 10 →  2 → 0      (approaching zero)
```

## Scenario 2: "The 1202 Alarm"

**Duration**: ~2 minutes
**Difficulty**: Intermediate (some explanation of alarms)

### Script

```
T+0:00  NARRATE  "It's 6 minutes into powered descent. Program 63 is guiding
                  Eagle toward the landing site. Everything seems nominal..."

T+0:03  STATE    program=63, verb=16, noun=62
                 r1=+02800 (2800 ft/sec)
                 r2=+06b12 (6 min 12 sec from ignition)
                 r3=+02500 (2500 ft/sec delta-V)

T+0:08  NARRATE  "Suddenly — the PROG alarm light turns on!"
T+0:08  STATE    lights.progAlm=true, lights.compActy=flash
                 verb=5, noun=9, verbNounFlash=true
                 r1=+01202, r2=+00000, r3=+00000

T+0:09  NARRATE  "1202 — EXECUTIVE OVERFLOW. The computer's job scheduler
                  has run out of core sets. Too many tasks are competing for
                  the CPU. The rendezvous radar is sending unexpected data."

T+0:13  NARRATE  "But the AGC was designed for this. It restarts, sheds
                  low-priority tasks, and resumes guidance within seconds."
T+0:13  STATE    lights.restart=true

T+0:16  NARRATE  "In Mission Control, 26-year-old Steve Bales calls: 'We're GO
                  on that alarm.' The landing continues."

T+0:18  NARRATE  "Press RSET to acknowledge the alarm, then KEY REL to return
                  to the landing display."
T+0:18  WAIT_KEY RSET

T+0:19  STATE    lights.oprErr=false, lights.progAlm=false

T+0:19  WAIT_KEY KEY_REL

T+0:20  STATE    verb=16, noun=62, verbNounFlash=false
                 lights.keyRel=false, lights.restart=false
                 r1=+02650 (velocity still decreasing — guidance resumed!)
                 r2=+06b28
                 r3=+02650

T+0:22  NARRATE  "The computer recovered in under 2 seconds. Guidance is
                  nominal. The 1202 alarm fired 4 more times during descent,
                  plus one 1201 alarm. Each time, the AGC recovered."

T+0:28  NARRATE  "This is why Margaret Hamilton's priority-based restart
                  system was one of the most important software designs
                  in history."
```

## Scenario 3: "Explore Freely" (Free Play)

**Duration**: Unlimited
**Difficulty**: Any

### Setup

```
T+0:00  STATE    program=0, verb=null, noun=null
                 r1=blank, r2=blank, r3=blank
                 all lights off, clock running from 102:30:00 (landing GET)

T+0:00  NARRATE  "You have full control of the DSKY. Try these commands:"

T+0:02  NARRATE  "  V35 ENTER — Lamp test (light up everything)"
T+0:03  NARRATE  "  V16 N36 ENTER — Display mission clock"
T+0:04  NARRATE  "  V16 N43 ENTER — Display position (lat/long/alt)"
T+0:05  NARRATE  "  V37 ENTER 63 ENTER — Start the landing program"
T+0:06  NARRATE  "  Type VERB then digits, NOUN then digits, then ENTER."
T+0:07  NARRATE  "  If you make a mistake, the OPR ERR light will tell you!"
```

### Supported Free-Play Commands

The emulator should handle these verb/noun combos gracefully:

| Command | Result |
|---------|--------|
| V35 E | All segments and lights ON for 5 seconds |
| V16 N36 E | Monitor clock (auto-updating) |
| V06 N43 E | Display lat/long/alt (simulated Tranquility Base coords) |
| V16 N60 E | Monitor velocity/altitude (static or from scenario) |
| V16 N62 E | Monitor velocity/time/deltaV |
| V06 N68 E | Display range/time/altitude |
| V37 E 00 E | Go to P00 (idle) |
| V37 E 63 E | Start P63 (triggers landing scenario data) |
| V05 N09 E | Display alarm codes |
| V36 E | Fresh start |
| Any invalid combo | OPR ERR light turns on |

## Scenario 4: "Lamp Test" (Quick Demo)

**Duration**: 15 seconds
**Difficulty**: Beginner

```
T+0:00  NARRATE  "Let's test all DSKY displays. Press VERB 3 5 ENTER."
T+0:00  WAIT_KEY sequence: V, 3, 5, ENTER

T+0:01  STATE    All segments ON (8s in every position)
                 All indicator lights ON
                 All signs show +

T+0:03  NARRATE  "Every segment and light is now active. The real astronauts
                  used this to verify the display hardware before critical
                  operations."

T+0:08  STATE    Restore previous state
T+0:08  NARRATE  "Lamp test complete. All systems nominal."
```

## Narration Display

Narration text appears in a scrolling panel below or beside the DSKY. Styled as:
- Monospace font (terminal feel)
- New messages append with a typing animation (50ms per character)
- Older messages fade slightly
- Timestamps shown as `[T+MM:SS]` prefix
- Quotes from astronauts/mission control in italics
