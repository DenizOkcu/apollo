import { getAgcState } from '../stores/agc';
import { startTelemetry, stopTelemetry } from './scenario-runner';
import type { Scenario } from './scenario-runner';
import { triggerAlarm, displayAlarms, clearAlarms } from '../core/alarm';
import { getNounDef, formatNounValue } from '../core/nouns';
import {
  ABORT_P70_BLOCK, ABORT_CONTABRT, ABORT_GOABORT, ABORT_CURTAINS_BLOCK,
} from '../core/agc-source';

function updateDisplayFromNav(): void {
  const state = getAgcState();
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
}

export const abortScenario: Scenario = {
  id: 'abort',
  title: 'Abort!',
  steps: [
    // === INTRODUCTION ===
    {
      delay: 0,
      action: 'showCode',
      codeBlock: ABORT_P70_BLOCK,
    },
    {
      delay: 0,
      action: 'narrate',
      text: 'This is a "what-if" scenario. During Apollo 11, the landing was never aborted. But the abort programs P70 and P71 were ready every second of the descent.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'P70 triggers during powered descent. The descent stage is jettisoned, explosive bolts fire, and the ascent engine ignites — all automatically. The crew is thrown back toward orbit.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'Let\'s see what would have happened if the 1202 alarm had been worse — if Steve Bales had called NO-GO instead of GO.',
    },

    // === SETUP: MID-DESCENT ===
    {
      delay: 3000,
      action: 'setState',
      stateChanges: { program: 63, verb: 16, noun: 62, verbNounFlash: false },
    },
    {
      delay: 0,
      action: 'setNav',
      navChanges: {
        absVelocity: 2800,
        timeFromIgnition: 37200,
        deltaV: 2500,
        altitude: 33500,
        altitudeRate: -65,
        horizontalVelocity: 600,
      },
    },
    {
      delay: 100,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },
    {
      delay: 0,
      action: 'narrate',
      timestamp: 'T+06:10',
      text: 'Six minutes into powered descent. Eagle is at 33,500 feet, velocity 2800 ft/s. The descent is nominal...',
    },

    // Normal descent telemetry
    {
      delay: 500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          6000,
          { absVelocity: 2800, timeFromIgnition: 37200, deltaV: 2500, altitude: 33500 },
          { absVelocity: 2650, timeFromIgnition: 38400, deltaV: 2650, altitude: 30000 },
          () => updateDisplayFromNav()
        );
      },
    },

    {
      delay: 3000,
      action: 'narrate',
      timestamp: 'T+06:38',
      text: '"PROGRAM ALARM." — Armstrong. The DSKY lights up with a 1202.',
    },

    // === THE ALARM ===
    {
      delay: 2000,
      action: 'callback',
      callback: () => {
        stopTelemetry();
        triggerAlarm(0o1202);
      },
    },
    {
      delay: 200,
      action: 'callback',
      callback: () => displayAlarms(),
    },
    {
      delay: 0,
      action: 'setLights',
      lightChanges: { restart: true },
    },
    {
      delay: 1000,
      action: 'narrate',
      text: '"It\'s a 1202." — Aldrin. Executive overflow. The computer is overloaded.',
    },

    {
      delay: 3000,
      action: 'narrate',
      text: 'In Mission Control, Steve Bales stares at his console. The alarm keeps repeating. The computer is shedding tasks too fast.',
    },
    {
      delay: 4000,
      action: 'narrate',
      timestamp: 'T+06:45',
      text: '"Flight, Guidance." Bales keys his mic. "NO-GO. I say again, NO-GO. We need to abort."',
    },
    {
      delay: 4000,
      action: 'narrate',
      text: '"Copy NO-GO. Eagle, Houston. We need an abort. Execute P70 immediately." — CapCom',
    },

    // === PLAYER TRIGGERS ABORT ===
    {
      delay: 3000,
      action: 'narrate',
      text: 'You need to abort the landing. Press R (RSET) to clear the alarm first.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'RSET',
      keyHint: 'Press R (RSET) to clear the alarm.',
    },

    {
      delay: 0,
      action: 'callback',
      callback: () => {
        const state = getAgcState();
        clearAlarms();
        state.lights.restart = false;
        state.lights.prog = false;
        state.lights.oprErr = false;
            },
    },
    {
      delay: 500,
      action: 'showCode',
      codeBlock: ABORT_CONTABRT,
    },
    {
      delay: 500,
      action: 'narrate',
      text: 'Good. Now load the abort program. Type V 3 7 ENTER to begin a program change.',
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
      text: 'Type 3 7 and press ENTER.',
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
      text: 'Now type 7 0 ENTER to select P70 — Abort from Powered Descent.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'ENTER',
      keyHint: 'Type 7 0 then press ENTER.',
    },

    // Force P70 state
    {
      delay: 500,
      action: 'setState',
      stateChanges: { program: 70, verb: 16, noun: 62, verbNounFlash: false },
    },

    // === ABORT STAGING ===
    {
      delay: 500,
      action: 'narrate',
      timestamp: 'ABORT',
      text: 'P70 LOADED. The AGC immediately commands abort staging. The descent stage is jettisoned.',
    },
    {
      delay: 2000,
      action: 'narrate',
      text: 'BANG — explosive bolts fire. The descent stage falls away. Eagle is now just the ascent stage: a cabin, an engine, and two astronauts.',
    },

    {
      delay: 2000,
      action: 'showCode',
      codeBlock: ABORT_GOABORT,
    },
    {
      delay: 1000,
      action: 'narrate',
      text: 'The AGC requests confirmation to fire the ascent engine at full thrust. This is the point of no return. Press PRO.',
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
      keyHint: 'Press P (PRO) — ignite the ascent engine.',
    },

    // === ASCENT ENGINE FIRES ===
    {
      delay: 0,
      action: 'setState',
      stateChanges: { verbNounFlash: false },
    },
    {
      delay: 0,
      action: 'setNav',
      navChanges: {
        absVelocity: 2650,
        altitude: 28000,
        altitudeRate: -60,
      },
    },
    {
      delay: 100,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },
    {
      delay: 0,
      action: 'narrate',
      timestamp: 'ABORT+00',
      text: 'ENGINE IGNITION. 3500 pounds of thrust. The crew is slammed back into their harnesses.',
    },

    // Abort telemetry — first the descent slows, then reverses
    {
      delay: 500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          25000,
          {
            absVelocity: 2650,
            altitude: 28000,
            altitudeRate: -60,
            deltaV: 2650,
            timeFromIgnition: 0,
          },
          {
            absVelocity: 5500,
            altitude: 55000,
            altitudeRate: 50,
            deltaV: 5500,
            timeFromIgnition: 42000,
          },
          () => updateDisplayFromNav()
        );
      },
    },

    {
      delay: 3000,
      action: 'narrate',
      text: 'The GOABORT routine fires the engine while the guidance equations compute a new trajectory — not to the surface, but back to orbit.',
    },
    {
      delay: 5000,
      action: 'narrate',
      timestamp: 'ABORT+02:00',
      text: 'Altitude rate has reversed — Eagle is now climbing. Watch R1: velocity is building toward orbital speed.',
    },

    {
      delay: 5000,
      action: 'showCode',
      codeBlock: ABORT_CURTAINS_BLOCK,
    },
    {
      delay: 1000,
      action: 'narrate',
      text: 'The CURTAINS routine — the absolute last resort — was never needed. The abort is working. But somewhere in the AGC\'s memory, WHIMPER waits, silent.',
    },

    {
      delay: 5000,
      action: 'narrate',
      timestamp: 'ABORT+04:00',
      text: '"Eagle, Houston. We copy you climbing. Altitude 40,000 feet. Velocity looks good." The abort is nominal.',
    },

    // === ORBIT ACHIEVED ===
    {
      delay: 8000,
      action: 'callback',
      callback: () => stopTelemetry(),
    },
    {
      delay: 0,
      action: 'setNav',
      navChanges: {
        absVelocity: 5500,
        altitude: 55000,
        altitudeRate: 0,
        deltaV: 5500,
        timeFromIgnition: 42000,
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
      timestamp: 'ABORT+07:00',
      text: 'ENGINE CUTOFF. Eagle is in a safe orbit. The crew is alive. The abort worked exactly as designed.',
    },

    {
      delay: 4000,
      action: 'narrate',
      text: '"Eagle, Houston. Orbit is 9 by 55. You\'re safe. We\'ll get you home." — CapCom',
    },
    {
      delay: 4000,
      action: 'narrate',
      text: 'The landing was never attempted again. The Moon is still empty. Armstrong never said those words.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'But the software worked. P70 was ready every second of every Apollo landing. Margaret Hamilton\'s team designed it so that even in the worst case, the crew comes home.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'In reality, Steve Bales called GO. The rest is history.',
    },
  ],
};
