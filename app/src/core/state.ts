// Bridge module — all types and state live in the Pinia store.
// This module re-exports them so existing core modules keep working unchanged.
// `notify()` is a no-op: Vue's reactivity propagates changes automatically.

import { useAgcStore } from '../stores/agc';

export type {
  AGCState, RegisterValue, DSKYLights, NavState, InputTarget, InputMode,
} from '../stores/agc';

// Lazily resolved store singleton.
let _store: ReturnType<typeof useAgcStore> | null = null;
function store() {
  if (!_store) _store = useAgcStore();
  return _store;
}

// The reactive AGCState object.  Must be called after Pinia is installed.
// We use a getter-based proxy so `import { state } from './state'` isn't
// possible with verbatimModuleSyntax — callers use `getState()` instead.
export function getState() { return store().state; }

// No-op — Vue reactivity replaces the pub-sub pattern.
export function notify(_changedKey?: string): void {}

export function resetState(): void { store().resetState(); }

export function setRegister(
  reg: 'r1' | 'r2' | 'r3',
  sign: '+' | '-' | null,
  value: number,
  format: 'decimal' | 'octal' | 'blank' = 'decimal'
): void {
  store().setRegister(reg, sign, value, format);
}

export function blankReg(reg: 'r1' | 'r2' | 'r3'): void {
  store().blankReg(reg);
}
