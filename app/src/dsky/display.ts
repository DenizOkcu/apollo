import { state, subscribe } from '../core/state';
import type { AGCState } from '../core/state';
import { createDigitElement, setDigitValue, createSignElement, setSignValue } from './segments';

interface DisplayElements {
  // Program display (2 digits)
  progDigits: HTMLElement[];
  // Verb display (2 digits)
  verbDigits: HTMLElement[];
  // Noun display (2 digits)
  nounDigits: HTMLElement[];
  // Register displays (sign + 5 digits each)
  r1Sign: HTMLElement;
  r1Digits: HTMLElement[];
  r2Sign: HTMLElement;
  r2Digits: HTMLElement[];
  r3Sign: HTMLElement;
  r3Digits: HTMLElement[];
  // Verb/noun container (for flash)
  verbNounContainer: HTMLElement;
  // Lights
  lightElements: Record<string, HTMLElement>;
  // Comp acty indicator
  compActy: HTMLElement;
}

let elements: DisplayElements | null = null;

export function createDisplayPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'dsky-display';

  // --- Status lights (left column) ---
  const lightsCol = document.createElement('div');
  lightsCol.className = 'dsky-lights-column';

  const lightDefs: { key: string; label: string }[] = [
    { key: 'uplinkActy', label: 'UPLINK\nACTY' },
    { key: 'noAtt', label: 'NO ATT' },
    { key: 'stby', label: 'STBY' },
    { key: 'keyRel', label: 'KEY REL' },
    { key: 'oprErr', label: 'OPR ERR' },
    { key: 'temp', label: 'TEMP' },
    { key: 'gimbalLock', label: 'GIMBAL\nLOCK' },
    { key: 'prog', label: 'PROG' },
    { key: 'restart', label: 'RESTART' },
    { key: 'tracker', label: 'TRACKER' },
    { key: 'alt', label: 'ALT' },
    { key: 'vel', label: 'VEL' },
  ];

  const lightElements: Record<string, HTMLElement> = {};
  for (const def of lightDefs) {
    const light = document.createElement('div');
    light.className = 'dsky-light';
    light.dataset.light = def.key;
    light.textContent = def.label;
    lightsCol.appendChild(light);
    lightElements[def.key] = light;
  }

  // --- Main display (right side) ---
  const displayMain = document.createElement('div');
  displayMain.className = 'dsky-display-main';

  // COMP ACTY
  const compActy = document.createElement('div');
  compActy.className = 'dsky-comp-acty';
  compActy.textContent = 'COMP\nACTY';

  // Program row
  const progRow = createLabeledDigitRow('PROG', 2);

  // Verb / Noun row
  const verbNounRow = document.createElement('div');
  verbNounRow.className = 'dsky-verb-noun-row';

  const verbGroup = createLabeledDigitRow('VERB', 2);
  const nounGroup = createLabeledDigitRow('NOUN', 2);

  verbNounRow.appendChild(verbGroup.container);
  verbNounRow.appendChild(nounGroup.container);

  const verbNounContainer = document.createElement('div');
  verbNounContainer.className = 'dsky-verb-noun-container';
  verbNounContainer.appendChild(verbNounRow);

  // Separator
  const sep1 = document.createElement('div');
  sep1.className = 'dsky-separator';

  // Registers
  const r1Row = createRegisterRow();
  const r2Row = createRegisterRow();
  const r3Row = createRegisterRow();

  // Separators between registers
  const sep2 = document.createElement('div');
  sep2.className = 'dsky-separator';
  const sep3 = document.createElement('div');
  sep3.className = 'dsky-separator';

  displayMain.appendChild(compActy);
  displayMain.appendChild(progRow.container);
  displayMain.appendChild(verbNounContainer);
  displayMain.appendChild(sep1);
  displayMain.appendChild(r1Row.container);
  displayMain.appendChild(sep2);
  displayMain.appendChild(r2Row.container);
  displayMain.appendChild(sep3);
  displayMain.appendChild(r3Row.container);

  panel.appendChild(lightsCol);
  panel.appendChild(displayMain);

  elements = {
    progDigits: progRow.digits,
    verbDigits: verbGroup.digits,
    nounDigits: nounGroup.digits,
    r1Sign: r1Row.sign,
    r1Digits: r1Row.digits,
    r2Sign: r2Row.sign,
    r2Digits: r2Row.digits,
    r3Sign: r3Row.sign,
    r3Digits: r3Row.digits,
    verbNounContainer,
    lightElements,
    compActy,
  };

  // Subscribe to state changes
  subscribe(updateDisplay);

  return panel;
}

function createLabeledDigitRow(label: string, count: number): { container: HTMLElement; digits: HTMLElement[] } {
  const container = document.createElement('div');
  container.className = 'dsky-labeled-row';

  const labelEl = document.createElement('div');
  labelEl.className = 'dsky-label';
  labelEl.textContent = label;

  const digitsContainer = document.createElement('div');
  digitsContainer.className = 'dsky-digits';

  const digits: HTMLElement[] = [];
  for (let i = 0; i < count; i++) {
    const d = createDigitElement();
    digits.push(d);
    digitsContainer.appendChild(d);
  }

  container.appendChild(labelEl);
  container.appendChild(digitsContainer);

  return { container, digits };
}

function createRegisterRow(): { container: HTMLElement; sign: HTMLElement; digits: HTMLElement[] } {
  const container = document.createElement('div');
  container.className = 'dsky-register';

  const sign = createSignElement();
  container.appendChild(sign);

  const digits: HTMLElement[] = [];
  for (let i = 0; i < 5; i++) {
    const d = createDigitElement();
    digits.push(d);
    container.appendChild(d);
  }

  return { container, sign, digits };
}

function set2DigitDisplay(digitEls: HTMLElement[], value: number | null): void {
  if (value === null) {
    setDigitValue(digitEls[0], null);
    setDigitValue(digitEls[1], null);
  } else {
    const d1 = Math.floor(value / 10) % 10;
    const d2 = value % 10;
    setDigitValue(digitEls[0], d1);
    setDigitValue(digitEls[1], d2);
  }
}

function setRegisterDisplay(
  signEl: HTMLElement,
  digitEls: HTMLElement[],
  reg: { sign: '+' | '-' | null; digits: (number | null)[] }
): void {
  setSignValue(signEl, reg.sign);
  for (let i = 0; i < 5; i++) {
    setDigitValue(digitEls[i], reg.digits[i] ?? null);
  }
}

function updateDisplay(_state: AGCState): void {
  if (!elements) return;

  // Program
  set2DigitDisplay(elements.progDigits, state.program);

  // Verb
  set2DigitDisplay(elements.verbDigits, state.verb);

  // Noun
  set2DigitDisplay(elements.nounDigits, state.noun);

  // Registers
  setRegisterDisplay(elements.r1Sign, elements.r1Digits, state.r1);
  setRegisterDisplay(elements.r2Sign, elements.r2Digits, state.r2);
  setRegisterDisplay(elements.r3Sign, elements.r3Digits, state.r3);

  // Verb/Noun flash
  if (state.verbNounFlash) {
    elements.verbNounContainer.classList.add('flashing');
  } else {
    elements.verbNounContainer.classList.remove('flashing');
  }

  // Lights
  for (const [key, el] of Object.entries(elements.lightElements)) {
    const active = state.lights[key as keyof typeof state.lights];
    el.classList.toggle('active', active);
  }

  // Comp Acty
  elements.compActy.classList.toggle('active', state.lights.compActy);
}
