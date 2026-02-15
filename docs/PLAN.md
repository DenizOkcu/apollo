# Apollo 11 DSKY Terminal Emulator — Project Plan

A single-page web app that emulates the Apollo 11 guidance computer's DSKY (Display/Keyboard) interface as an interactive terminal, letting people explore how astronauts interacted with the AGC during the Moon landing.

## Goals

1. Authentic DSKY display — 7-segment digits, indicator lights, verb/noun/program readouts
2. Functional keyboard — all 19 DSKY keys mapped to keyboard and clickable on screen
3. Working verb/noun system — type real AGC commands and see realistic responses
4. Guided scenarios — walk users through iconic Apollo 11 moments (the landing, the 1202 alarm)
5. Educational tooltips — explain what each verb/noun means as you use it
6. Fun and accessible — no prior knowledge required, looks great, works on mobile

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Vanilla TypeScript + Vite | Fast, zero-dependency, simple to deploy |
| Styling | CSS (custom) | The DSKY has a very specific visual style; no framework needed |
| State | Single JS object + event emitter | AGC state is small and centralized |
| Deployment | Static files (GitHub Pages, Netlify, etc.) | No backend needed |

## Architecture Overview

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed module breakdown.

```
src/
├── index.html              # Single page shell
├── main.ts                 # Entry point, wires everything together
├── core/
│   ├── state.ts            # AGC state (registers, flags, memory)
│   ├── cpu.ts              # Simplified AGC executor (verb/noun dispatch)
│   ├── verbs.ts            # Verb handler table (V01-V99)
│   ├── nouns.ts            # Noun lookup table (N00-N99) with scale/format info
│   ├── alarm.ts            # Alarm system (codes, PROG light, V05N09 display)
│   └── clock.ts            # AGC clock (centisecond timer, mission elapsed time)
├── dsky/
│   ├── display.ts          # DSKY display renderer (digits, signs, lights)
│   ├── keyboard.ts         # Key input handler + state machine
│   └── segments.ts         # 7-segment digit encoding (the real AGC 5-bit codes)
├── scenarios/
│   ├── scenario-runner.ts  # Scenario engine — steps, timers, narration
│   ├── landing.ts          # P63→P64→P66→P68 lunar landing sequence
│   ├── alarm-1202.ts       # The famous 1202 alarm during descent
│   ├── clock.ts            # Simple V16N36 — display mission clock
│   └── free-play.ts        # Unrestricted DSKY interaction
├── ui/
│   ├── panel.ts            # Main DSKY panel layout (HTML generation)
│   ├── help.ts             # Tooltip/help overlay system
│   └── scenario-picker.ts  # Landing page: pick a scenario
└── styles/
    ├── dsky.css            # DSKY panel: green-on-black, segment fonts
    ├── lights.css          # Indicator light styles (glow effects)
    └── layout.css          # Page layout, responsive, terminal chrome
```

## Milestones

### M1: Static DSKY Display (visual foundation)
- Render the DSKY panel with all display areas and lights
- Implement 7-segment digit rendering (CSS or SVG)
- All 15 indicator lights with on/off/flash states
- Keyboard layout (clickable buttons + physical key bindings)
- Green-on-black terminal aesthetic with CRT-style effects

### M2: Input State Machine
- VERB/NOUN key → digit entry → ENTER flow
- Sign input (+/-) for data registers
- CLEAR key (backspace), ERROR RESET, KEY RELEASE
- Operator error detection (wrong key sequences)
- Verb/noun flash toggle when awaiting input

### M3: Core Verb/Noun Engine
- Verb dispatch table (display, monitor, load, change program)
- Noun lookup with format/scale information
- Display verbs (V01-V07): show data in R1/R2/R3
- Monitor verbs (V11-V17): auto-update every second
- Load verbs (V21-V25): accept astronaut input
- Control verbs: V33 (proceed), V34 (terminate), V35 (lamp test), V37 (change program)

### M4: Simulated AGC State
- Mission clock (centisecond resolution, Noun 36)
- Simulated navigation data (position, velocity, altitude for Noun 43, 60, 62, 63, 68)
- Alarm system with PROG light and V05N09
- Major mode register (program display)
- Pre-loaded data tables for each scenario

### M5: Scenario Engine + Guided Experiences
- Scenario runner: timed steps, narrated guidance, state injection
- **"The Landing"**: P63→P64→P66→P68 with real telemetry-like data
- **"1202 Alarm"**: trigger the famous executive overflow mid-descent
- **"Explore Freely"**: blank slate, type any V/N combo, see what happens
- **"Lamp Test"**: V35 to see all lights/segments

### M6: Polish & Education
- Tooltip system: hover/tap any verb, noun, or light for plain-English explanation
- Command history sidebar (like a terminal scrollback)
- Mobile-responsive layout
- Keyboard shortcut reference card
- Brief intro/tutorial overlay for first-time visitors

## Detailed Design

See:
- [ARCHITECTURE.md](./ARCHITECTURE.md) — module details, data flow, state shape
- [DSKY-REFERENCE.md](./DSKY-REFERENCE.md) — complete verb/noun tables, display formats, key codes
- [SCENARIOS.md](./SCENARIOS.md) — scenario scripts with timing and narration
