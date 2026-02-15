import { state, notify } from '../core/state';
import { startTelemetry, stopTelemetry } from './scenario-runner';
import type { Scenario } from './scenario-runner';
import { triggerAlarm, displayAlarms, clearAlarms } from '../core/alarm';
import { getNounDef, formatNounValue } from '../core/nouns';
import {
  ALARM_EXECUTIVE, ALARM_POODOO, ALARM_BAILOUT,
  ALARM_CURTAINS, ALARM_RECOVERY, ALARM_HAMILTON,
} from '../core/agc-source';

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

export const alarm1202Scenario: Scenario = {
  id: 'alarm-1202',
  title: 'The 1202 Alarm',
  steps: [
    {
      delay: 0,
      action: 'narrate',
      timestamp: 'T+05:30',
      text: 'Six minutes into powered descent. Program 63 is guiding Eagle through the braking phase. Everything looks nominal...',
    },

    // Set up descent state
    {
      delay: 2000,
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
      },
    },
    {
      delay: 100,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },

    // Normal telemetry for a few seconds
    {
      delay: 500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          6000,
          { absVelocity: 2800, timeFromIgnition: 37200, deltaV: 2500 },
          { absVelocity: 2650, timeFromIgnition: 38400, deltaV: 2650 },
          () => updateDisplayFromNav()
        );
      },
    },

    {
      delay: 1000,
      action: 'showCode',
      codeBlock: ALARM_EXECUTIVE,
    },
    {
      delay: 2000,
      action: 'narrate',
      timestamp: 'T+06:10',
      text: 'V16 N62 is monitoring velocity, time from ignition, and delta-V. Unknown to the crew, the rendezvous radar has been left in a mode that floods the computer with interrupts...',
    },

    // === THE ALARM ===
    {
      delay: 5000,
      action: 'callback',
      callback: () => {
        stopTelemetry();
        triggerAlarm(0o1202);
      },
    },
    {
      delay: 0,
      action: 'showCode',
      codeBlock: ALARM_POODOO,
    },
    {
      delay: 200,
      action: 'narrate',
      timestamp: 'T+06:38',
      text: '"PROGRAM ALARM." — Armstrong. The PROG light has turned on!',
    },
    {
      delay: 2000,
      action: 'narrate',
      text: '"It\'s a 1202." — Aldrin reads the alarm code from the DSKY.',
    },

    // Show the alarm display
    {
      delay: 1000,
      action: 'callback',
      callback: () => displayAlarms(),
    },
    {
      delay: 500,
      action: 'setLights',
      lightChanges: { restart: true },
    },

    {
      delay: 1000,
      action: 'narrate',
      timestamp: 'T+06:40',
      text: '1202 — EXECUTIVE OVERFLOW. The AGC\'s job scheduler has run out of core sets. Too many tasks are competing for the CPU.',
    },

    {
      delay: 4000,
      action: 'narrate',
      text: 'The rendezvous radar (not needed for landing) is sending data every cycle, stealing processing time from navigation and guidance.',
    },

    {
      delay: 2000,
      action: 'showCode',
      codeBlock: ALARM_BAILOUT,
    },
    {
      delay: 2000,
      action: 'narrate',
      timestamp: 'T+06:43',
      text: 'But the AGC was DESIGNED for this. Margaret Hamilton\'s priority-based software restarts immediately. Low-priority tasks are shed. Guidance — the highest priority — continues uninterrupted.',
    },

    // Mission Control
    {
      delay: 4000,
      action: 'narrate',
      timestamp: 'T+06:45',
      text: 'In Mission Control, 26-year-old guidance officer Steve Bales has seconds to make a GO/NO-GO call...',
    },
    {
      delay: 4000,
      action: 'narrate',
      text: '"We\'re GO on that alarm." — Steve Bales. The landing continues.',
    },

    {
      delay: 1000,
      action: 'showCode',
      codeBlock: ALARM_CURTAINS,
    },
    // === USER: READ THE ALARM ===
    {
      delay: 2000,
      action: 'narrate',
      text: 'As the astronaut, you need to check the alarm. Press R (RSET) to clear the error indicator.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'RSET',
      keyHint: 'Press R (RSET) to acknowledge the alarm.',
    },

    // After RSET
    {
      delay: 0,
      action: 'callback',
      callback: () => {
        state.lights.oprErr = false;
        state.lights.prog = false;
        notify('display');
      },
    },
    {
      delay: 500,
      action: 'narrate',
      text: 'Good. Now the alarm codes are still in R1. The KEY REL light is on — the computer wants the display back for guidance. Press K (KEY REL) to return control.',
    },
    {
      delay: 0,
      action: 'setLights',
      lightChanges: { keyRel: true },
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'KEY_REL',
      keyHint: 'Press K (KEY REL) to return the display to the guidance program.',
    },

    // Restore descent display
    {
      delay: 0,
      action: 'callback',
      callback: () => {
        clearAlarms();
        state.verb = 16;
        state.noun = 62;
        state.verbNounFlash = false;
        state.lights.keyRel = false;
        state.lights.restart = false;
        state.nav.absVelocity = 2650;
        state.nav.timeFromIgnition = 39000;
        state.nav.deltaV = 2650;
        updateDisplayFromNav();
      },
    },

    {
      delay: 0,
      action: 'showCode',
      codeBlock: ALARM_RECOVERY,
    },
    {
      delay: 1000,
      action: 'narrate',
      timestamp: 'T+06:48',
      text: 'Guidance resumed. The computer recovered in under 2 seconds. Velocity is still decreasing — descent is nominal.',
    },

    // Resume telemetry
    {
      delay: 500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          12000,
          { absVelocity: 2650, timeFromIgnition: 39000, deltaV: 2650 },
          { absVelocity: 2200, timeFromIgnition: 45000, deltaV: 3050 },
          () => updateDisplayFromNav()
        );
      },
    },

    {
      delay: 5000,
      action: 'narrate',
      text: 'The 1202 alarm fired 4 more times during descent, plus one 1201 (no VAC areas). Each time, the AGC recovered in seconds and resumed guidance.',
    },

    {
      delay: 6000,
      action: 'callback',
      callback: () => stopTelemetry(),
    },

    {
      delay: 1000,
      action: 'showCode',
      codeBlock: ALARM_HAMILTON,
    },
    {
      delay: 1000,
      action: 'narrate',
      text: 'This is why Margaret Hamilton\'s priority-based restart system was one of the most important software designs in history. The AGC could fail gracefully under overload — and it did, at the most critical moment in the mission.',
    },

    {
      delay: 6000,
      action: 'narrate',
      text: 'Steve Bales received the Presidential Medal of Freedom for his call. Hamilton\'s team received NASA\'s Exceptional Space Act Award. The AGC\'s software — written by humans, for humans — landed humans on the Moon.',
    },
  ],
};
