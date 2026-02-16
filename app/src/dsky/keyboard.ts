import { getState, notify, blankReg } from '../core/state';
import { dispatch, completeProgramChange, completeDataLoad } from '../core/cpu';
import { clearAlarms } from '../core/alarm';
import { triggerOprErr } from './opr-err';

export type DSKYKey =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'VERB' | 'NOUN' | 'ENTER' | 'CLR' | 'PRO' | 'KEY_REL' | 'RSET'
  | 'PLUS' | 'MINUS';

type KeyCallback = (key: DSKYKey) => void;
let externalKeyListener: KeyCallback | null = null;

export function setKeyListener(cb: KeyCallback | null): void {
  externalKeyListener = cb;
}

// Verb digit accumulation
let verbBuffer = '';
let nounBuffer = '';
let dataSign: '+' | '-' = '+';
let dataBuffer = '';

export function pressKey(key: DSKYKey): void {
  const state = getState();

  // Notify external listeners (for scenarios)
  if (externalKeyListener) {
    externalKeyListener(key);
  }

  // Flash comp acty briefly
  state.lights.compActy = true;
  notify('display');
  setTimeout(() => {
    const s = getState();
    s.lights.compActy = false;
    notify('display');
  }, 150);

  switch (key) {
    case 'VERB':
      handleVerb();
      break;
    case 'NOUN':
      handleNoun();
      break;
    case 'ENTER':
      handleEnter();
      break;
    case 'CLR':
      handleClear();
      break;
    case 'PRO':
      handleProceed();
      break;
    case 'KEY_REL':
      handleKeyRelease();
      break;
    case 'RSET':
      handleReset();
      break;
    case 'PLUS':
      handleSign('+');
      break;
    case 'MINUS':
      handleSign('-');
      break;
    default:
      // Digit 0-9
      handleDigit(key);
      break;
  }
}

function handleVerb(): void {
  const state = getState();
  state.inputMode = 'awaitingVerb';
  state.inputTarget = 'verb';
  verbBuffer = '';
  state.verb = null;
  notify('display');
}

function handleNoun(): void {
  const state = getState();
  state.inputMode = 'awaitingNoun';
  state.inputTarget = 'noun';
  nounBuffer = '';
  state.noun = null;
  notify('display');
}

function handleDigit(digit: string): void {
  const state = getState();

  if (state.inputMode === 'awaitingVerb') {
    verbBuffer += digit;
    if (verbBuffer.length === 1) {
      state.verb = parseInt(digit, 10) * 10;
    }
    if (verbBuffer.length >= 2) {
      state.verb = parseInt(verbBuffer.slice(0, 2), 10);
      state.inputMode = 'idle';
      state.inputTarget = null;
    }
    notify('display');
    return;
  }

  if (state.inputMode === 'awaitingNoun') {
    nounBuffer += digit;
    if (nounBuffer.length === 1) {
      state.noun = parseInt(digit, 10) * 10;
    }
    if (nounBuffer.length >= 2) {
      state.noun = parseInt(nounBuffer.slice(0, 2), 10);
      state.inputMode = 'idle';
      state.inputTarget = null;
    }
    notify('display');
    return;
  }

  if (state.inputMode === 'awaitingData') {
    if (dataBuffer.length < 5) {
      dataBuffer += digit;
      const reg = state.inputTarget as 'r1' | 'r2' | 'r3';
      if (reg) {
        const padded = dataBuffer.padEnd(5, ' ');
        state[reg] = {
          sign: dataSign,
          digits: padded.split('').map(c => c === ' ' ? null : parseInt(c, 10)),
        };
        notify('display');
      }
    }
    return;
  }

  // Not in any input mode — operator error
  triggerOprErr('digit-idle');
}

function handleSign(sign: '+' | '-'): void {
  const state = getState();

  if (state.inputMode === 'awaitingData') {
    dataSign = sign;
    dataBuffer = '';
    const reg = state.inputTarget as 'r1' | 'r2' | 'r3';
    if (reg) {
      state[reg] = {
        sign,
        digits: [null, null, null, null, null],
      };
      notify('display');
    }
    return;
  }

  triggerOprErr('sign-idle');
}

function handleEnter(): void {
  const state = getState();

  if (state.inputMode === 'awaitingVerb') {
    if (verbBuffer.length > 0) {
      state.verb = parseInt(verbBuffer.padEnd(2, '0'), 10);
    }
    state.inputMode = 'idle';
    state.inputTarget = null;
    notify('display');
    return;
  }

  if (state.inputMode === 'awaitingNoun') {
    if (nounBuffer.length > 0) {
      const num = parseInt(nounBuffer.padEnd(2, '0'), 10);
      if (state.verb === 37) {
        completeProgramChange(num);
        return;
      }
      state.noun = num;
    }
    state.inputMode = 'idle';
    state.inputTarget = null;

    if (state.verb !== null) {
      dispatch();
    }
    return;
  }

  if (state.inputMode === 'awaitingData') {
    if (dataBuffer.length === 5) {
      const reg = state.inputTarget as 'r1' | 'r2' | 'r3';
      if (reg) {
        completeDataLoad(reg, dataSign, dataBuffer);
        dataSign = '+';
        dataBuffer = '';
      }
    } else {
      triggerOprErr('enter-no-data');
    }
    return;
  }

  if (state.verb !== null) {
    dispatch();
    return;
  }

  triggerOprErr('enter-no-verb');
}

function handleClear(): void {
  const state = getState();

  if (state.inputMode === 'awaitingVerb') {
    verbBuffer = '';
    state.verb = null;
    notify('display');
    return;
  }
  if (state.inputMode === 'awaitingNoun') {
    nounBuffer = '';
    state.noun = null;
    notify('display');
    return;
  }
  if (state.inputMode === 'awaitingData') {
    dataBuffer = '';
    const reg = state.inputTarget as 'r1' | 'r2' | 'r3';
    if (reg) {
      state[reg] = {
        sign: dataSign,
        digits: [null, null, null, null, null],
      };
      notify('display');
    }
    return;
  }
  blankReg('r1');
  blankReg('r2');
  blankReg('r3');
  notify('display');
}

function handleProceed(): void {
  const state = getState();
  state.verbNounFlash = false;
  state.inputMode = 'idle';
  state.inputTarget = null;
  state.dataLoadQueue = [];
  notify('display');
}

function handleKeyRelease(): void {
  const state = getState();
  state.lights.keyRel = false;
  notify('display');
}

function handleReset(): void {
  const state = getState();
  state.lights.oprErr = false;
  state.lights.prog = false;
  clearAlarms();
  notify('display');
}

// Map physical keyboard to DSKY keys
const KEY_MAP: Record<string, DSKYKey> = {
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  'v': 'VERB', 'n': 'NOUN',
  'Enter': 'ENTER',
  'c': 'CLR', 'Backspace': 'CLR',
  'p': 'PRO',
  'k': 'KEY_REL',
  'r': 'RSET',
  '+': 'PLUS', '=': 'PLUS',
  '-': 'MINUS',
};

export function bindPhysicalKeyboard(): void {
  document.addEventListener('keydown', (e) => {
    const mapped = KEY_MAP[e.key];
    if (mapped) {
      e.preventDefault();
      pressKey(mapped);
    }
  });
}
