import type { Scenario } from './scenario-runner';
import { pressKey } from '../dsky/keyboard';

export const lampTestScenario: Scenario = {
  id: 'lamp-test',
  title: 'Lamp Test',
  steps: [
    {
      time: 0,
      action: 'setState',
      stateChanges: { program: 0, verb: null, noun: null },
    },
    {
      time: 500,
      action: 'narrate',
      text: 'Before every critical operation, astronauts tested the DSKY display to verify all segments worked.',
    },
    {
      time: 3000,
      action: 'narrate',
      text: 'Type V 3 5 ENTER to run a lamp test. Or just watch — we\'ll do it automatically in a moment.',
    },
    // Auto-execute lamp test after giving the user a chance
    {
      time: 8000,
      action: 'callback',
      callback: () => {
        pressKey('VERB');
        setTimeout(() => pressKey('3'), 300);
        setTimeout(() => pressKey('5'), 600);
        setTimeout(() => pressKey('ENTER'), 900);
      },
    },
    {
      time: 9500,
      action: 'narrate',
      text: 'V35 — LAMP TEST. Every segment and indicator light is now active. The real DSKY used electroluminescent displays that glowed green.',
    },
    {
      time: 14000,
      action: 'narrate',
      text: 'All systems nominal. The display is ready for operations.',
    },
    {
      time: 16000,
      action: 'narrate',
      text: 'Try V16 N36 ENTER to see the mission clock, or pick another scenario from the menu.',
    },
  ],
};
