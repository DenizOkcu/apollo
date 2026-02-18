import { getAgcState, getAgcStore } from '../stores/agc';

export function triggerAlarm(code: number): void {
  const state = getAgcState();
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
}

export function displayAlarms(): void {
  const state = getAgcState();
  const store = getAgcStore();

  state.verb = 5;
  state.noun = 9;
  state.verbNounFlash = true;

  // Display alarm codes in octal using store's setRegister
  store.setRegister('r1', null, state.failreg[0], 'octal');
  store.setRegister('r2', null, state.failreg[1], 'octal');
  store.setRegister('r3', null, state.failreg[2], 'octal');
}

export function clearAlarms(): void {
  const state = getAgcState();
  state.failreg = [0, 0, 0];
  state.lights.prog = false;
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
