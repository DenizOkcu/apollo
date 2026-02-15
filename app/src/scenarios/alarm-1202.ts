import { state, notify } from '../core/state';
import { startTelemetry, stopTelemetry } from './scenario-runner';
import type { Scenario } from './scenario-runner';
import { triggerAlarm, displayAlarms, clearAlarms } from '../core/alarm';
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

export const alarm1202Scenario: Scenario = {
  id: 'alarm-1202',
  title: 'The 1202 Alarm',
  steps: [
    {
      time: 0,
      action: 'narrate',
      timestamp: 'T+05:30',
      text: 'Six minutes into powered descent. Program 63 is guiding Eagle through the braking phase. Everything is nominal...',
    },

    // Set up descent state
    {
      time: 2000,
      action: 'setState',
      stateChanges: { program: 63, verb: 16, noun: 62, verbNounFlash: false },
    },
    {
      time: 2000,
      action: 'setNav',
      navChanges: {
        absVelocity: 2800,
        timeFromIgnition: 37200,  // 6:12
        deltaV: 2500,
        altitude: 33500,
        altitudeRate: -65,
      },
    },
    {
      time: 2100,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },

    // Normal telemetry for a few seconds
    {
      time: 2500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          5000,
          {
            absVelocity: 2800,
            timeFromIgnition: 37200,
            deltaV: 2500,
          },
          {
            absVelocity: 2650,
            timeFromIgnition: 38400,
            deltaV: 2650,
          },
          () => updateDisplayFromNav()
        );
      },
    },

    {
      time: 5000,
      action: 'narrate',
      timestamp: 'T+06:10',
      text: 'V16 N62 monitoring velocity, time from ignition, and delta-V. The rendezvous radar is inadvertently left on, flooding the computer with interrupts...',
    },

    // ALARM!
    {
      time: 8000,
      action: 'callback',
      callback: () => {
        stopTelemetry();
        triggerAlarm(0o1202);
      },
    },
    {
      time: 8200,
      action: 'narrate',
      timestamp: 'T+06:38',
      text: '"PROGRAM ALARM." — Armstrong. The PROG light is on.',
    },
    {
      time: 9500,
      action: 'narrate',
      text: '"It\'s a 1202." — Aldrin',
    },

    // Show the alarm display
    {
      time: 10000,
      action: 'callback',
      callback: () => {
        displayAlarms();
      },
    },
    {
      time: 10500,
      action: 'setLights',
      lightChanges: { restart: true, compActy: true },
    },

    {
      time: 11000,
      action: 'narrate',
      timestamp: 'T+06:40',
      text: '1202 — EXECUTIVE OVERFLOW. The AGC has run out of core sets. Too many tasks competing for the CPU.',
    },

    {
      time: 14000,
      action: 'narrate',
      text: 'The rendezvous radar (not needed for landing) is sending data every cycle, stealing processing time from guidance.',
    },

    {
      time: 17000,
      action: 'narrate',
      timestamp: 'T+06:43',
      text: 'But the AGC was DESIGNED for this. Margaret Hamilton\'s priority-based software restarts immediately. Low-priority tasks are shed. Guidance continues.',
    },

    // Mission Control
    {
      time: 20000,
      action: 'narrate',
      timestamp: 'T+06:45',
      text: 'In Mission Control, 26-year-old guidance officer Steve Bales has seconds to make a call...',
    },
    {
      time: 23000,
      action: 'narrate',
      text: '"We\'re GO on that alarm." — Steve Bales. The landing continues.',
    },

    // User interaction: acknowledge alarm
    {
      time: 26000,
      action: 'narrate',
      text: 'Press RSET to acknowledge the alarm.',
    },
    {
      time: 26000,
      action: 'waitForKey',
      key: 'RSET',
    },

    // After RSET
    {
      time: 28000,
      action: 'callback',
      callback: () => {
        clearAlarms();
        state.lights.restart = false;
        state.lights.oprErr = false;
        state.lights.keyRel = true;
        notify('display');
      },
    },
    {
      time: 28500,
      action: 'narrate',
      text: 'Alarm cleared. Press KEY REL to return to the landing display.',
    },
    {
      time: 28500,
      action: 'waitForKey',
      key: 'KEY_REL',
    },

    // Restore descent display
    {
      time: 30000,
      action: 'callback',
      callback: () => {
        state.verb = 16;
        state.noun = 62;
        state.verbNounFlash = false;
        state.lights.keyRel = false;
        state.nav.absVelocity = 2650;
        state.nav.timeFromIgnition = 39000;
        state.nav.deltaV = 2650;
        updateDisplayFromNav();
      },
    },

    // Resume telemetry
    {
      time: 30500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          10000,
          {
            absVelocity: 2650,
            timeFromIgnition: 39000,
            deltaV: 2650,
          },
          {
            absVelocity: 2200,
            timeFromIgnition: 45000,
            deltaV: 3050,
          },
          () => updateDisplayFromNav()
        );
      },
    },

    {
      time: 31000,
      action: 'narrate',
      timestamp: 'T+06:48',
      text: 'Guidance resumed. The computer recovered in under 2 seconds. Velocity is still decreasing — descent is nominal.',
    },

    {
      time: 36000,
      action: 'narrate',
      text: 'The 1202 alarm fired 4 more times during descent, plus one 1201 alarm (no VAC areas). Each time, the AGC recovered perfectly.',
    },

    {
      time: 41000,
      action: 'callback',
      callback: () => stopTelemetry(),
    },

    {
      time: 42000,
      action: 'narrate',
      text: 'This is why Margaret Hamilton\'s priority-based restart system was one of the most important software designs in history. The AGC could fail gracefully under overload — and did, at the most critical moment in the mission.',
    },

    {
      time: 48000,
      action: 'narrate',
      text: 'Steve Bales received the Presidential Medal of Freedom for his call. Hamilton\'s team received NASA\'s Exceptional Space Act Award.',
    },
  ],
};
