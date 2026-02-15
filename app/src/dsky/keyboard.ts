import { state, notify, blankReg } from '../core/state';
import { dispatch, completeProgramChange, completeDataLoad } from '../core/cpu';
import { clearAlarms } from '../core/alarm';

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
  // Notify external listeners (for scenarios)
  if (externalKeyListener) {
    externalKeyListener(key);
  }

  // Flash comp acty briefly
  state.lights.compActy = true;
  notify('display');
  setTimeout(() => {
    state.lights.compActy = false;
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
  state.inputMode = 'awaitingVerb';
  state.inputTarget = 'verb';
  verbBuffer = '';
  // Blank verb display while entering
  state.verb = null;
  notify('display');
}

function handleNoun(): void {
  state.inputMode = 'awaitingNoun';
  state.inputTarget = 'noun';
  nounBuffer = '';
  // Blank noun display while entering
  state.noun = null;
  notify('display');
}

function handleDigit(digit: string): void {
  if (state.inputMode === 'awaitingVerb') {
    verbBuffer += digit;
    // Show partial entry
    if (verbBuffer.length === 1) {
      state.verb = parseInt(digit, 10) * 10;  // show first digit in tens place
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
      // Update display to show digits being entered
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
  state.lights.oprErr = true;
  notify('display');
}

function handleSign(sign: '+' | '-'): void {
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

  // Sign not valid outside data entry
  state.lights.oprErr = true;
  notify('display');
}

function handleEnter(): void {
  if (state.inputMode === 'awaitingVerb') {
    if (verbBuffer.length > 0) {
      state.verb = parseInt(verbBuffer.padEnd(2, '0'), 10);
    }
    state.inputMode = 'idle';
    state.inputTarget = null;
    // Don't dispatch yet — wait for noun
    notify('display');
    return;
  }

  if (state.inputMode === 'awaitingNoun') {
    if (nounBuffer.length > 0) {
      const num = parseInt(nounBuffer.padEnd(2, '0'), 10);
      // If V37, this is a program number
      if (state.verb === 37) {
        completeProgramChange(num);
        return;
      }
      state.noun = num;
    }
    state.inputMode = 'idle';
    state.inputTarget = null;

    // If we have both verb and noun, dispatch
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
      // Not enough digits
      state.lights.oprErr = true;
      notify('display');
    }
    return;
  }

  // Idle mode with verb/noun set — dispatch
  if (state.verb !== null) {
    dispatch();
    return;
  }

  state.lights.oprErr = true;
  notify('display');
}

function handleClear(): void {
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
  // Clear everything visible
  blankReg('r1');
  blankReg('r2');
  blankReg('r3');
  notify('display');
}

function handleProceed(): void {
  state.verbNounFlash = false;
  state.inputMode = 'idle';
  state.inputTarget = null;
  state.dataLoadQueue = [];
  notify('display');
}

function handleKeyRelease(): void {
  state.lights.keyRel = false;
  notify('display');
}

function handleReset(): void {
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
  '+': 'PLUS', '=': 'PLUS',  // = is shift-less + on most keyboards
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
