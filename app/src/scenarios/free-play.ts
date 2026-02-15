import type { Scenario } from './scenario-runner';

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
    {
      delay: 500,
      action: 'narrate',
      text: 'You have full control of the DSKY. Try these commands:',
    },
    {
      delay: 2000,
      action: 'narrate',
      text: 'V35 ENTR — Lamp test (light up everything)',
    },
    {
      delay: 1500,
      action: 'narrate',
      text: 'V16 N36 ENTR — Display the mission clock (auto-updating)',
    },
    {
      delay: 1500,
      action: 'narrate',
      text: 'V06 N43 ENTR — Display position (lat/long/alt)',
    },
    {
      delay: 1500,
      action: 'narrate',
      text: 'V16 N60 ENTR — Monitor landing data (velocity/altitude)',
    },
    {
      delay: 1500,
      action: 'narrate',
      text: 'V36 ENTR — Fresh start (reboot)',
    },
    {
      delay: 2000,
      action: 'narrate',
      text: 'Type V (VERB) then 2 digits, N (NOUN) then 2 digits, then ENTER.',
    },
    {
      delay: 2000,
      action: 'narrate',
      text: 'If you make a mistake, the OPR ERR light turns on. Press R (RSET) to clear it. Keyboard shortcuts are shown below.',
    },
  ],
};
