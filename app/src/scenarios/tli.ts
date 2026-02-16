import { getState, notify } from '../core/state';
import { startTelemetry, stopTelemetry } from './scenario-runner';
import type { Scenario } from './scenario-runner';
import { getNounDef, formatNounValue } from '../core/nouns';
import {
  TLI_BURNBABY, TLI_TABLES, TLI_COUNTDOWN, TLI_ESCAPE,
} from '../core/agc-source';

function updateDisplayFromNav(): void {
  const state = getState();
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

export const tliScenario: Scenario = {
  id: 'tli',
  title: 'Launch to the Moon',
  steps: [
    // === INTRODUCTION ===
    {
      delay: 0,
      action: 'showCode',
      codeBlock: TLI_BURNBABY,
    },
    {
      delay: 0,
      action: 'narrate',
      timestamp: '002:32:00',
      text: 'July 16, 1969. Apollo 11 has been in Earth orbit for nearly two hours. The crew has checked every system. Houston confirms: you are GO for TLI.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'Trans-Lunar Injection — the burn that sends you from Earth orbit to the Moon. The S-IVB third stage will fire for 5 minutes and 47 seconds.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'Current orbital velocity: 25,567 ft/s. The S-IVB must accelerate Apollo 11 to 35,545 ft/s — Earth escape velocity. After that, there is no easy way back.',
    },

    // === PLAYER SETS UP P40 ===
    {
      delay: 4000,
      action: 'narrate',
      text: 'The AGC needs Program 40 — SPS/DPS Thrusting Program. Type V 3 7 ENTER to request a program change.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'VERB',
      keyHint: 'Press V (VERB) to begin entering the command.',
    },
    {
      delay: 0,
      action: 'narrate',
      text: 'Good. Now type 3 7 and press ENTER.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'ENTER',
      keyHint: 'Type 3 7 then press ENTER.',
    },
    {
      delay: 0,
      action: 'narrate',
      text: 'Now enter 4 0 ENTER to select Program 40 — Thrusting.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'ENTER',
      keyHint: 'Type 4 0 then press ENTER.',
    },

    // Force P40 state
    {
      delay: 500,
      action: 'setState',
      stateChanges: { program: 40 },
    },
    {
      delay: 0,
      action: 'showCode',
      codeBlock: TLI_TABLES,
    },
    {
      delay: 0,
      action: 'narrate',
      timestamp: '002:40:00',
      text: 'Program 40 loaded. The BURN BABY BURN ignition routine uses the P40 table — 22.4 seconds of ullage before main engine ignition.',
    },

    // === MONITOR SETUP ===
    {
      delay: 3000,
      action: 'narrate',
      text: 'Set the display to monitor the burn. Type V 1 6 N 6 2 ENTER to watch velocity, burn time, and delta-V.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'VERB',
      keyHint: 'Press V (VERB) to begin.',
    },
    {
      delay: 0,
      action: 'narrate',
      text: 'Type 1 6 then N (NOUN), type 6 2, then ENTER.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'ENTER',
      keyHint: 'Complete the command: V16 N62 ENTER.',
    },

    // Force V16N62 display
    {
      delay: 500,
      action: 'setState',
      stateChanges: { verb: 16, noun: 62, verbNounFlash: false },
    },
    {
      delay: 0,
      action: 'setNav',
      navChanges: {
        absVelocity: 25567,
        timeFromIgnition: 0,
        deltaV: 0,
        altitude: 982000, // ~100 nm orbit in feet
        altitudeRate: 0,
        horizontalVelocity: 25567,
      },
    },
    {
      delay: 100,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },
    {
      delay: 500,
      action: 'narrate',
      text: 'V16 N62 — R1: velocity (25,567 ft/s in Earth orbit). R2: time from ignition. R3: delta-V needed (~10,000 ft/s to reach escape velocity).',
    },

    // === COUNTDOWN TO TLI ===
    {
      delay: 3000,
      action: 'showCode',
      codeBlock: TLI_COUNTDOWN,
    },
    {
      delay: 1000,
      action: 'narrate',
      timestamp: '002:43:00',
      text: '"Apollo 11, Houston. You are GO for TLI." — Bruce McCandless, CapCom. The S-IVB ignition sequence begins.',
    },
    {
      delay: 4000,
      action: 'narrate',
      text: 'TIG minus 35 seconds. The spacecraft maneuvers to burn attitude. The crew feels the attitude thrusters firing.',
    },
    {
      delay: 3000,
      action: 'narrate',
      text: '"Thrust is GO. Stand by for TLI." All three crew — Armstrong, Aldrin, Collins — watch their instruments.',
    },

    {
      delay: 3000,
      action: 'narrate',
      text: 'The AGC requests confirmation to commit to Trans-Lunar Injection. After this, you\'re going to the Moon. Press PRO.',
    },
    {
      delay: 0,
      action: 'setState',
      stateChanges: { verbNounFlash: true },
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'PRO',
      keyHint: 'Press P (PRO) — commit to Trans-Lunar Injection.',
    },

    // === TLI BURN ===
    {
      delay: 0,
      action: 'setState',
      stateChanges: { verbNounFlash: false },
    },
    {
      delay: 0,
      action: 'narrate',
      timestamp: 'TLI',
      text: 'IGNITION. The S-IVB fires its single J-2 engine — 230,000 pounds of thrust. The crew is pressed into their couches at 1.5 G.',
    },

    // TLI burn telemetry — velocity building to escape
    {
      delay: 500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          35000,
          {
            absVelocity: 25567,
            timeFromIgnition: 0,
            deltaV: 0,
            altitude: 982000,
          },
          {
            absVelocity: 35545,
            timeFromIgnition: 34700, // ~5min 47sec
            deltaV: 9978,
            altitude: 1100000, // climbing away
          },
          () => updateDisplayFromNav()
        );
      },
    },

    {
      delay: 4000,
      action: 'narrate',
      text: '"Burn is good. I can feel it in my butt." — Collins. The acceleration is gentle but sustained, pushing them faster every second.',
    },
    {
      delay: 6000,
      action: 'narrate',
      timestamp: 'TLI+02:00',
      text: 'Two minutes. Velocity passing 29,000 ft/s. The S-IVB is burning 5,115 pounds of liquid hydrogen per second.',
    },

    // Mid-burn confirmation
    {
      delay: 5000,
      action: 'narrate',
      text: '"Apollo 11, Houston. Trajectory looks good. You are GO for TLI." Press PRO to acknowledge.',
    },
    {
      delay: 0,
      action: 'setState',
      stateChanges: { verbNounFlash: true },
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'PRO',
      keyHint: 'Press P (PRO) — acknowledge GO.',
    },
    {
      delay: 0,
      action: 'setState',
      stateChanges: { verbNounFlash: false },
    },

    {
      delay: 1000,
      action: 'narrate',
      timestamp: 'TLI+04:00',
      text: 'Four minutes. Velocity 33,000 ft/s. They are now moving faster than any human ever has. Earth orbit is no longer possible.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: '"Houston, TLI looks real fine." — Collins. The burn is almost over. The computer counts down the remaining delta-V.',
    },

    // === S-IVB CUTOFF ===
    {
      delay: 8000,
      action: 'callback',
      callback: () => stopTelemetry(),
    },
    {
      delay: 0,
      action: 'setNav',
      navChanges: {
        absVelocity: 35545,
        timeFromIgnition: 34700,
        deltaV: 9978,
        altitude: 1100000,
      },
    },
    {
      delay: 100,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },
    {
      delay: 0,
      action: 'showCode',
      codeBlock: TLI_ESCAPE,
    },
    {
      delay: 500,
      action: 'narrate',
      timestamp: 'TLI+05:47',
      text: 'S-IVB CUTOFF. Velocity: 35,545 ft/s. Delta-V: 9,978 ft/s. Trans-Lunar Injection is complete.',
    },

    {
      delay: 4000,
      action: 'narrate',
      text: '"Apollo 11, Houston. Confirmed. TLI is nominal. Your trajectory is on the money." — CapCom',
    },
    {
      delay: 4000,
      action: 'narrate',
      text: 'Apollo 11 is now on a free-return trajectory to the Moon. In 73 hours they will enter lunar orbit. In 100 hours, two of them will land.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'The S-IVB has done its job. It will be jettisoned shortly and drift into solar orbit, where it remains today — a silent monument 240,000 miles from home.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'Three men are heading to the Moon. The journey has begun.',
    },
  ],
};
