import { getAgcState, getAgcStore } from '../stores/agc';
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

export function pressKey(key: DSKYKey): void {
  const state = getAgcState();

  // Notify external listeners (for scenarios)
  if (externalKeyListener) {
    externalKeyListener(key);
  }

  // Flash comp acty briefly
  state.lights.compActy = true;

  setTimeout(() => {
    const s = getAgcState();
    s.lights.compActy = false;
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
  const state = getAgcState();
  state.inputMode = 'awaitingVerb';
  state.inputTarget = 'verb';
  state.verbBuffer = '';
  state.verb = null;
}

function handleNoun(): void {
  const state = getAgcState();
  state.inputMode = 'awaitingNoun';
  state.inputTarget = 'noun';
  state.nounBuffer = '';
  state.noun = null;
}

function handleDigit(digit: string): void {
  const state = getAgcState();

  if (state.inputMode === 'awaitingVerb') {
    state.verbBuffer += digit;
    if (state.verbBuffer.length === 1) {
      state.verb = parseInt(digit, 10) * 10;
    }
    if (state.verbBuffer.length >= 2) {
      state.verb = parseInt(state.verbBuffer.slice(0, 2), 10);
      state.inputMode = 'idle';
      state.inputTarget = null;
    }
    return;
  }

  if (state.inputMode === 'awaitingNoun') {
    state.nounBuffer += digit;
    if (state.nounBuffer.length === 1) {
      state.noun = parseInt(digit, 10) * 10;
    }
    if (state.nounBuffer.length >= 2) {
      state.noun = parseInt(state.nounBuffer.slice(0, 2), 10);
      state.inputMode = 'idle';
      state.inputTarget = null;
    }
    return;
  }

  if (state.inputMode === 'awaitingData') {
    if (state.dataBuffer.length < 5) {
      state.dataBuffer += digit;
      const reg = state.inputTarget as 'r1' | 'r2' | 'r3';
      if (reg) {
        const padded = state.dataBuffer.padEnd(5, ' ');
        state[reg] = {
          sign: state.dataSign,
          digits: padded.split('').map(c => c === ' ' ? null : parseInt(c, 10)),
        };
      }
    }
    return;
  }

  // Not in any input mode — operator error
  triggerOprErr('digit-idle');
}

function handleSign(sign: '+' | '-'): void {
  const state = getAgcState();

  if (state.inputMode === 'awaitingData') {
    state.dataSign = sign;
    state.dataBuffer = '';
    const reg = state.inputTarget as 'r1' | 'r2' | 'r3';
    if (reg) {
      state[reg] = {
        sign,
        digits: [null, null, null, null, null],
      };
    }
    return;
  }

  triggerOprErr('sign-idle');
}

function handleEnter(): void {
  const state = getAgcState();

  if (state.inputMode === 'awaitingVerb') {
    if (state.verbBuffer.length > 0) {
      state.verb = parseInt(state.verbBuffer.padEnd(2, '0'), 10);
    }
    state.inputMode = 'idle';
    state.inputTarget = null;
    return;
  }

  if (state.inputMode === 'awaitingNoun') {
    if (state.nounBuffer.length > 0) {
      const num = parseInt(state.nounBuffer.padEnd(2, '0'), 10);
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
    if (state.dataBuffer.length === 5) {
      const reg = state.inputTarget as 'r1' | 'r2' | 'r3';
      if (reg) {
        completeDataLoad(reg, state.dataSign, state.dataBuffer);
        state.dataSign = '+';
        state.dataBuffer = '';
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
  const state = getAgcState();

  if (state.inputMode === 'awaitingVerb') {
    state.verbBuffer = '';
    state.verb = null;
    return;
  }
  if (state.inputMode === 'awaitingNoun') {
    state.nounBuffer = '';
    state.noun = null;
    return;
  }
  if (state.inputMode === 'awaitingData') {
    state.dataBuffer = '';
    const reg = state.inputTarget as 'r1' | 'r2' | 'r3';
    if (reg) {
      state[reg] = {
        sign: state.dataSign,
        digits: [null, null, null, null, null],
      };
    }
    return;
  }
  const store = getAgcStore();
  store.blankReg('r1');
  store.blankReg('r2');
  store.blankReg('r3');
}

function handleProceed(): void {
  const state = getAgcState();
  state.verbNounFlash = false;
  state.inputMode = 'idle';
  state.inputTarget = null;
  state.dataLoadQueue = [];
}

function handleKeyRelease(): void {
  const state = getAgcState();
  state.lights.keyRel = false;
}

function handleReset(): void {
  const state = getAgcState();
  state.lights.oprErr = false;
  state.lights.prog = false;
  clearAlarms();
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

let keyboardCleanup: (() => void) | null = null;

export function bindPhysicalKeyboard(): () => void {
  const handler = (e: KeyboardEvent) => {
    const mapped = KEY_MAP[e.key];
    if (mapped) {
      e.preventDefault();
      pressKey(mapped);
    }
  };

  document.addEventListener('keydown', handler);

  keyboardCleanup = () => {
    document.removeEventListener('keydown', handler);
    keyboardCleanup = null;
  };

  return keyboardCleanup;
}

export function unbindPhysicalKeyboard(): void {
  if (keyboardCleanup) {
    keyboardCleanup();
  }
}
