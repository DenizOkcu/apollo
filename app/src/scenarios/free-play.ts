import type { Scenario } from './scenario-runner';
import { getIntroCodeBlock } from '../core/verb-code-map';

export const freePlayScenario: Scenario = {
  id: 'free-play',
  title: 'Explore Freely',
  steps: [
    {
      delay: 0,
      action: 'setState',
      stateChanges: { program: 0, verb: null, noun: null, verbNounFlash: false },
    },
    {
      delay: 0,
      action: 'setNav',
      navChanges: {
        latitude: 0.6875,
        longitude: 23.4333,
        altitude: 0,
        altitudeRate: 0,
        horizontalVelocity: 0,
        absVelocity: 0,
        deltaV: 0,
        timeFromIgnition: 0,
      },
    },
    // Show PINBALL intro code immediately
    {
      delay: 0,
      action: 'showCode',
      codeBlock: getIntroCodeBlock(),
    },

    // === OPENING ===
    {
      delay: 500,
      action: 'narrate',
      text: 'You have full control of the Apollo Guidance Computer. Every command below ran on the real AGC — try them yourself.',
    },

    // === SECTION 1: YOUR FIRST COMMANDS ===
    {
      delay: 2500,
      action: 'narrate',
      text: '── YOUR FIRST COMMANDS ──',
    },
    {
      delay: 1200,
      action: 'narrate',
      text: 'V35 ENTR — Lamp test. Lights every segment on the DSKY. The astronaut\'s "hello world" — the first thing they\'d do after powering up.',
    },
    {
      delay: 2000,
      action: 'narrate',
      text: 'V36 ENTR — Fresh start. Reboots the AGC. The computer restarts cleanly in under 2 seconds, preserving all guidance data.',
    },

    // === SECTION 2: READING DATA ===
    {
      delay: 2500,
      action: 'narrate',
      text: '── READING DATA ──',
    },
    {
      delay: 1200,
      action: 'narrate',
      text: 'V16 N36 ENTR — Mission clock. Auto-updates every second. V16 means "monitor" — the display refreshes continuously.',
    },
    {
      delay: 1800,
      action: 'narrate',
      text: 'V06 N43 ENTR — Position. Shows latitude, longitude, and altitude at the Sea of Tranquility.',
    },
    {
      delay: 1800,
      action: 'narrate',
      text: 'V16 N62 ENTR — Velocity, time since ignition, and delta-V. The numbers the crew watched during powered descent.',
    },
    {
      delay: 1800,
      action: 'narrate',
      text: 'V16 N60 ENTR — Landing data: horizontal velocity, altitude rate, altitude. Aldrin read these out during the final approach.',
    },
    {
      delay: 1800,
      action: 'narrate',
      text: 'V06 N63 ENTR — Absolute velocity, altitude rate, altitude. Another view of descent data.',
    },
    {
      delay: 1800,
      action: 'narrate',
      text: 'V16 N68 ENTR — Rendezvous radar: range to Columbia, time, and altitude difference.',
    },

    // === SECTION 3: CONTROLLING THE AGC ===
    {
      delay: 2500,
      action: 'narrate',
      text: '── CONTROLLING THE AGC ──',
    },
    {
      delay: 1200,
      action: 'narrate',
      text: 'V37 nn ENTR — Change program. Try V37 63 ENTR (braking phase), V37 64 ENTR (approach), V37 66 ENTR (manual landing), or V37 68 ENTR (confirmation).',
    },
    {
      delay: 2000,
      action: 'narrate',
      text: 'V34 ENTR — Terminate. Stops any active monitor display and returns the AGC to idle.',
    },
    {
      delay: 1800,
      action: 'narrate',
      text: 'V05 N09 ENTR — Display alarm codes. All zeros means no alarms — the computer is healthy. During Apollo 11, alarm 1202 appeared here.',
    },

    // === SECTION 4: WHAT THE DISPLAYS MEAN ===
    {
      delay: 2500,
      action: 'narrate',
      text: '── WHAT THE DISPLAYS MEAN ──',
    },
    {
      delay: 1200,
      action: 'narrate',
      text: 'VERB = what to do (display, monitor, load, proceed). NOUN = what data to act on (clock, position, velocity). Together they form every command.',
    },
    {
      delay: 2000,
      action: 'narrate',
      text: 'R1, R2, R3 are the three data registers — the 5-digit numbers in the middle of the display. Each noun defines what data appears in which register.',
    },
    {
      delay: 2000,
      action: 'narrate',
      text: 'Indicator lights: COMP ACTY = computer is processing. PROG = alarm (program alarm). OPR ERR = invalid command. TEMP = temperature warning. Press R (RSET) to clear errors.',
    },
    {
      delay: 2000,
      action: 'narrate',
      text: 'Programs: P00 = idle. P63 = braking phase. P64 = approach phase. P66 = manual landing (ROD mode). P68 = landing confirmation. The PROG display at top-left shows the current program.',
    },

    // === CLOSING ===
    {
      delay: 2500,
      action: 'narrate',
      text: 'Every command you type ran on the real AGC. The source code on the right is from the actual Luminary 099 flight software — the code that landed on the Moon.',
    },
    {
      delay: 2000,
      action: 'narrate',
      text: 'Type V (VERB) then 2 digits, N (NOUN) then 2 digits, then ENTER. If you make a mistake, press R (RSET) to clear OPR ERR. Keyboard shortcuts are shown below.',
    },
  ],
};
