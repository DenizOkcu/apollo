# Scenario Authoring Guide

How to create new interactive scenarios for the Apollo 11 AGC DSKY emulator.

---

## Architecture Overview

A scenario is a **linear sequence of steps** that control three things simultaneously:

| Panel | What it does | Step actions |
|---|---|---|
| **DSKY** (left) | 7-segment display, indicator lights, keypad | `setState`, `setNav`, `setLights`, `callback` |
| **Mission Log** (middle) | Narration text with typing animation | `narrate` |
| **AGC Source** (right) | Scrolling code from the real AGC codebase | `showCode` |

Steps execute **sequentially**. Each step has a `delay` (milliseconds to wait after the previous step finishes). The `waitForKey` action **blocks** — nothing advances until the user presses the expected key.

---

## Quick Start: Minimal Scenario

Create a new file at `app/src/scenarios/my-scenario.ts`:

```typescript
import type { Scenario } from './scenario-runner';

export const myScenario: Scenario = {
  id: 'my-scenario',
  title: 'My Scenario',
  steps: [
    {
      delay: 0,
      action: 'narrate',
      text: 'Welcome to my scenario.',
    },
    {
      delay: 2000,
      action: 'setState',
      stateChanges: { program: 40, verb: 16, noun: 62 },
    },
    {
      delay: 1000,
      action: 'narrate',
      text: 'Press V (VERB) to continue.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'VERB',
      keyHint: 'Press V (VERB) to proceed.',
    },
    {
      delay: 0,
      action: 'narrate',
      text: 'Done!',
    },
  ],
};
```

---

## Registering a Scenario

### Step 1 — Add to the scenario picker

Edit `app/src/ui/scenario-picker.ts`. Add an entry to the `SCENARIOS` array:

```typescript
const SCENARIOS: ScenarioChoice[] = [
  // ... existing scenarios ...
  {
    id: 'my-scenario',           // must match the Scenario.id
    title: 'My Scenario',        // shown on the card
    description: 'A short description shown on the scenario picker card.',
    difficulty: 'Guided',        // badge text: 'Guided', 'Open', 'Quick', etc.
  },
];
```

### Step 2 — Import and register in main.ts

Edit `app/src/main.ts`:

```typescript
import { myScenario } from './scenarios/my-scenario';

const SCENARIOS: Record<string, Scenario> = {
  // ... existing ...
  'my-scenario': myScenario,
};
```

The `id` string must match in all three places: the `Scenario` object, the picker array, and the `SCENARIOS` map key.

---

## Step Actions Reference

### `narrate` — Display text in the Mission Log

```typescript
{
  delay: 2000,          // wait 2s after previous step
  action: 'narrate',
  text: 'The narration text. Appears with a typing animation.',
  timestamp: 'T+05:30', // optional — shown as [T+05:30] prefix in green
}
```

- Text appears character-by-character (20ms per character).
- Use `timestamp` for mission event markers like `'T+00:00'`, `'PDI'`, `'T+12:39'`.
- Omit `timestamp` for general narration/dialogue.

### `setState` — Set DSKY display state

```typescript
{
  delay: 0,
  action: 'setState',
  stateChanges: {
    program: 63,           // PROG display (number or null)
    verb: 16,              // VERB display (number or null)
    noun: 62,              // NOUN display (number or null)
    verbNounFlash: true,   // flash the VERB/NOUN area (signals "awaiting input")
  },
}
```

Available fields on `stateChanges` (all optional, only set what you need):

| Field | Type | Description |
|---|---|---|
| `program` | `number \| null` | Program number shown in PROG field |
| `verb` | `number \| null` | Verb number |
| `noun` | `number \| null` | Noun number |
| `verbNounFlash` | `boolean` | Flash verb/noun (computer asking for PRO) |
| `r1` | `RegisterValue` | Register 1 (sign + 5 digits) |
| `r2` | `RegisterValue` | Register 2 |
| `r3` | `RegisterValue` | Register 3 |

A `RegisterValue` looks like:
```typescript
{ sign: '+' | '-' | null, digits: [1, 2, 3, 4, 5] }
// null sign = no sign shown
// null digit = blank segment
```

### `setNav` — Set navigation state values

```typescript
{
  delay: 0,
  action: 'setNav',
  navChanges: {
    altitude: 50000,            // feet
    altitudeRate: -75,          // ft/s (negative = descending)
    horizontalVelocity: 1200,   // ft/s
    absVelocity: 5560,          // ft/s
    latitude: 0.6875,           // degrees
    longitude: 23.4333,         // degrees
    deltaV: 0,                  // ft/s accumulated
    timeFromIgnition: 0,        // centiseconds
    range: 5,                   // nautical miles
    rangeRate: 0,               // ft/s
    apogee: 60,                 // nautical miles
    perigee: 9,                 // nautical miles
  },
}
```

Setting nav values alone does **not** update the display. You must also call `updateDisplayFromNav()` via a `callback` step (see pattern below).

### `setLights` — Toggle indicator lights

```typescript
{
  delay: 0,
  action: 'setLights',
  lightChanges: {
    prog: true,        // PROG alarm (red)
    restart: true,     // RESTART (red)
    oprErr: true,      // OPR ERR (red)
    gimbalLock: true,  // GIMBAL LOCK (orange)
    keyRel: true,      // KEY REL (amber)
    compActy: true,    // COMP ACTY (green)
    uplinkActy: true,  // UPLINK ACTY (amber)
    noAtt: true,       // NO ATT (amber)
    stby: true,        // STBY (amber)
    temp: true,        // TEMP (amber)
    tracker: true,     // TRACKER (amber)
    alt: true,         // ALT (amber)
    vel: true,         // VEL (amber)
  },
}
```

Light colors: `prog`, `restart`, `oprErr` = red; `gimbalLock` = orange; all others = amber; `compActy` = green.

### `waitForKey` — Block until the user presses a specific key

```typescript
{
  delay: 0,
  action: 'waitForKey',
  key: 'VERB',
  keyHint: 'Press V (VERB) to begin entering the command.',
}
```

- **This blocks the scenario.** No further steps execute until the key is pressed.
- `keyHint` is shown as a green highlighted prompt in the Mission Log.
- Always include `keyHint` — it tells the user what to do.

Available `key` values:
```
'0' '1' '2' '3' '4' '5' '6' '7' '8' '9'
'VERB' 'NOUN' 'ENTER' 'CLR' 'PRO' 'KEY_REL' 'RSET'
'PLUS' 'MINUS'
```

Keyboard shortcuts the user can press:
```
V=VERB  N=NOUN  Enter=ENTER  C/Backspace=CLR
P=PRO   K=KEY_REL   R=RSET   +/==PLUS   -=MINUS   0-9=digits
```

### `showCode` — Display AGC source code in the right panel

```typescript
import { MY_CODE_BLOCK } from '../core/agc-source';

{
  delay: 0,
  action: 'showCode',
  codeBlock: MY_CODE_BLOCK,
}
```

The code block animates in line-by-line (120ms per line). A separator is automatically added before each new block. See "Adding AGC Source Code Blocks" below.

### `callback` — Run arbitrary code

```typescript
{
  delay: 0,
  action: 'callback',
  callback: () => {
    // Any code — update state, start telemetry, trigger alarms, etc.
  },
}
```

Used for anything the other actions can't express: triggering alarms, starting/stopping telemetry, updating registers from nav, or complex multi-field state changes.

---

## Common Patterns

### Pattern: Update the DSKY registers from navigation values

When you set nav values and want them to appear on the DSKY, you need a helper function and a callback:

```typescript
import { state, notify } from '../core/state';
import { getNounDef, formatNounValue } from '../core/nouns';

function updateDisplayFromNav(): void {
  const noun = state.noun;
  if (noun === null) return;
  const def = getNounDef(noun);
  if (!def) return;
  const values = def.get(state);
  const regs: ('r1' | 'r2' | 'r3')[] = ['r1', 'r2', 'r3'];
  for (let i = 0; i < def.components && i < 3; i++) {
    const val = values[i];
    const fmt = def.formats[i];
    if (val !== null && val !== undefined) {
      const formatted = formatNounValue(val, fmt);
      state[regs[i]] = { sign: formatted.sign, digits: formatted.digits };
    }
  }
  notify('display');
}
```

Then the step sequence is:
```typescript
// 1. Set the verb/noun so the formatter knows which format to use
{ delay: 0, action: 'setState', stateChanges: { verb: 16, noun: 62 } },
// 2. Set the raw navigation values
{ delay: 0, action: 'setNav', navChanges: { absVelocity: 5560, ... } },
// 3. Format and push to display (small delay to ensure state is settled)
{ delay: 100, action: 'callback', callback: () => updateDisplayFromNav() },
```

### Pattern: Animated telemetry (values changing over time)

Use `startTelemetry()` to smoothly interpolate nav values over a duration:

```typescript
import { startTelemetry, stopTelemetry } from './scenario-runner';

// Start: values animate from → to over 30 seconds
{
  delay: 500,
  action: 'callback',
  callback: () => {
    startTelemetry(
      30000,  // duration in ms
      { absVelocity: 5560, altitude: 50000 },   // from
      { absVelocity: 800, altitude: 7500 },      // to
      () => updateDisplayFromNav()                // called every 500ms
    );
  },
},

// ... narration steps during the telemetry animation ...

// Stop when the phase is over
{ delay: 15000, action: 'callback', callback: () => stopTelemetry() },
```

Telemetry uses ease-out interpolation. Always `stopTelemetry()` before starting a new phase.

### Pattern: Trigger an alarm

```typescript
import { triggerAlarm, displayAlarms, clearAlarms } from '../core/alarm';

// 1. Trigger the alarm (sets PROG light, stores code in failreg)
{
  delay: 0,
  action: 'callback',
  callback: () => triggerAlarm(0o1202),
},
// 2. Display alarm codes on the DSKY (V05 N09)
{
  delay: 1000,
  action: 'callback',
  callback: () => displayAlarms(),
},
// 3. Later — clear alarms
{
  delay: 0,
  action: 'callback',
  callback: () => clearAlarms(),
},
```

Known alarm codes:
```
0o1201  — Executive overflow (no VAC areas)
0o1202  — Executive overflow (no core sets)
0o1203  — Waitlist overflow
0o1210  — IMU device busy
0o210   — IMU not operating
0o220   — IMU orientation not yet determined
0o404   — Guidance cycle not converging
0o777   — PIPA failure
```

### Pattern: Flash verb/noun for PRO confirmation

When the real AGC needed astronaut confirmation, the VERB/NOUN area flashed. Use:

```typescript
// Start flashing
{ delay: 0, action: 'setState', stateChanges: { verbNounFlash: true } },
// Wait for PRO
{ delay: 0, action: 'waitForKey', key: 'PRO', keyHint: 'Press P (PRO) to confirm.' },
// Stop flashing
{ delay: 0, action: 'setState', stateChanges: { verbNounFlash: false } },
```

### Pattern: Interactive DSKY command entry

Guide the user through entering a real verb/noun command:

```typescript
// Tell them what to type
{ delay: 2000, action: 'narrate', text: 'Type V 3 7 ENTER to request a program change.' },
// Wait for VERB key
{ delay: 0, action: 'waitForKey', key: 'VERB', keyHint: 'Press V (VERB) to begin.' },
// Wait for ENTER (they type the digits on their own)
{ delay: 0, action: 'narrate', text: 'Now type 3 7 and press ENTER.' },
{ delay: 0, action: 'waitForKey', key: 'ENTER', keyHint: 'Type 3 7 then press ENTER.' },
// Force-set the correct state in case they mistyped
{ delay: 500, action: 'setState', stateChanges: { verb: 37 } },
```

Always force-set the expected state after a user input sequence so the scenario can continue correctly even if they mistyped.

---

## Adding AGC Source Code Blocks

### Step 1 — Find interesting source code

Browse the real AGC source at `Apollo-11/Luminary099/` (Lunar Module) or `Apollo-11/Comanche055/` (Command Module). Key files with famous comments:

| File | What's in it |
|---|---|
| `THE_LUNAR_LANDING.agc` | P63-P68 landing programs, FLAGORGY, "PLEASE CRANK THE SILLY THING AROUND" |
| `BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc` | Ignition sequence, origin story, NOLI SE TANGERE |
| `ALARM_AND_ABORT.agc` | POODOO, BAILOUT, CURTAINS, WHIMPER |
| `FRESH_START_AND_RESTART.agc` | SLAP1, ENEMA, "DO NOT USE WITHOUT CONSULTING POOH PEOPLE" |
| `EXECUTIVE.agc` | NOVAC, FINDVAC — the job scheduler |
| `LUNAR_LANDING_GUIDANCE_EQUATIONS.agc` | GUILDENSTERN, "TEMPORARY I HOPE HOPE HOPE" |
| `PINBALL_GAME_BUTTONS_AND_LIGHTS.agc` | DSKY verb/noun interface origin story |
| `ASCENT_GUIDANCE.agc` | Lunar ascent (leave the Moon) |
| `P40-P47.agc` | SPS burns (orbital maneuvers) |
| `P70-P71.agc` | Abort programs |
| `GIMBAL_LOCK_AVOIDANCE.agc` | Gimbal lock handling |
| `KALMAN_FILTER.agc` | State estimation |
| `WAITLIST.agc` | Task scheduling |
| `SERVICER.agc` | Sensor integration |
| `R60_62.agc` | Attitude maneuver routines |
| `CONTROLLED_CONSTANTS.agc` | Physical constants, calibration |

### Step 2 — Create a code block

In `app/src/core/agc-source.ts`, add a new block using the `block()` helper:

```typescript
export const MY_NEW_BLOCK = block(
  'my-block-id',                          // unique id string
  'DESCRIPTIVE TITLE',                    // shown in the code panel header
  'SOURCE_FILE_NAME.agc',                // displayed as file attribution
  [
    '# COMMENT LINES START WITH #',
    '# These render in dim green.',
    '',
    'LABEL           TC      SOMETHING',  // labels render in amber
    '                CAF     ZERO',        // instructions render in dim green
    '                TS      TEMP',
    '',
    '# FAMOUS COMMENT OR DEV HUMOR',      // auto-highlighted if it matches patterns
    '',
    '                TC      ENDOFJOB',
  ]
);
```

#### Line classification rules (automatic):
- Lines starting with `#` → **comment** (dim green)
- Lines starting with `UPPERCASE_LABEL ` → **label** (amber, bold)
- Lines matching famous keyword patterns → **highlighted** (bright green, glowing, with left border)
- Everything else → **instruction** (dim green)

#### Auto-highlight keyword patterns

Comments containing these words are automatically highlighted bright green:

```
BURN.BABY  FLAGORGY  POODOO  CURTAINS  WHIMPER  BAILOUT
CRANK.*SILLY  OFF TO SEE  WIZARD  MAGNIFICENT  ASTRONAUT
HELLO  GOODBYE  TEMPORARY.*HOPE  NOLI SE TANGERE  HONI SOIT
ENEMA  POOH  GUILDENSTERN  PINBALL  HAMILTON  HISTORY
THE FOLLOWING  THIS ROUTINE  IMPORTANT  NOTE WELL
```

To add more highlight patterns, edit the `parseLine()` function's regex in `agc-source.ts`.

### Step 3 — Export and use in a scenario

```typescript
// In agc-source.ts — export the block
export const MY_NEW_BLOCK = block(...);

// In your scenario file — import and use
import { MY_NEW_BLOCK } from '../core/agc-source';

// In the steps array:
{ delay: 0, action: 'showCode', codeBlock: MY_NEW_BLOCK },
```

---

## Available Nouns (for display)

These are the nouns the emulator can display. Set the verb to 06 (display once) or 16 (monitor/auto-update) with these nouns:

| Noun | R1 | R2 | R3 | Good for |
|---|---|---|---|---|
| N09 | Alarm code 1 | Alarm code 2 | Alarm code 3 | Alarm display |
| N36 | Hours | Minutes | Seconds.cs | Mission clock |
| N43 | Latitude | Longitude | Altitude (nm) | Position display |
| N60 | Horiz velocity | Alt rate | Altitude (ft) | Landing phase |
| N62 | Abs velocity | Time from ign | Delta-V | Braking phase |
| N63 | Abs velocity | Alt rate | Altitude (ft) | General descent |
| N64 | LPD angle | Alt rate | Altitude (ft) | Approach phase |
| N68 | Slant range | Time to go | Altitude (ft) | Range data |

---

## Timing Guidelines

| Purpose | Recommended delay |
|---|---|
| Between narration lines | 2000–5000ms |
| After setting state (before narrate) | 500–1000ms |
| Before a `waitForKey` | 0ms (show prompt immediately) |
| After user key press (before next narrate) | 0–500ms |
| Before `showCode` | 0–1000ms |
| Between `setNav` and `callback: updateDisplayFromNav()` | 100ms |
| Telemetry phase duration | 10000–30000ms |

---

## Scenario Ideas from the AGC Source

These are interesting moments from the real Apollo 11 mission and the AGC code that could become scenarios. Each includes the relevant source files and what DSKY commands/displays would be involved.

### 1. Trans-Lunar Injection (TLI) — Leaving Earth Orbit
- **Source**: `P40-P47.agc` (SPS burn programs), `BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc`
- **Story**: The S-IVB third stage fires to send Apollo 11 from Earth orbit to the Moon. The AGC monitors the burn via V16 N62 (velocity/time/delta-V). The crew confirms GO for TLI.
- **DSKY**: Program 40 (SPS), V16 N62, PRO to confirm ignition, telemetry showing velocity building to translunar injection speed.

### 2. Lunar Orbit Insertion (LOI) — Captured by the Moon
- **Source**: `P40-P47.agc`, `BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc`
- **Story**: The SPS engine fires retrograde to slow down and enter lunar orbit. If the burn is too short, they fly past the Moon. Too long, they crash.
- **DSKY**: P41, V16 N62, monitor burn duration, PRO to confirm.

### 3. The Ascent — Leaving the Moon
- **Source**: `ASCENT_GUIDANCE.agc`, `P70-P71.agc`
- **Story**: After 21 hours on the surface, the ascent engine fires to lift off from the Moon. It must rendezvous with Columbia in orbit. There is no backup engine — it must work the first time.
- **DSKY**: P12 (ascent), V16 N62, countdown, PRO for ignition. Nav data showing altitude climbing, velocity increasing toward orbital speed.

### 4. Gimbal Lock Emergency
- **Source**: `GIMBAL_LOCK_AVOIDANCE.agc`, `ALARM_AND_ABORT.agc`
- **Story**: If the IMU gimbals align in certain orientations, the platform loses a degree of freedom. The AGC warns with GIMBAL LOCK light. The astronaut must maneuver to avoid it.
- **DSKY**: GIMBAL LOCK light activates, alarm code, attitude display, crew must acknowledge.

### 5. Abort Scenarios (P70/P71)
- **Source**: `P70-P71.agc`, `ALARM_AND_ABORT.agc` (CURTAINS, WHIMPER)
- **Story**: What happens if the landing must be aborted? P70 is abort from descent. P71 is abort from the lunar surface. The CURTAINS and WHIMPER routines are the last resort.
- **DSKY**: Alarm triggers, P70/P71 automatically loaded, ascent engine fires, nav shows climbing away from the Moon.

### 6. Rendezvous and Docking
- **Source**: `P32-P35_P72-P75.agc`, `GENERAL_LAMBERT_AIMPOINT_GUIDANCE.agc`, `R30.agc`, `R31.agc`
- **Story**: After ascent, the LM must find and dock with Columbia. The AGC computes the intercept trajectory using Lambert guidance.
- **DSKY**: P32-P35, V16 N68 (range/range-rate), closing velocity display, PRO to confirm maneuvers.

### 7. The Waitlist and Executive Deep Dive
- **Source**: `WAITLIST.agc`, `EXECUTIVE.agc`
- **Story**: An educational scenario explaining how the AGC's real-time operating system works. The Waitlist handles timed events. The Executive manages job scheduling with priority-based preemption.
- **DSKY**: Minimal DSKY interaction — focus on code viewer showing the scheduling algorithms.

### 8. IMU Alignment (Star Sighting)
- **Source**: `INFLIGHT_ALIGNMENT_ROUTINES.agc`, `AOTMARK.agc`
- **Story**: Before critical burns, astronauts align the inertial measurement unit by sighting stars through the Alignment Optical Telescope. The AGC computes the platform orientation.
- **DSKY**: V41 N20 (load star code), V06 N05 (display star angle), multiple star sightings, confirm alignment.

### 9. The Computer Self-Test
- **Source**: `AGC_BLOCK_TWO_SELF_CHECK.agc`, `SYSTEM_TEST_STANDARD_LEAD_INS.agc`
- **Story**: The AGC runs its own hardware diagnostics. An educational walkthrough of how a 1960s computer with 74KB of ROM tests itself.
- **DSKY**: V35 (lamp test), then self-test programs showing pass/fail in registers.

### 10. Down Telemetry — Talking to Houston
- **Source**: `DOWN_TELEMETRY_PROGRAM.agc`, `DOWNLINK_LISTS.agc`
- **Story**: The AGC continuously streams data to Mission Control. Houston sees everything the astronauts see — and more. This is how Steve Bales could call GO on the 1202 alarm.
- **DSKY**: Show telemetry data flowing, explain what Houston monitors, how the data links work.

---

## File Structure Summary

```
app/src/
├── core/
│   ├── agc-source.ts       ← AGC code blocks (add new blocks here)
│   ├── alarm.ts             ← triggerAlarm(), displayAlarms(), clearAlarms()
│   ├── clock.ts             ← mission elapsed time
│   ├── nouns.ts             ← noun definitions and formatters
│   ├── state.ts             ← AGCState, NavState, DSKYLights, notify()
│   └── verbs.ts             ← verb dispatch
├── dsky/
│   ├── keyboard.ts          ← DSKYKey type, pressKey(), key listener
│   ├── display.ts           ← DSKY panel rendering
│   └── segments.ts          ← 7-segment digit rendering
├── scenarios/
│   ├── scenario-runner.ts   ← ScenarioStep, runScenario(), telemetry helpers
│   ├── landing.ts           ← The Landing (P63→P64→P66→P68)
│   ├── alarm-1202.ts        ← The 1202 Alarm
│   ├── lamp-test.ts         ← Lamp Test (V35)
│   └── free-play.ts         ← Free exploration
├── ui/
│   ├── panel.ts             ← narration panel, keypad, help bar
│   ├── code-viewer.ts       ← AGC source code panel
│   └── scenario-picker.ts   ← scenario selection modal
├── styles/
│   ├── layout.css           ← page layout, keypad, narration, scenario picker
│   ├── dsky.css             ← 7-segment digits, sign display, COMP ACTY
│   ├── lights.css           ← indicator lights
│   └── code.css             ← AGC source code panel
└── main.ts                  ← wires everything, registers scenarios
```

---

## Checklist for Adding a New Scenario

1. [ ] Create `app/src/scenarios/my-scenario.ts` exporting a `Scenario` object
2. [ ] Add AGC code blocks to `app/src/core/agc-source.ts` (if showing source code)
3. [ ] Add entry to `SCENARIOS` array in `app/src/ui/scenario-picker.ts`
4. [ ] Import and register in `app/src/main.ts`
5. [ ] Run `npx tsc --noEmit` to check for type errors
6. [ ] Run `npx vite build` to verify production build
7. [ ] Test the scenario in the browser: `npx vite dev`

---

## Prompt Template for Agentic Coding

When you want an AI agent to create a new scenario, give it this prompt:

```
Create a new scenario for the Apollo 11 AGC DSKY emulator.

Topic: [describe the mission event]

Requirements:
- Read docs/SCENARIO-AUTHORING-GUIDE.md for the full API reference
- Read the relevant AGC source files from Apollo-11/Luminary099/ to find
  real code and comments to display in the code viewer
- Create the scenario file at app/src/scenarios/[name].ts
- Add AGC code blocks to app/src/core/agc-source.ts
- Register the scenario in app/src/ui/scenario-picker.ts and app/src/main.ts
- Include at least 3 interactive waitForKey moments
- Include at least 2 showCode blocks with real AGC source
- Use startTelemetry for any phases with changing nav values
- Force-set correct state after each user input sequence
- Verify with: npx tsc --noEmit && npx vite build

Reference existing scenarios for patterns:
- app/src/scenarios/landing.ts (complex, multi-phase)
- app/src/scenarios/alarm-1202.ts (alarm handling, medium complexity)
- app/src/scenarios/lamp-test.ts (simple, short)
```
