import { state, notify } from '../core/state';
import { startTelemetry, stopTelemetry } from './scenario-runner';
import type { Scenario } from './scenario-runner';
import { getNounDef, formatNounValue } from '../core/nouns';
import {
  LANDING_INTRO, LANDING_P63, LANDING_IGNITION, GUIDANCE_EQUATIONS,
  LANDING_P64_APPROACH, LANDING_P66_MANUAL, LANDING_CONTACT, LANDING_P68_CONFIRM,
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

export const landingScenario: Scenario = {
  id: 'landing',
  title: 'The Landing',
  steps: [
    // === INTRODUCTION ===
    {
      delay: 0,
      action: 'showCode',
      codeBlock: LANDING_INTRO,
    },
    {
      delay: 0,
      action: 'narrate',
      timestamp: 'T-00:10',
      text: 'July 20, 1969. The Lunar Module "Eagle" has separated from the Command Module "Columbia" in lunar orbit, 60 nautical miles above the Moon.',
    },
    {
      delay: 4000,
      action: 'narrate',
      timestamp: 'T-00:05',
      text: 'The AGC needs to be configured for powered descent. You are the LM pilot.',
    },

    // === PLAYER STARTS P63 ===
    {
      delay: 3000,
      action: 'narrate',
      text: 'First, select Program 63 — the braking phase. On the DSKY, type V 3 7 ENTER to change program, then 6 3 ENTER.',
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
      text: 'Good. Now type 3 7 and press ENTER to request a program change.',
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
      text: 'Now enter 6 3 ENTER to select Program 63 — Lunar Landing Braking Phase.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'ENTER',
      keyHint: 'Type 6 3 then press ENTER.',
    },

    // Force P63 state in case the player entered something else
    {
      delay: 500,
      action: 'setState',
      stateChanges: { program: 63 },
    },
    {
      delay: 0,
      action: 'showCode',
      codeBlock: LANDING_P63,
    },
    {
      delay: 0,
      action: 'narrate',
      timestamp: 'T+00:00',
      text: 'Program 63 loaded. The AGC is ready for powered descent initiation (PDI).',
    },

    // === SET UP MONITORING DISPLAY ===
    {
      delay: 3000,
      action: 'narrate',
      text: 'Now set the display to monitor descent data. Type V 1 6 N 6 2 ENTER to monitor velocity, time from ignition, and delta-V.',
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
      text: 'Type 1 6 then press N (NOUN), type 6 2, then ENTER.',
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
        absVelocity: 5560,
        timeFromIgnition: 0,
        deltaV: 0,
        altitude: 50000,
        altitudeRate: -75,
        horizontalVelocity: 1200,
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
      timestamp: 'T+00:00',
      text: 'V16 N62 — R1: absolute velocity (5560 ft/s). R2: time from ignition. R3: accumulated delta-V.',
    },

    // === IGNITION COMMIT ===
    {
      delay: 3000,
      action: 'narrate',
      text: '"Descent engine command override OFF." The AGC is requesting confirmation to ignite the descent engine.',
    },
    {
      delay: 1000,
      action: 'setState',
      stateChanges: { verbNounFlash: true },
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'PRO',
      keyHint: 'Press P (PRO) to confirm engine ignition.',
    },

    // === ENGINE IGNITION ===
    {
      delay: 0,
      action: 'setState',
      stateChanges: { verbNounFlash: false },
    },
    {
      delay: 0,
      action: 'showCode',
      codeBlock: LANDING_IGNITION,
    },
    {
      delay: 0,
      action: 'narrate',
      timestamp: 'PDI',
      text: 'ENGINE IGNITION. The descent engine throttles to 10% for 26 seconds of ullage settling.',
    },
    {
      delay: 3000,
      action: 'narrate',
      text: 'Throttle up to full thrust. Eagle is decelerating from orbital velocity. Watch R1 — velocity is dropping.',
    },

    // Start braking telemetry (30 seconds compressed)
    {
      delay: 500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          30000,
          {
            absVelocity: 5560,
            timeFromIgnition: 0,
            deltaV: 0,
            altitude: 50000,
            altitudeRate: -75,
            horizontalVelocity: 1200,
          },
          {
            absVelocity: 800,
            timeFromIgnition: 40000,
            deltaV: 4700,
            altitude: 7500,
            altitudeRate: -40,
            horizontalVelocity: 200,
          },
          () => updateDisplayFromNav()
        );
      },
    },

    {
      delay: 6000,
      action: 'showCode',
      codeBlock: GUIDANCE_EQUATIONS,
    },
    {
      delay: 4000,
      action: 'narrate',
      timestamp: 'T+04:30',
      text: '"Eagle, Houston. You are GO for powered descent." — Charlie Duke, CapCom',
    },

    // === GO/NO-GO CHECK ===
    {
      delay: 3000,
      action: 'narrate',
      text: 'Houston confirms GO. Acknowledge by pressing PRO to continue descent.',
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
      keyHint: 'Press P (PRO) — acknowledge GO for powered descent.',
    },
    {
      delay: 0,
      action: 'setState',
      stateChanges: { verbNounFlash: false },
    },

    {
      delay: 1000,
      action: 'narrate',
      text: '"Roger, we got you. We\'re GO on that. Eagle, you\'re looking great." Velocity dropping steadily.',
    },

    // Wait for braking telemetry to finish
    {
      delay: 15000,
      action: 'callback',
      callback: () => stopTelemetry(),
    },

    // === TRANSITION TO P64 — APPROACH ===
    {
      delay: 500,
      action: 'showCode',
      codeBlock: LANDING_P64_APPROACH,
    },
    {
      delay: 500,
      action: 'narrate',
      timestamp: 'T+08:26',
      text: 'The AGC transitions to Program 64 — APPROACH PHASE. You can now see the landing site through the LPD window.',
    },
    {
      delay: 0,
      action: 'setState',
      stateChanges: { program: 64, verb: 16, noun: 64 },
    },
    {
      delay: 0,
      action: 'setNav',
      navChanges: {
        altitude: 7500,
        altitudeRate: -40,
        horizontalVelocity: 200,
        absVelocity: 800,
        range: 5,
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
      text: 'N64 now shows: LPD angle, altitude rate, and altitude. The computer is steering toward the target.',
    },

    // Approach telemetry
    {
      delay: 500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          20000,
          { altitude: 7500, altitudeRate: -40, horizontalVelocity: 200, range: 5 },
          { altitude: 500, altitudeRate: -16, horizontalVelocity: 60, range: 0.5 },
          () => updateDisplayFromNav()
        );
      },
    },

    {
      delay: 5000,
      action: 'narrate',
      timestamp: 'T+09:10',
      text: 'Armstrong sees the computer is targeting a boulder field near West Crater. He needs to take semi-manual control.',
    },
    {
      delay: 4000,
      action: 'narrate',
      text: 'Press PRO to take manual control and fly past the boulder field to a clear area.',
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
      keyHint: 'Press P (PRO) — take semi-manual control.',
    },

    // === TRANSITION TO P66 — MANUAL LANDING ===
    {
      delay: 0,
      action: 'callback',
      callback: () => stopTelemetry(),
    },
    {
      delay: 0,
      action: 'showCode',
      codeBlock: LANDING_P66_MANUAL,
    },
    {
      delay: 500,
      action: 'narrate',
      timestamp: 'T+10:20',
      text: 'Program 66 — LANDING PHASE. Armstrong is flying manually. Aldrin calls out altitude and descent rate from the DSKY.',
    },
    {
      delay: 0,
      action: 'setState',
      stateChanges: { program: 66, verb: 16, noun: 60, verbNounFlash: false },
    },
    {
      delay: 0,
      action: 'setNav',
      navChanges: { altitude: 500, altitudeRate: -12, horizontalVelocity: 50 },
    },
    {
      delay: 100,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },
    {
      delay: 500,
      action: 'narrate',
      text: 'V16 N60 — R1: horizontal velocity. R2: altitude rate. R3: altitude in feet.',
    },

    // Final descent telemetry
    {
      delay: 500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          30000,
          { altitude: 500, altitudeRate: -12, horizontalVelocity: 50 },
          { altitude: 3, altitudeRate: -1, horizontalVelocity: 0.5 },
          () => updateDisplayFromNav()
        );
      },
    },

    // Altitude callouts
    {
      delay: 8000,
      action: 'narrate',
      timestamp: 'T+11:15',
      text: '"200 feet, coming down at 3 and a half... got the shadow out there." — Aldrin',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: '"100 feet, 3 and a half down, 9 forward. Five percent. Quantity light." — Aldrin. Fuel is getting low.',
    },
    {
      delay: 5000,
      action: 'narrate',
      timestamp: 'T+11:52',
      text: '"60 seconds." — Charlie Duke. 60 seconds of fuel remaining.',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: '"40 feet, down 2 and a half. Picking up some dust."',
    },
    {
      delay: 5000,
      action: 'narrate',
      timestamp: 'T+12:20',
      text: '"30 seconds." — Charlie Duke. Fuel is critically low.',
    },
    {
      delay: 3000,
      action: 'narrate',
      text: '"Drifting to the right a little..."',
    },

    // === CONTACT ===
    {
      delay: 3000,
      action: 'callback',
      callback: () => stopTelemetry(),
    },
    {
      delay: 0,
      action: 'showCode',
      codeBlock: LANDING_CONTACT,
    },
    {
      delay: 0,
      action: 'setNav',
      navChanges: { altitude: 0, altitudeRate: 0, horizontalVelocity: 0 },
    },
    {
      delay: 100,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },
    {
      delay: 500,
      action: 'narrate',
      timestamp: 'T+12:39',
      text: '"CONTACT LIGHT!" — Aldrin. A 67-inch probe beneath a landing leg has touched the lunar surface.',
    },

    // === ENGINE STOP ===
    {
      delay: 3000,
      action: 'narrate',
      text: '"Okay, engine stop." — Aldrin. Shut down the descent engine. Press PRO.',
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
      keyHint: 'Press P (PRO) — engine stop.',
    },

    {
      delay: 0,
      action: 'setState',
      stateChanges: { verbNounFlash: false },
    },
    {
      delay: 1000,
      action: 'narrate',
      text: '"ACA out of detent." "Mode control, both auto. Descent engine command override, off. Engine arm, off."',
    },

    // === P68: LANDING CONFIRMATION ===
    {
      delay: 2000,
      action: 'showCode',
      codeBlock: LANDING_P68_CONFIRM,
    },
    {
      delay: 1000,
      action: 'setState',
      stateChanges: { program: 68, verb: 6, noun: 43, verbNounFlash: true },
    },
    {
      delay: 0,
      action: 'setNav',
      navChanges: { latitude: 0.6875, longitude: 23.4333, altitude: 0 },
    },
    {
      delay: 100,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },
    {
      delay: 500,
      action: 'narrate',
      timestamp: 'T+12:42',
      text: 'Program 68 — LANDING CONFIRMATION. The AGC displays your position: latitude, longitude, and altitude. Confirm the landing.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'PRO',
      keyHint: 'Press P (PRO) — confirm: Eagle has landed.',
    },

    // === THE CALL ===
    {
      delay: 0,
      action: 'setState',
      stateChanges: { verbNounFlash: false },
    },
    {
      delay: 2000,
      action: 'narrate',
      timestamp: 'T+12:45',
      text: '"Houston... Tranquility Base here. The Eagle has landed." — Neil Armstrong',
    },
    {
      delay: 5000,
      action: 'narrate',
      timestamp: 'T+12:48',
      text: '"Roger, Tranquility, we copy you on the ground. You got a bunch of guys about to turn blue. We\'re breathing again. Thanks a lot." — Charlie Duke',
    },
    {
      delay: 5000,
      action: 'narrate',
      text: 'You just landed on the Moon. Congratulations, Commander.',
    },
  ],
};
