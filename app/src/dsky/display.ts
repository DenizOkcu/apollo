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

  const lightDefs: { key: string; label: string; tooltip: string }[] = [
    { key: 'uplinkActy', label: 'UPLINK\nACTY', tooltip: 'UPLINK ACTY — Lit when the AGC is receiving data from Mission Control.' },
    { key: 'noAtt', label: 'NO ATT', tooltip: 'NO ATT — The inertial platform has lost its attitude reference.' },
    { key: 'stby', label: 'STBY', tooltip: 'STBY — The computer is in standby mode to conserve power.' },
    { key: 'keyRel', label: 'KEY REL', tooltip: 'KEY REL — The computer needs the display back; press KEY REL to release it.' },
    { key: 'oprErr', label: 'OPR ERR', tooltip: 'OPR ERR — You pressed an invalid key sequence; press RSET to clear.' },
    { key: 'temp', label: 'TEMP', tooltip: 'TEMP — The stable platform temperature is out of tolerance.' },
    { key: 'gimbalLock', label: 'GIMBAL\nLOCK', tooltip: 'GIMBAL LOCK — The IMU gimbals are near alignment; attitude must change to avoid losing reference.' },
    { key: 'prog', label: 'PROG', tooltip: 'PROG — A program alarm has occurred; check the alarm code with V05 N09.' },
    { key: 'restart', label: 'RESTART', tooltip: 'RESTART — The computer has restarted due to a software or hardware error.' },
    { key: 'tracker', label: 'TRACKER', tooltip: 'TRACKER — The rendezvous radar or landing radar is tracking a target.' },
    { key: 'alt', label: 'ALT', tooltip: 'ALT — Altitude data from the landing radar disagrees with the computer\'s estimate.' },
    { key: 'vel', label: 'VEL', tooltip: 'VEL — Velocity data from the landing radar disagrees with the computer\'s estimate.' },
  ];

  const lightElements: Record<string, HTMLElement> = {};
  for (const def of lightDefs) {
    const light = document.createElement('div');
    light.className = 'dsky-light';
    light.dataset.light = def.key;
    light.textContent = def.label;
    light.title = def.tooltip;
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
  compActy.title = 'COMP ACTY — Flashes when the computer is processing a command.';

  // Program row
  const progRow = createLabeledDigitRow('PROG', 2);
  progRow.container.title = 'PROG — The current program number running on the AGC (e.g. P63 = lunar braking).';

  // Verb / Noun row
  const verbNounRow = document.createElement('div');
  verbNounRow.className = 'dsky-verb-noun-row';

  const verbGroup = createLabeledDigitRow('VERB', 2);
  verbGroup.container.title = 'VERB — The action code telling the computer what to do (e.g. V16 = monitor, V35 = lamp test).';
  const nounGroup = createLabeledDigitRow('NOUN', 2);
  nounGroup.container.title = 'NOUN — The data code telling the computer what to display (e.g. N62 = velocity/time/delta-V).';

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
  r1Row.container.title = 'Register 1 — The first data field; its meaning depends on the active verb/noun.';
  const r2Row = createRegisterRow();
  r2Row.container.title = 'Register 2 — The second data field; its meaning depends on the active verb/noun.';
  const r3Row = createRegisterRow();
  r3Row.container.title = 'Register 3 — The third data field; its meaning depends on the active verb/noun.';

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
