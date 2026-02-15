import { state, notify } from './state';
import { executeVerb, stopMonitor } from './verbs';
import { triggerOprErr } from '../dsky/opr-err';
import { getCodeBlockForCommand } from './verb-code-map';
import { showCodeBlock, clearCodeViewer } from '../ui/code-viewer';

export function dispatch(): boolean {
  const verb = state.verb;
  const noun = state.noun;

  if (verb === null) {
    triggerOprErr('enter-no-verb');
    return false;
  }

  // V37 (change program) is handled specially in the keyboard module
  // after the program number is entered
  if (verb === 37) {
    const result = executeVerb(37, noun);
    return result.ok;
  }

  // Stop any existing monitor when starting a new command
  if (state.monitorActive && verb >= 1 && verb <= 37) {
    stopMonitor();
  }

  const result = executeVerb(verb, noun);
  if (!result.ok) {
    triggerOprErr('dispatch-fail');
    return false;
  }

  // Flash stops on successful non-load verbs
  if (verb < 21 || verb > 25) {
    state.verbNounFlash = false;
  }

  notify('display');

  if (!state.scenarioActive) {
    const codeBlock = getCodeBlockForCommand(verb, state.noun);
    if (codeBlock) {
      clearCodeViewer();
      showCodeBlock(codeBlock);
    }
  }

  return true;
}

export function completeProgramChange(programNumber: number): void {
  stopMonitor();
  state.program = programNumber;
  state.verb = null;
  state.noun = null;
  state.verbNounFlash = false;
  state.inputMode = 'idle';
  state.inputBuffer = '';
  state.inputTarget = null;
  notify('display');

  if (!state.scenarioActive) {
    const codeBlock = getCodeBlockForCommand(37, null);
    if (codeBlock) {
      clearCodeViewer();
      showCodeBlock(codeBlock);
    }
  }
}

export function completeDataLoad(reg: 'r1' | 'r2' | 'r3', sign: '+' | '-', digits: string): void {
  state[reg] = {
    sign,
    digits: digits.padStart(5, '0').split('').map(Number),
  };

  // Advance to next register in queue
  state.dataLoadQueue.shift();

  if (state.dataLoadQueue.length > 0) {
    state.inputTarget = state.dataLoadQueue[0];
    state.inputBuffer = '';
    state.inputMode = 'awaitingData';
  } else {
    // All data loaded
    state.verbNounFlash = false;
    state.inputMode = 'idle';
    state.inputTarget = null;
    state.inputBuffer = '';
  }

  notify('display');
}
