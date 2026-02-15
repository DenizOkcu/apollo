import type { Scenario } from './scenario-runner';
import { pressKey } from '../dsky/keyboard';

export const lampTestScenario: Scenario = {
  id: 'lamp-test',
  title: 'Lamp Test',
  steps: [
    {
      delay: 0,
      action: 'setState',
      stateChanges: { program: 0, verb: null, noun: null },
    },
    {
      delay: 500,
      action: 'narrate',
      text: 'Before every critical operation, astronauts tested the DSKY display to verify all segments worked.',
    },
    {
      delay: 3000,
      action: 'narrate',
      text: 'Type V 3 5 ENTER to run a lamp test — this lights up every segment and indicator.',
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
      text: 'Now type 3 5 and press ENTER.',
    },
    {
      delay: 0,
      action: 'waitForKey',
      key: 'ENTER',
      keyHint: 'Type 3 5 then press ENTER.',
    },
    // Auto-trigger lamp test in case the user typed something slightly different
    {
      delay: 200,
      action: 'callback',
      callback: () => {
        pressKey('VERB');
        setTimeout(() => pressKey('3'), 100);
        setTimeout(() => pressKey('5'), 200);
        setTimeout(() => pressKey('ENTER'), 300);
      },
    },
    {
      delay: 1000,
      action: 'narrate',
      text: 'V35 — LAMP TEST. Every segment and indicator light is now active. The real DSKY used electroluminescent displays that glowed green — just like this.',
    },
    {
      delay: 6000,
      action: 'narrate',
      text: 'All systems nominal. The display is verified and ready for operations.',
    },
    {
      delay: 3000,
      action: 'narrate',
      text: 'Try V16 N36 ENTER to see the mission clock, or pick another scenario.',
    },
  ],
};
