import type { Scenario } from './scenario-runner';

export const freePlayScenario: Scenario = {
  id: 'free-play',
  title: 'Explore Freely',
  steps: [
    {
      time: 0,
      action: 'setState',
      stateChanges: { program: 0, verb: null, noun: null, verbNounFlash: false },
    },
    {
      time: 0,
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
      time: 500,
      action: 'narrate',
      text: 'You have full control of the DSKY. Try these commands:',
    },
    {
      time: 2500,
      action: 'narrate',
      text: 'V35 ENTR — Lamp test (light up everything)',
    },
    {
      time: 4000,
      action: 'narrate',
      text: 'V16 N36 ENTR — Display the mission clock (auto-updating)',
    },
    {
      time: 5500,
      action: 'narrate',
      text: 'V06 N43 ENTR — Display position (lat/long/alt)',
    },
    {
      time: 7000,
      action: 'narrate',
      text: 'V16 N60 ENTR — Monitor landing data (velocity/altitude)',
    },
    {
      time: 8500,
      action: 'narrate',
      text: 'V36 ENTR — Fresh start (reboot)',
    },
    {
      time: 10000,
      action: 'narrate',
      text: 'Type VERB (V key) then 2 digits, NOUN (N key) then 2 digits, then ENTER.',
    },
    {
      time: 12000,
      action: 'narrate',
      text: 'If you make a mistake, the OPR ERR light turns on. Press R (RSET) to clear it.',
    },
    {
      time: 14000,
      action: 'narrate',
      text: 'The keyboard shortcuts are shown at the bottom of the screen. Explore!',
    },
  ],
};
