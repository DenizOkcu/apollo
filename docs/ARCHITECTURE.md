# Architecture

## Data Flow

```
  Physical Keyboard / Click
        │
        ▼
  ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
  │  keyboard.ts │────▶│   cpu.ts      │────▶│  display.ts  │
  │  (input FSM) │     │  (dispatch)   │     │  (render)    │
  └─────────────┘     └──────┬───────┘     └──────────────┘
                             │                     ▲
                      ┌──────▼───────┐             │
                      │  state.ts    │─────────────┘
                      │  (AGC state) │
                      └──────┬───────┘
                             │
                      ┌──────▼───────┐
                      │  scenario    │  (injects state changes
                      │  runner      │   on timers for guided
                      └──────────────┘   experiences)
```

1. User presses a key (physical keyboard or DSKY button click)
2. `keyboard.ts` processes the key through the input state machine (mirrors CHARIN in PINBALL)
3. On ENTER, `cpu.ts` dispatches the verb/noun pair → runs the appropriate handler
4. Handler reads/writes `state.ts` (registers, flags, memory)
5. `display.ts` observes state changes and re-renders the DSKY panel
6. Scenarios inject state changes on timers (simulated telemetry)

## Module Details

### `core/state.ts` — Central AGC State

```typescript
interface AGCState {
  // Display registers
  verb: number | null;         // 0-99
  noun: number | null;         // 0-99
  program: number | null;      // 0-99 (major mode)

  // Data registers: each is { sign: '+' | '-' | null, value: number | null }
  r1: RegisterValue;
  r2: RegisterValue;
  r3: RegisterValue;

  // Indicator lights (boolean each)
  lights: {
    compActy: boolean;    // COMP ACTY — computer activity
    uplinkActy: boolean;  // uplink in progress
    noAtt: boolean;       // no attitude reference
    stby: boolean;        // standby
    keyRel: boolean;      // key release needed
    oprErr: boolean;      // operator error
    temp: boolean;        // temperature caution
    gimbalLock: boolean;  // gimbal lock warning
    progAlm: boolean;     // program alarm
    restart: boolean;     // AGC restart occurred
    tracker: boolean;     // tracker on
    alt: boolean;         // altitude warning
    vel: boolean;         // velocity warning
  };

  // Flash state
  verbNounFlash: boolean;  // is verb/noun display flashing?

  // Input state machine
  inputState: InputState;  // 'idle' | 'awaitingVerb' | 'awaitingNoun' | 'awaitingData'
  inputBuffer: string;     // accumulated digit input
  inputTarget: 'verb' | 'noun' | 'r1' | 'r2' | 'r3' | null;

  // Clock
  missionElapsedTime: number;  // centiseconds since epoch
  clockRunning: boolean;

  // Alarm registers
  failreg: [number, number, number];  // up to 3 alarm codes

  // Monitor state
  monitorActive: boolean;
  monitorVerb: number | null;
  monitorNoun: number | null;

  // Simulated navigation (for scenarios)
  nav: {
    altitude: number;        // feet
    altitudeRate: number;    // ft/sec
    horizontalVelocity: number;  // ft/sec
    absVelocity: number;     // ft/sec
    latitude: number;        // degrees
    longitude: number;       // degrees
    deltaV: number;          // ft/sec accumulated
    timeFromIgnition: number; // centiseconds
    range: number;           // nautical miles
    rangeRate: number;       // ft/sec
  };
}
```

State changes emit events so the display auto-updates. A simple `EventEmitter` or
`Proxy`-based reactivity system is sufficient (no framework needed).

### `core/cpu.ts` — Verb/Noun Dispatch

The CPU module processes completed verb/noun commands. It mirrors the AGC's VERBFAN dispatch table.

**Verb categories:**

| Range | Type | Behavior |
|-------|------|----------|
| 01-07 | Display | Format noun data, write to R1/R2/R3 once |
| 11-17 | Monitor | Same as display, but refresh every 1 second |
| 21-25 | Load | Flash V/N, accept digits into R1/R2/R3, write to noun address |
| 33 | Proceed | Resume program without new data |
| 34 | Terminate | Cancel current operation |
| 35 | Lamp test | All segments and lights ON |
| 36 | Fresh start | Reset to P00 |
| 37 | Change program | Load a new major mode |
| 50 | Please perform | "Checklist" — display with flash, await astronaut |
| 82-99 | Extended | Scenario-specific actions (orbit display, enable engine, etc.) |

Not every verb needs full implementation — unrecognized verbs trigger the OPR ERR light,
which is itself an authentic behavior.

### `core/nouns.ts` — Noun Definitions

Each noun maps to:
- A human-readable description (for tooltips)
- Number of components (1, 2, or 3)
- Scale/format type per component (octal, decimal, degrees, time HMS, time MS, velocity, distance, etc.)
- A getter function that reads from `state.nav` or `state.clock` etc.

Example:
```typescript
const NOUNS: Record<number, NounDef> = {
  36: {
    desc: "AGC clock time",
    components: 3,
    formats: ['hours', 'minutes', 'seconds'],
    get: (state) => [
      Math.floor(state.missionElapsedTime / 360000),  // hours
      Math.floor((state.missionElapsedTime % 360000) / 6000),  // minutes
      (state.missionElapsedTime % 6000) / 100,  // seconds.xx
    ],
  },
  60: {
    desc: "Horizontal velocity / altitude rate / altitude",
    components: 3,
    formats: ['velocity_10', 'velocity_10', 'feet'],
    get: (state) => [
      state.nav.horizontalVelocity,
      state.nav.altitudeRate,
      state.nav.altitude,
    ],
  },
  // ...
};
```

### `core/alarm.ts` — Alarm System

- `triggerAlarm(code)` → stores in `failreg`, turns on PROG ALM light
- `displayAlarms()` → shows V05 N09 with failreg values in R1/R2/R3
- `clearAlarms()` → clears failreg and PROG ALM light

### `core/clock.ts` — Mission Clock

- `setInterval` at 10ms (centisecond resolution)
- Drives `state.missionElapsedTime`
- Scenarios can set/offset the clock to match mission timeline

### `dsky/display.ts` — Display Renderer

Renders the DSKY panel into the DOM. Two approaches for 7-segment digits:

**Option A: CSS-based segments** — 7 divs per digit, toggled by class. Authentic look, easy glow effects.

**Option B: SVG segments** — scalable, crisp at any size, easier to animate.

Recommendation: **CSS-based**, matching the real DSKY's electroluminescent green-on-dark aesthetic.

Display update loop:
1. Read state.verb, state.noun, state.program → render 2-digit fields
2. Read state.r1/r2/r3 → render sign + 5 digits each
3. Read state.lights → toggle indicator light classes
4. If verbNounFlash → CSS animation toggling visibility at ~1.5Hz

### `dsky/keyboard.ts` — Input State Machine

Maps physical keys and DSKY button clicks to the AGC CHARIN state machine:

| Physical Key | DSKY Key | AGC Code |
|-------------|----------|----------|
| V | VERB | Start verb input |
| N | NOUN | Start noun input |
| Enter | ENTR | Execute/accept |
| + | + | Positive sign |
| - | - | Negative sign |
| C | CLR | Clear/backspace |
| R | RSET | Error reset |
| P | PRO | Proceed |
| K | KEY REL | Key release |
| 0-9 | 0-9 | Digit entry |

State transitions:
```
IDLE ──VERB──▶ AWAITING_VERB_DIGITS ──ENTER──▶ verb stored
IDLE ──NOUN──▶ AWAITING_NOUN_DIGITS ──ENTER──▶ noun stored
       (after both set)     ──ENTER──▶ dispatch verb(noun)
LOAD_VERB active ──sign──▶ AWAITING_R1_DIGITS ──ENTER──▶ R1 stored ──▶ R2... ──▶ R3...
```

### `dsky/segments.ts` — 7-Segment Encoding

The real AGC used 5-bit codes to drive segments. We map these to CSS classes:

```
Segment layout:
  ──a──
 |     |
 f     b
 |     |
  ──g──
 |     |
 e     c
 |     |
  ──d──

AGC 5-bit: bit4=b+c, bit3=a+d, bit2=f+e, bit1=g, bit0=b+c (alternate)

Digit → segments:
  0: a,b,c,d,e,f     (no g)
  1: b,c
  2: a,b,d,e,g
  3: a,b,c,d,g
  4: b,c,f,g
  5: a,c,d,f,g
  6: a,c,d,e,f,g
  7: a,b,c
  8: a,b,c,d,e,f,g
  9: a,b,c,d,f,g
blank: (none)
```

### `scenarios/scenario-runner.ts` — Scenario Engine

```typescript
interface ScenarioStep {
  time: number;          // ms from scenario start
  action: 'setState' | 'narrate' | 'waitForKey' | 'flash' | 'alarm';
  data: any;             // state patch, text, key name, alarm code, etc.
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  steps: ScenarioStep[];
}
```

The runner:
1. Starts a scenario, sets initial state
2. Processes steps in sequence (with delays)
3. `narrate` steps display text in a terminal-style sidebar
4. `waitForKey` pauses until the user presses the expected key(s)
5. `setState` injects simulated telemetry (altitude decreasing, velocity changing, etc.)

### `ui/panel.ts` — DSKY Panel Layout

Generates the HTML structure:

```
┌──────────────────────────────────────┐
│  [COMP ACTY]  ┌──────┐  [PROG]      │
│  [UPLINK]     │ PROG │  [VERB]      │
│  [NO ATT]     │  XX  │  [NOUN]      │
│  [STBY]       └──────┘              │
│  [KEY REL]    ┌──────┐ ┌──────┐     │
│  [OPR ERR]    │ VERB │ │ NOUN │     │
│  [TEMP]       │  XX  │ │  XX  │     │
│  [GIMBAL]     └──────┘ └──────┘     │
│  [PROG]       ┌────────────────┐     │
│  [RESTART]    │ R1  +XXXXX     │     │
│  [TRACKER]    │ R2  +XXXXX     │     │
│  [ALT]        │ R3  +XXXXX     │     │
│  [VEL]        └────────────────┘     │
│                                      │
│  ┌───┬───┬───┬───┬───┬───┬───┐      │
│  │ + │ 7 │ 8 │ 9 │CLR│PRO│KEY│      │
│  ├───┼───┼───┼───┤   │   │REL│      │
│  │ - │ 4 │ 5 │ 6 │   │   │   │      │
│  ├───┼───┼───┼───┤───┤───┤───│      │
│  │ 0 │ 1 │ 2 │ 3 │VRB│NOU│ENT│      │
│  │   │   │   │   │   │N  │R  │      │
│  └───┴───┴───┴───┴───┴───┴───┘      │
│             [RSET]                    │
└──────────────────────────────────────┘
```

### `ui/help.ts` — Education Layer

- Hovering/tapping a verb or noun number shows a tooltip with its meaning
- A persistent sidebar shows a scrolling "transcript" of actions taken
- Each transcript entry explains what just happened in plain English
- First visit shows a brief tutorial overlay

## Visual Design Notes

- **Background**: dark charcoal (#1a1a1a), simulating the DSKY metal panel
- **Digits**: electroluminescent green (#00ff41), with subtle glow (`text-shadow`)
- **Segment off-state**: barely visible dark green (#0a2a0a) — like unlit LCD segments
- **Indicator lights**: rectangular blocks, labeled in white, glow yellow/amber when active
- **CRT effect** (optional): subtle scanline overlay, slight vignette, mild curvature via CSS
- **Font**: monospace for terminal chrome; custom 7-segment CSS for the DSKY digits
- **Button style**: raised tactile look, with active/pressed states
