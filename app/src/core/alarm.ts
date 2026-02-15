import { state, notify } from './state';

export function triggerAlarm(code: number): void {
  // Store in first available failreg slot
  if (state.failreg[0] === 0) {
    state.failreg[0] = code;
  } else if (state.failreg[1] === 0) {
    state.failreg[1] = code;
  } else {
    // Third slot gets overwritten with bit 15 set for overflow
    state.failreg[2] = code | 0o100000;
  }

  state.lights.prog = true;
  notify('alarm');
}

export function displayAlarms(): void {
  state.verb = 5;
  state.noun = 9;
  state.verbNounFlash = true;

  // Display alarm codes in octal
  const f0 = state.failreg[0];
  const f1 = state.failreg[1];
  const f2 = state.failreg[2];

  setOctalRegister('r1', f0);
  setOctalRegister('r2', f1);
  setOctalRegister('r3', f2);
  notify('display');
}

function setOctalRegister(reg: 'r1' | 'r2' | 'r3', value: number): void {
  const str = value.toString(8).padStart(5, '0').slice(-5);
  state[reg] = {
    sign: null,
    digits: str.split('').map(Number),
  };
}

export function clearAlarms(): void {
  state.failreg = [0, 0, 0];
  state.lights.prog = false;
  notify('alarm');
}

export const ALARM_DESCRIPTIONS: Record<number, string> = {
  0o1201: 'Executive overflow — no VAC areas',
  0o1202: 'Executive overflow — no core sets',
  0o1203: 'Waitlist overflow',
  0o1210: 'IMU device busy — two programs accessing same hardware',
  0o210: 'IMU not operating',
  0o220: 'IMU orientation not yet determined',
  0o404: 'Guidance cycle not converging',
  0o777: 'PIPA failure',
};
