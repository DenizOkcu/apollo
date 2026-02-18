import { getAgcState, getAgcStore } from '../stores/agc';
import { getNounDef, formatNounValue } from './nouns';
import { displayAlarms, clearAlarms } from './alarm';

export interface VerbResult {
  ok: boolean;
  error?: string;
}

function applyNounToRegisters(verb: number): VerbResult {
  const state = getAgcState();
  const noun = state.noun;
  if (noun === null) return { ok: false, error: 'No noun' };

  const def = getNounDef(noun);
  if (!def) return { ok: false, error: `Unknown noun ${noun}` };

  const values = def.get(state);
  const regs: ('r1' | 'r2' | 'r3')[] = ['r1', 'r2', 'r3'];

  // Determine how many components to display based on verb
  let count: number;
  const baseVerb = verb <= 7 ? verb : verb - 10;  // monitor verbs 11-17 map to 1-7

  switch (baseVerb) {
    case 1: case 2: case 3: count = 1; break;
    case 4: count = 2; break;
    case 5: case 6: case 7: count = def.components; break;
    default: count = def.components;
  }

  for (let i = 0; i < count && i < 3; i++) {
    const val = values[i];
    const fmt = def.formats[i];
    if (val !== null && val !== undefined) {
      const formatted = formatNounValue(val, fmt);
      state[regs[i]] = {
        sign: formatted.sign,
        digits: formatted.digits,
      };
    } else {
      getAgcStore().blankReg(regs[i]);
    }
  }


  return { ok: true };
}

function startMonitor(): void {
  stopMonitor();
  const state = getAgcState();
  state.monitorActive = true;
  state.monitorVerb = state.verb;
  state.monitorNoun = state.noun;

  // Update immediately
  applyNounToRegisters(state.monitorVerb!);

  // Then every second
  state.monitorInterval = setInterval(() => {
    const s = getAgcState();
    if (s.monitorActive && s.monitorVerb !== null && s.monitorNoun !== null) {
      const savedNoun = s.noun;
      s.noun = s.monitorNoun;
      applyNounToRegisters(s.monitorVerb!);
      s.noun = savedNoun;
    }
  }, 1000);
}

export function stopMonitor(): void {
  const state = getAgcState();
  state.monitorActive = false;
  if (state.monitorInterval) {
    clearInterval(state.monitorInterval);
    state.monitorInterval = null;
  }
}

function startDataLoad(): VerbResult {
  const state = getAgcState();
  const noun = state.noun;
  if (noun === null) return { ok: false, error: 'No noun' };

  const def = getNounDef(noun);
  if (!def) return { ok: false, error: `Unknown noun ${noun}` };
  if (def.readOnly) return { ok: false, error: 'Noun is read-only' };

  const verb = state.verb!;
  const queue: ('r1' | 'r2' | 'r3')[] = [];

  switch (verb) {
    case 21: queue.push('r1'); break;
    case 22: queue.push('r2'); break;
    case 23: queue.push('r3'); break;
    case 24: queue.push('r1', 'r2'); break;
    case 25: queue.push('r1', 'r2', 'r3'); break;
  }

  state.dataLoadQueue = queue;
  state.verbNounFlash = true;
  state.inputMode = 'awaitingData';
  state.inputTarget = queue[0] || null;
  state.inputBuffer = '';

  return { ok: true };
}

function lampTest(): VerbResult {
  const state = getAgcState();
  // Turn on all lights
  const lightKeys = Object.keys(state.lights) as (keyof typeof state.lights)[];
  for (const key of lightKeys) {
    state.lights[key] = true;
  }

  // Fill all digits with 8, all signs with +
  const fullReg = { sign: '+' as const, digits: [8, 8, 8, 8, 8] };
  state.r1 = { ...fullReg };
  state.r2 = { ...fullReg };
  state.r3 = { ...fullReg };

  // Show 88 in verb, noun, program
  state.verb = 88;
  state.noun = 88;
  state.program = 88;
  state.verbNounFlash = false;



  // Restore after 5 seconds
  setTimeout(() => {
    const s = getAgcState();
    const keys2 = Object.keys(s.lights) as (keyof typeof s.lights)[];
    for (const key of keys2) {
      s.lights[key] = false;
    }
    s.verb = null;
    s.noun = null;
    s.program = s.program === 88 ? null : s.program;
    getAgcStore().blankReg('r1');
    getAgcStore().blankReg('r2');
    getAgcStore().blankReg('r3');
  
  }, 5000);

  return { ok: true };
}

function freshStart(): VerbResult {
  const state = getAgcState();
  stopMonitor();
  state.verb = null;
  state.noun = null;
  state.program = 0;
  getAgcStore().blankReg('r1');
  getAgcStore().blankReg('r2');
  getAgcStore().blankReg('r3');
  state.verbNounFlash = false;
  state.inputMode = 'idle';
  state.inputBuffer = '';
  state.inputTarget = null;
  state.dataLoadQueue = [];

  const keys = Object.keys(state.lights) as (keyof typeof state.lights)[];
  for (const key of keys) {
    state.lights[key] = false;
  }

  clearAlarms();

  return { ok: true };
}

function changeProgram(): VerbResult {
  const state = getAgcState();
  // V37: expect next input to be a 2-digit program number
  state.verbNounFlash = true;
  state.inputMode = 'awaitingNoun';  // reuse noun input for program number
  state.inputTarget = 'noun';
  state.inputBuffer = '';

  return { ok: true };
}

export function executeVerb(verb: number, noun: number | null): VerbResult {
  const state = getAgcState();
  state.verb = verb;
  if (noun !== null) state.noun = noun;

  // Display verbs (V01-V07)
  if (verb >= 1 && verb <= 7) {
    if (state.noun === null) return { ok: false, error: 'No noun' };
    return applyNounToRegisters(verb);
  }

  // Monitor verbs (V11-V17)
  if (verb >= 11 && verb <= 17) {
    if (state.noun === null) return { ok: false, error: 'No noun' };
    startMonitor();
    return { ok: true };
  }

  // Load verbs (V21-V25)
  if (verb >= 21 && verb <= 25) {
    return startDataLoad();
  }

  switch (verb) {
    case 33: // Proceed
      state.verbNounFlash = false;
      state.inputMode = 'idle';
    
      return { ok: true };

    case 34: // Terminate
      stopMonitor();
      state.verbNounFlash = false;
      state.inputMode = 'idle';
    
      return { ok: true };

    case 35: // Lamp test
      return lampTest();

    case 36: // Fresh start
      return freshStart();

    case 37: // Change program
      return changeProgram();

    case 5: // Display octal 1,2,3 (used for alarm display)
      if (state.noun === 9) {
        displayAlarms();
        return { ok: true };
      }
      return applyNounToRegisters(verb);

    default:
      return { ok: false, error: `Verb ${verb} not implemented` };
  }
}

export const VERB_DESCRIPTIONS: Record<number, string> = {
  1: 'Display octal comp 1 in R1',
  2: 'Display octal comp 2 in R1',
  3: 'Display octal comp 3 in R1',
  4: 'Display octal comp 1,2 in R1,R2',
  5: 'Display octal comp 1,2,3 in R1,R2,R3',
  6: 'Display decimal',
  7: 'Display DP decimal in R1,R2',
  11: 'Monitor octal comp 1 in R1',
  12: 'Monitor octal comp 2 in R1',
  13: 'Monitor octal comp 3 in R1',
  14: 'Monitor octal comp 1,2 in R1,R2',
  15: 'Monitor octal comp 1,2,3 in R1,R2,R3',
  16: 'Monitor decimal',
  17: 'Monitor DP decimal in R1,R2',
  21: 'Load component 1 into R1',
  22: 'Load component 2 into R2',
  23: 'Load component 3 into R3',
  24: 'Load components 1,2 into R1,R2',
  25: 'Load components 1,2,3 into R1,R2,R3',
  33: 'Proceed without data',
  34: 'Terminate current operation',
  35: 'Lamp test — all lights ON',
  36: 'Fresh start (reboot to P00)',
  37: 'Change major mode (program)',
  50: 'Please perform (checklist)',
  82: 'Display orbit parameters',
  83: 'Display rendezvous parameters',
  99: 'Please enable engine',
};

export const NOUN_DESCRIPTIONS: Record<number, string> = {
  9: 'Alarm codes (3 registers, octal)',
  36: 'AGC clock — HH:MM:SS.cs',
  43: 'Position — Lat / Long / Altitude',
  60: 'Landing — Horiz vel / Alt rate / Altitude',
  62: 'Ascent — Abs vel / Time from ign / Delta-V',
  63: 'Velocity — Abs vel / Alt rate / Altitude',
  64: 'Landing — LPD angle / Alt rate / Altitude',
  68: 'Range — Slant range / Time to go / Alt diff',
};
