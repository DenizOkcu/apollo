# DSKY Reference — Verb/Noun Tables & Display Formats

Derived directly from the Apollo 11 AGC source code (Luminary099 for LM, Comanche055 for CM).

## DSKY Physical Layout

```
  ┌─────────────────────────────────────┐
  │   ╔═══════╗                         │
  │   ║ PROG  ║  ← 2-digit program #   │
  │   ║  XX   ║     (Major Mode)        │
  │   ╠═══════╬═══════╗                 │
  │   ║ VERB  ║ NOUN  ║                 │
  │   ║  XX   ║  XX   ║                 │
  │   ╠═══════╩═══════╣                 │
  │   ║ R1   ±XXXXX   ║  ← sign + 5    │
  │   ╠════════════════╣     digits     │
  │   ║ R2   ±XXXXX   ║                 │
  │   ╠════════════════╣                 │
  │   ║ R3   ±XXXXX   ║                 │
  │   ╚════════════════╝                 │
  └─────────────────────────────────────┘
```

Each digit is displayed via 7 segments. The sign position shows `+`, `-`, or blank.

## Keyboard Keys (19 total)

| Key | Function |
|-----|----------|
| 0-9 | Digit entry |
| + | Positive sign (before R1/R2/R3 digits) |
| - | Negative sign (before R1/R2/R3 digits) |
| VERB | Begin verb code entry |
| NOUN | Begin noun code entry |
| ENTR | Execute/accept input |
| CLR | Clear current input field |
| PRO | Proceed (resume without new data) |
| KEY REL | Release keyboard back to program |
| RSET | Reset error light |

## Indicator Lights

| Light | Meaning |
|-------|---------|
| COMP ACTY | Computer is processing |
| UPLINK ACTY | Ground is uploading data |
| NO ATT | Inertial platform not aligned |
| STBY | Computer in standby |
| KEY REL | Press KEY REL to return display to program |
| OPR ERR | Invalid key sequence |
| TEMP | Temperature warning |
| GIMBAL LOCK | IMU approaching gimbal lock |
| PROG | Program alarm (software error) |
| RESTART | Computer has restarted |
| TRACKER | Tracking antenna active |
| ALT | Altitude threshold (CM only) |
| VEL | Velocity threshold (CM only) |

## Verb Table (LM — Luminary099)

### Display Verbs (one-shot)

| Verb | Description | Registers Used |
|------|-------------|----------------|
| 01 | Display octal component 1 | R1 |
| 02 | Display octal component 2 | R1 |
| 03 | Display octal component 3 | R1 |
| 04 | Display octal components 1,2 | R1, R2 |
| 05 | Display octal components 1,2,3 | R1, R2, R3 |
| 06 | Display decimal | R1 (or R1,R2 or R1,R2,R3 depending on noun) |
| 07 | Display double-precision decimal | R1, R2 |

### Monitor Verbs (auto-update every 1 second)

| Verb | Description | Registers Used |
|------|-------------|----------------|
| 11 | Monitor octal component 1 | R1 |
| 12 | Monitor octal component 2 | R1 |
| 13 | Monitor octal component 3 | R1 |
| 14 | Monitor octal components 1,2 | R1, R2 |
| 15 | Monitor octal components 1,2,3 | R1, R2, R3 |
| 16 | Monitor decimal | R1 (or R1,R2 or R1,R2,R3) |
| 17 | Monitor double-precision decimal | R1, R2 |

### Load Verbs (accept input, flash V/N while waiting)

| Verb | Description | Input |
|------|-------------|-------|
| 21 | Load component 1 | R1 |
| 22 | Load component 2 | R2 |
| 23 | Load component 3 | R3 |
| 24 | Load components 1,2 | R1, R2 |
| 25 | Load components 1,2,3 | R1, R2, R3 |

### Control Verbs

| Verb | Description |
|------|-------------|
| 27 | Display fixed memory |
| 30 | Request executive (start job) |
| 31 | Request waitlist (start timed task) |
| 32 | Recycle (re-execute current program step) |
| 33 | Proceed (continue without entering data) |
| 34 | Terminate current operation |
| 35 | Lamp test (all lights and segments ON) |
| 36 | Fresh start (reboot to P00) |
| 37 | Change major mode (program) |

### Extended Verbs (selected, most relevant for emulation)

| Verb | Description |
|------|-------------|
| 50 | Please perform (checklist action) |
| 82 | Request orbit parameter display (R30) |
| 83 | Request rendezvous parameter display (R31) |
| 89 | Request rendezvous final attitude (R63) |
| 96 | Interrupt integration, go to P00 |
| 99 | Please enable engine |

## Noun Table (LM — selected nouns to implement)

### Simple/Time Nouns

| Noun | Description | R1 | R2 | R3 | Format |
|------|-------------|-----|-----|-----|--------|
| 09 | Alarm codes | code 1 | code 2 | code 3 | Octal |
| 36 | AGC clock | hours | minutes | seconds.xx | HH:MM:SS.xx |

### Navigation Nouns

| Noun | Description | R1 | R2 | R3 | Format |
|------|-------------|-----|-----|-----|--------|
| 40 | Time/Vg/DeltaV | time from ign (MM:SS) | Vg (ft/sec) | DeltaV (ft/sec) | Decimal |
| 42 | Orbit params | apogee (nmi) | perigee (nmi) | deltaV (ft/sec) | Decimal |
| 43 | Position | latitude (deg) | longitude (deg) | altitude (nmi) | Decimal |
| 44 | Orbit display | apogee (nmi) | perigee (nmi) | TFF (MM:SS) | Decimal |
| 60 | Landing data | horiz vel (ft/sec) | alt rate (ft/sec) | altitude (ft) | Decimal |
| 62 | Ascent data | abs vel (ft/sec) | time from ign (MM:SS) | deltaV (ft/sec) | Decimal |
| 63 | Velocity/alt | abs vel (ft/sec) | alt rate (ft/sec) | altitude (ft) | Decimal |
| 64 | Landing display | LPD angle | alt rate (ft/sec) | altitude (ft) | Decimal |
| 68 | Landing range | slant range (nmi) | time to go (MM:SS) | alt diff (ft) | Decimal |

## Display Format Types

| Type | Example | Description |
|------|---------|-------------|
| Octal | `07610` | Raw 5-digit octal, no sign |
| Whole | `+16383` | Sign + 5 digits, integer |
| Fractional | `+99996` | Sign + 5 digits, represents 0.xxxxx |
| Degrees | `+35978` | xxx.xx — e.g., +359.78 degrees |
| HH:MM:SS | `+00012`, `+00034`, `+05678` | Hours, minutes, seconds.centiseconds |
| MM:SS | `+0bb34` | MM blank SS — minutes and seconds, b=blank |
| Velocity | `+05463` | xxxx.x ft/sec — e.g., +546.3 |
| Distance (nmi) | `+01234` | xxxx.x nmi — e.g., +123.4 |
| Distance (ft) | `+54321` | xxxxx. feet — e.g., 54321 |

## Number Formatting Rules

1. **Decimal input**: exactly 5 digits required before ENTER (leading zeros mandatory)
2. **Sign**: must be entered before digits for R1/R2/R3
3. **Octal display**: no sign shown
4. **Blank digit**: displays as empty (all segments off)
5. **Leading zeros**: always displayed (no suppression)

## Famous Alarm Codes

| Code | Meaning | Cause |
|------|---------|-------|
| 01201 | Executive overflow — no VAC areas | All 5 VAC areas in use |
| 01202 | Executive overflow — no core sets | All 7 core sets in use |
| 01203 | Waitlist overflow | Too many timed tasks |
| 01210 | IMU device busy | Two programs accessing same hardware |
| 00210 | IMU not operating | Power failure or not initialized |
| 00220 | IMU orient not yet determined | Alignment needed |
| 00404 | Guidance cycle not converging | Navigation calculation issue |
| 00777 | PIPA failure | Accelerometer fault |

## Input State Machine

```
                    VERB key
         IDLE ──────────────▶ VERB_DIGIT_1
                                   │ digit
                                   ▼
                              VERB_DIGIT_2
                                   │ digit
         ┌─────────────────────────┘
         │ (auto-advance)
         ▼
       IDLE ──── NOUN key ──▶ NOUN_DIGIT_1
                                   │ digit
                                   ▼
                              NOUN_DIGIT_2
                                   │ digit
         ┌─────────────────────────┘
         │ (auto-advance)
         ▼
       IDLE ──── ENTER ─────▶ DISPATCH verb(noun)
                                   │
                 ┌─────────────────┼───────────────┐
                 ▼                 ▼               ▼
            DISPLAY          MONITOR           LOAD
           (one-shot)       (every 1s)      (flash V/N)
                                                  │
                                           ┌──────┼──────┐
                                           ▼      ▼      ▼
                                         R1_IN  R2_IN  R3_IN
                                         (sign + 5 digits + ENTER each)
```
