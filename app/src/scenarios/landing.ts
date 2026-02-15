import { state, notify } from '../core/state';
import { startTelemetry, stopTelemetry } from './scenario-runner';
import type { Scenario } from './scenario-runner';
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

export const landingScenario: Scenario = {
  id: 'landing',
  title: 'The Landing',
  steps: [
    // Introduction
    {
      time: 0,
      action: 'narrate',
      timestamp: 'T-00:10',
      text: 'July 20, 1969. The Lunar Module "Eagle" is separating from the Command Module "Columbia" in lunar orbit.',
    },
    {
      time: 3000,
      action: 'narrate',
      timestamp: 'T-00:05',
      text: 'The AGC is initializing Program 63 — the braking phase of lunar landing.',
    },

    // Set initial state
    {
      time: 5000,
      action: 'setState',
      stateChanges: { program: 63, verb: 16, noun: 62, verbNounFlash: false },
    },
    {
      time: 5000,
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
      time: 5100,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },
    {
      time: 5500,
      action: 'narrate',
      timestamp: 'T+00:00',
      text: 'V16 N62 — Monitoring: absolute velocity, time from engine ignition, and accumulated delta-V.',
    },

    // Prompt for ignition
    {
      time: 8000,
      action: 'narrate',
      timestamp: 'T+00:03',
      text: '"Descent engine command override OFF. Press PRO to confirm ignition."',
    },
    {
      time: 8000,
      action: 'setState',
      stateChanges: { verbNounFlash: true },
    },
    {
      time: 8000,
      action: 'waitForKey',
      key: 'PRO',
    },

    // Ignition!
    {
      time: 12000,
      action: 'narrate',
      timestamp: 'T+00:06',
      text: 'ENGINE IGNITION. The descent engine throttles to 10% for 26 seconds of ullage settling, then full thrust.',
    },
    {
      time: 12000,
      action: 'setState',
      stateChanges: { verbNounFlash: false },
    },

    // Start braking telemetry (P63 phase: ~30 seconds compressed)
    {
      time: 12500,
      action: 'callback',
      callback: () => {
        startTelemetry(
          30000,  // 30 seconds
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
            timeFromIgnition: 40000,  // 400 seconds (displayed as MM:SS)
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
      time: 15000,
      action: 'narrate',
      timestamp: 'T+00:15',
      text: 'Full throttle. The descent engine is slowing Eagle from orbital velocity. Watch R1 — velocity is dropping.',
    },
    {
      time: 25000,
      action: 'narrate',
      timestamp: 'T+04:30',
      text: '"Eagle, Houston. You are GO for powered descent." — Charlie Duke, CapCom',
    },

    // Transition to P64 (approach phase)
    {
      time: 42000,
      action: 'callback',
      callback: () => stopTelemetry(),
    },
    {
      time: 42500,
      action: 'narrate',
      timestamp: 'T+08:26',
      text: 'Program 64 — APPROACH PHASE. The crew can now see the landing site through the LPD window.',
    },
    {
      time: 42500,
      action: 'setState',
      stateChanges: { program: 64, verb: 16, noun: 64 },
    },
    {
      time: 42500,
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
      time: 42600,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },

    // Approach phase telemetry
    {
      time: 43000,
      action: 'callback',
      callback: () => {
        startTelemetry(
          20000,
          {
            altitude: 7500,
            altitudeRate: -40,
            horizontalVelocity: 200,
            range: 5,
          },
          {
            altitude: 500,
            altitudeRate: -16,
            horizontalVelocity: 60,
            range: 0.5,
          },
          () => updateDisplayFromNav()
        );
      },
    },
    {
      time: 48000,
      action: 'narrate',
      timestamp: 'T+09:10',
      text: 'Armstrong sees the computer is targeting a boulder field. He takes semi-manual control.',
    },

    // Transition to P66 (landing phase)
    {
      time: 63000,
      action: 'callback',
      callback: () => stopTelemetry(),
    },
    {
      time: 63500,
      action: 'narrate',
      timestamp: 'T+10:20',
      text: 'Program 66 — LANDING PHASE. Armstrong is flying manually. Aldrin calls out altitude and descent rate.',
    },
    {
      time: 63500,
      action: 'setState',
      stateChanges: { program: 66, verb: 16, noun: 60 },
    },
    {
      time: 63500,
      action: 'setNav',
      navChanges: {
        altitude: 500,
        altitudeRate: -12,
        horizontalVelocity: 50,
      },
    },
    {
      time: 63600,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },

    // Final descent telemetry
    {
      time: 64000,
      action: 'callback',
      callback: () => {
        startTelemetry(
          30000,
          {
            altitude: 500,
            altitudeRate: -12,
            horizontalVelocity: 50,
          },
          {
            altitude: 3,
            altitudeRate: -1,
            horizontalVelocity: 0.5,
          },
          () => updateDisplayFromNav()
        );
      },
    },

    // Fuel calls
    {
      time: 72000,
      action: 'narrate',
      timestamp: 'T+11:15',
      text: '"Altitude velocity lights." "Roger." "200 feet, coming down at 3." — Aldrin',
    },
    {
      time: 80000,
      action: 'narrate',
      timestamp: 'T+11:52',
      text: '"60 seconds." — Charlie Duke. 60 seconds of fuel remaining.',
    },
    {
      time: 88000,
      action: 'narrate',
      timestamp: 'T+12:20',
      text: '"30 seconds." Fuel is critically low.',
    },

    // Contact!
    {
      time: 93000,
      action: 'callback',
      callback: () => stopTelemetry(),
    },
    {
      time: 93500,
      action: 'setNav',
      navChanges: {
        altitude: 0,
        altitudeRate: 0,
        horizontalVelocity: 0,
      },
    },
    {
      time: 93500,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },
    {
      time: 94000,
      action: 'narrate',
      timestamp: 'T+12:39',
      text: '"Contact light!" A probe beneath a landing leg has touched the surface.',
    },

    // P68: Landing confirmation
    {
      time: 96000,
      action: 'narrate',
      timestamp: 'T+12:40',
      text: '"Okay, engine stop." "ACA out of detent." "Mode control, both auto. Descent engine command override, off."',
    },
    {
      time: 99000,
      action: 'setState',
      stateChanges: { program: 68, verb: 6, noun: 43, verbNounFlash: true },
    },
    {
      time: 99000,
      action: 'setNav',
      navChanges: {
        latitude: 0.6875,
        longitude: 23.4333,
        altitude: 0,
      },
    },
    {
      time: 99100,
      action: 'callback',
      callback: () => updateDisplayFromNav(),
    },
    {
      time: 99500,
      action: 'narrate',
      timestamp: 'T+12:42',
      text: 'Program 68 — LANDING CONFIRMATION. V06 N43: Latitude, Longitude, Altitude. Press PRO to confirm landing.',
    },
    {
      time: 99500,
      action: 'waitForKey',
      key: 'PRO',
    },

    // The call
    {
      time: 103000,
      action: 'setState',
      stateChanges: { verbNounFlash: false },
    },
    {
      time: 103000,
      action: 'narrate',
      timestamp: 'T+12:45',
      text: '"Houston, Tranquility Base here. The Eagle has landed." — Neil Armstrong',
    },
    {
      time: 107000,
      action: 'narrate',
      timestamp: 'T+12:48',
      text: '"Roger, Tranquility, we copy you on the ground. You got a bunch of guys about to turn blue. We\'re breathing again. Thanks a lot." — Charlie Duke',
    },
    {
      time: 112000,
      action: 'narrate',
      text: 'You just landed on the Moon. Congratulations, Commander.',
    },
  ],
};
