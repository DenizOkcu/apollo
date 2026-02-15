import { state, notify } from '../core/state';
import { startTelemetry, stopTelemetry } from './scenario-runner';
import type { Scenario } from './scenario-runner';
import { getNounDef, formatNounValue } from '../core/nouns';
import {
  ASCENT_INTRO, ASCENT_GUIDANCE_BLOCK, ASCENT_BURNBABY, ASCENT_RENDEZVOUS,
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

export const lunarAscentScenario: Scenario = {
  id: 'lunar-ascent',
  title: 'The Ascent',
  steps: [
    // === INTRODUCTION ===
    {
      delay: 0,
      action: 'showCode',
      codeBlock: ASCENT_INTRO,
    },
    {
      delay: 0,
      action: 'narrate',
      timestamp: '124:20:00',
      text: 'July 21, 1969. Eagle has been on the lunar surface for 21 hours. Armstrong and Aldrin have walked on the Moon, collected samples, and planted the flag.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'Now comes the moment no one talks about: leaving. The Ascent Propulsion System has one engine, no backup, and has never been fired on the Moon before.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'If it doesn\'t ignite, there is no rescue. Collins in Columbia cannot land. Houston cannot help. Armstrong and Aldrin would die on the Moon.',
    },

    // === SET UP DISPLAYS ===
    {
      delay: 4000,
      action: 'narrate',
      timestamp: '124:21:00',
      text: 'The AGC needs Program 12 — Ascent Powered Flight. On the DSKY, type V 3 7 ENTER to request a program change.',
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
      text: 'Now enter 1 2 ENTER to select Program 12 — Ascent.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'ENTER',
      keyHint: 'Type 1 2 then press ENTER.',
    },

    // Force P12 state
    {
      delay: 500,
      action: 'setState',
      stateChanges: { program: 12 },
    },
    {
      delay: 0,
      action: 'showCode',
      codeBlock: ASCENT_BURNBABY,
    },
    {
      delay: 0,
      action: 'narrate',
      timestamp: '124:22:00',
      text: 'Program 12 loaded. The BURN BABY BURN ignition routine will use the P12 table — APS engine, no ullage settling required.',
    },

    // === MONITOR SETUP ===
    {
      delay: 3000,
      action: 'narrate',
      text: 'Set the display to monitor ascent data. Type V 1 6 N 6 2 ENTER to watch velocity, time from ignition, and delta-V.',
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
        absVelocity: 0,
        timeFromIgnition: 0,
        deltaV: 0,
        altitude: 0,
        altitudeRate: 0,
        horizontalVelocity: 0,
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
      text: 'V16 N62 — R1: velocity (currently 0). R2: time from ignition. R3: delta-V accumulated. When the engine fires, these numbers need to climb fast.',
    },

    // === PRE-IGNITION ===
    {
      delay: 4000,
      action: 'narrate',
      timestamp: '124:22:30',
      text: '"Houston, we\'re number one on the runway." — Aldrin. The dark humor of men about to bet their lives on a single engine.',
    },
    {
      delay: 4000,
      action: 'narrate',
      text: '"Roger, Eagle. You\'re cleared for takeoff." — Ron Evans, CapCom',
    },
    {
      delay: 3000,
      action: 'showCode',
      codeBlock: ASCENT_GUIDANCE_BLOCK,
    },
    {
      delay: 1000,
      action: 'narrate',
      text: 'The AGC requests confirmation to ignite the Ascent Propulsion System. This is the point of no return. Press PRO.',
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

    // === LIFTOFF ===
    {
      delay: 0,
      action: 'setState',
      stateChanges: { verbNounFlash: false },
    },
    {
      delay: 0,
      action: 'narrate',
      timestamp: 'LIFTOFF',
      text: 'IGNITION. The explosive bolts fire, severing the ascent stage from the descent stage. 3500 pounds of thrust push Eagle upward.',
    },
    {
      delay: 3000,
      action: 'narrate',
      text: '"We\'re off. Look at that! Beautiful!" — Armstrong. The descent stage, legs and all, stays behind on the Moon — a permanent monument.',
    },

    // Ascent telemetry — climbing away from the Moon
    {
      delay: 500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          30000,
          {
            absVelocity: 0,
            timeFromIgnition: 0,
            deltaV: 0,
            altitude: 0,
            altitudeRate: 0,
          },
          {
            absVelocity: 5537,
            timeFromIgnition: 43500, // ~7min 15sec
            deltaV: 5537,
            altitude: 60000, // ~60,000 ft = ~10 nm
            altitudeRate: 50,
          },
          () => updateDisplayFromNav()
        );
      },
    },

    {
      delay: 5000,
      action: 'narrate',
      timestamp: '124:23:30',
      text: 'Velocity climbing rapidly. The APS engine burns hypergolic propellant — it ignites on contact, no spark needed. 100% reliable. In theory.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'The ascent guidance program ATMAG computes the optimal trajectory to reach Columbia\'s orbit. Every second of burn is calculated.',
    },
    {
      delay: 5000,
      action: 'narrate',
      timestamp: '124:26:00',
      text: '"Eagle, Houston. One minute and you\'re looking good." Altitude passing through 10,000 feet. The lunar surface falls away below.',
    },

    // === MID-BURN CHECK ===
    {
      delay: 4000,
      action: 'narrate',
      text: 'Houston needs confirmation the ascent is nominal. Press PRO to acknowledge.',
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
      keyHint: 'Press P (PRO) — acknowledge nominal ascent.',
    },
    {
      delay: 0,
      action: 'setState',
      stateChanges: { verbNounFlash: false },
    },

    {
      delay: 1000,
      action: 'narrate',
      text: '"Eagle, Houston. Roger. Thrust is GO. Everything\'s looking good." Velocity now over 3,000 ft/s and climbing.',
    },

    {
      delay: 5000,
      action: 'narrate',
      timestamp: '124:28:00',
      text: 'Five minutes into the burn. The horizon of the Moon is curving visibly now. The craters shrink to dots.',
    },

    // === ENGINE CUTOFF ===
    {
      delay: 8000,
      action: 'callback',
      callback: () => stopTelemetry(),
    },
    {
      delay: 0,
      action: 'setNav',
      navChanges: {
        absVelocity: 5537,
        timeFromIgnition: 43500,
        deltaV: 5537,
        altitude: 60000,
        altitudeRate: 0,
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
      codeBlock: ASCENT_RENDEZVOUS,
    },
    {
      delay: 500,
      action: 'narrate',
      timestamp: '124:30:15',
      text: 'ENGINE CUTOFF. Velocity: 5537 ft/s. Eagle is in a 9 by 60 nautical mile orbit — a perfect insertion.',
    },

    {
      delay: 4000,
      action: 'narrate',
      text: 'The ascent engine just performed flawlessly on its first and only firing on the Moon. 7 minutes and 15 seconds.',
    },
    {
      delay: 4000,
      action: 'narrate',
      text: '"Eagle, Houston. Eagle, we copy. Orbit 9.4 by 56.8. Beautiful." — CapCom',
    },
    {
      delay: 4000,
      action: 'narrate',
      text: 'Columbia is somewhere above and ahead. In 3 hours, the rendezvous burns will bring Eagle alongside for docking.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'Armstrong and Aldrin have left the Moon. The descent stage sits at Tranquility Base forever — the first human artifact on another world.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: '"The Eagle has wings." — Armstrong',
    },
  ],
};
