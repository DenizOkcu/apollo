import { state, notify } from '../core/state';
import { appendNarration, clearNarration } from '../ui/panel';
import { showCodeBlock, clearCodeViewer, addCodeSeparator } from '../ui/code-viewer';
import { setKeyListener, pressKey } from '../dsky/keyboard';
import type { DSKYKey } from '../dsky/keyboard';
import type { AGCCodeBlock } from '../core/agc-source';
import { clearAlarms } from '../core/alarm';

export interface ScenarioStep {
  delay: number;  // ms to wait AFTER the previous step completes before executing this one
  action: 'narrate' | 'setState' | 'waitForKey' | 'setNav' | 'setLights' | 'callback' | 'showCode';
  text?: string;
  timestamp?: string;
  stateChanges?: Partial<typeof state>;
  navChanges?: Partial<typeof state.nav>;
  lightChanges?: Partial<typeof state.lights>;
  key?: DSKYKey;
  keyHint?: string;  // shown as a highlighted prompt to the user
  callback?: () => void;
  codeBlock?: AGCCodeBlock;  // AGC source code block to display
}

export interface Scenario {
  id: string;
  title: string;
  steps: ScenarioStep[];
  onComplete?: () => void;
}

let currentScenario: Scenario | null = null;
let currentStepIndex = 0;
let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
let waitingForKey: DSKYKey | null = null;
let telemetryInterval: ReturnType<typeof setInterval> | null = null;
let cancelled = false;
let nudgeShown = false;
let autoRecoveryTimeout: ReturnType<typeof setTimeout> | null = null;

const KEY_LABELS: Record<string, string> = {
  VERB: 'V (VERB)',
  NOUN: 'N (NOUN)',
  ENTER: 'ENTER',
  PRO: 'P (PRO)',
  RSET: 'R (RSET)',
  KEY_REL: 'K (KEY REL)',
  CLR: 'C (CLR)',
  PLUS: '+ (PLUS)',
  MINUS: '- (MINUS)',
};

function getNudgeMessage(expected: DSKYKey, _pressed: DSKYKey): string {
  switch (expected) {
    case 'VERB':
      return 'Not quite — start by pressing V (VERB) to begin the command.';
    case 'ENTER':
      return 'Almost there — press ENTER when you\'re ready to execute.';
    case 'PRO':
      return 'The computer is waiting for your confirmation — press P (PRO) to proceed.';
    case 'RSET':
      return 'Press R (RSET) to acknowledge and clear the alarm.';
    case 'KEY_REL':
      return 'The computer needs the display back — press K (KEY REL) to release it.';
    default:
      return `Not quite — try pressing ${KEY_LABELS[expected] || expected}.`;
  }
}

function clearAutoRecovery(): void {
  if (autoRecoveryTimeout) {
    clearTimeout(autoRecoveryTimeout);
    autoRecoveryTimeout = null;
  }
}

export function runScenario(scenario: Scenario): void {
  stopScenario();
  clearNarration();
  clearCodeViewer();

  // Reset display state so no lights/flash carry over from a previous scenario
  clearAlarms();
  state.lights.compActy = false;
  state.lights.uplinkActy = false;
  state.lights.noAtt = false;
  state.lights.stby = false;
  state.lights.keyRel = false;
  state.lights.oprErr = false;
  state.lights.temp = false;
  state.lights.gimbalLock = false;
  state.lights.prog = false;
  state.lights.restart = false;
  state.lights.tracker = false;
  state.lights.alt = false;
  state.lights.vel = false;
  state.verbNounFlash = false;
  state.inputMode = 'idle';
  state.inputBuffer = '';
  state.inputTarget = null;
  state.dataLoadQueue = [];
  if (state.monitorInterval) {
    clearInterval(state.monitorInterval);
    state.monitorInterval = null;
  }
  state.monitorActive = false;
  state.monitorVerb = null;
  state.monitorNoun = null;
  notify('display');

  currentScenario = scenario;
  currentStepIndex = 0;
  cancelled = false;
  state.scenarioActive = true;

  setKeyListener((key) => {
    if (waitingForKey && key === waitingForKey) {
      clearAutoRecovery();
      nudgeShown = false;
      waitingForKey = null;
      // Key matched — advance to next step immediately
      advanceToNextStep();
    } else if (waitingForKey) {
      // Wrong key — show nudge once and start/restart auto-recovery
      if (!nudgeShown) {
        nudgeShown = true;
        appendNarration(getNudgeMessage(waitingForKey, key));
      }
      clearAutoRecovery();
      const expectedKey = waitingForKey;
      autoRecoveryTimeout = setTimeout(() => {
        autoRecoveryTimeout = null;
        if (waitingForKey === expectedKey && !cancelled) {
          pressKey(expectedKey);
        }
      }, 5000);
    }
  });

  // Begin processing from the first step
  scheduleNextStep();
}

export function stopScenario(): void {
  cancelled = true;
  currentScenario = null;
  currentStepIndex = 0;
  waitingForKey = null;
  nudgeShown = false;
  clearAutoRecovery();

  if (pendingTimeout) {
    clearTimeout(pendingTimeout);
    pendingTimeout = null;
  }

  if (telemetryInterval) {
    clearInterval(telemetryInterval);
    telemetryInterval = null;
  }

  state.scenarioActive = false;
  setKeyListener(null);
}

function scheduleNextStep(): void {
  if (cancelled || !currentScenario) return;
  if (currentStepIndex >= currentScenario.steps.length) {
    // Scenario complete
    if (currentScenario.onComplete) currentScenario.onComplete();
    state.scenarioActive = false;
    setKeyListener(null);
    return;
  }

  const step = currentScenario.steps[currentStepIndex];

  if (step.delay > 0) {
    pendingTimeout = setTimeout(() => {
      pendingTimeout = null;
      executeCurrentStep();
    }, step.delay);
  } else {
    // Zero delay — execute immediately (but yield to let DOM update)
    pendingTimeout = setTimeout(() => {
      pendingTimeout = null;
      executeCurrentStep();
    }, 0);
  }
}

function executeCurrentStep(): void {
  if (cancelled || !currentScenario) return;
  if (currentStepIndex >= currentScenario.steps.length) return;

  const step = currentScenario.steps[currentStepIndex];

  switch (step.action) {
    case 'narrate':
      if (step.text) {
        appendNarration(step.text, step.timestamp);
      }
      advanceToNextStep();
      break;

    case 'setState':
      if (step.stateChanges) {
        Object.assign(state, step.stateChanges);
        notify('display');
      }
      advanceToNextStep();
      break;

    case 'setNav':
      if (step.navChanges) {
        Object.assign(state.nav, step.navChanges);
        notify('display');
      }
      advanceToNextStep();
      break;

    case 'setLights':
      if (step.lightChanges) {
        Object.assign(state.lights, step.lightChanges);
        notify('display');
      }
      advanceToNextStep();
      break;

    case 'callback':
      if (step.callback) step.callback();
      advanceToNextStep();
      break;

    case 'showCode':
      if (step.codeBlock) {
        addCodeSeparator();
        showCodeBlock(step.codeBlock);
      }
      advanceToNextStep();
      break;

    case 'waitForKey':
      // BLOCK here — do NOT advance until the key is pressed
      nudgeShown = false;
      clearAutoRecovery();
      waitingForKey = step.key || null;
      if (step.keyHint) {
        appendNarration(step.keyHint, '  >>');
      }
      // The key listener (set up in runScenario) will call advanceToNextStep()
      break;
  }
}

function advanceToNextStep(): void {
  currentStepIndex++;
  scheduleNextStep();
}

// Helper: start a telemetry animation that interpolates nav values over time
export function startTelemetry(
  duration: number,
  from: Partial<typeof state.nav>,
  to: Partial<typeof state.nav>,
  onTick?: () => void
): void {
  if (telemetryInterval) clearInterval(telemetryInterval);

  const startTime = Date.now();
  const startValues: Record<string, number> = {};
  const endValues: Record<string, number> = {};

  for (const key of Object.keys(to) as (keyof typeof state.nav)[]) {
    startValues[key] = from[key] ?? state.nav[key];
    endValues[key] = to[key]!;
  }

  telemetryInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 2);

    for (const key of Object.keys(endValues)) {
      const navKey = key as keyof typeof state.nav;
      (state.nav as any)[navKey] = startValues[key] + (endValues[key] - startValues[key]) * eased;
    }

    if (state.monitorActive || onTick) {
      notify('display');
      if (onTick) onTick();
    }

    if (t >= 1 && telemetryInterval) {
      clearInterval(telemetryInterval);
      telemetryInterval = null;
    }
  }, 500);
}

export function stopTelemetry(): void {
  if (telemetryInterval) {
    clearInterval(telemetryInterval);
    telemetryInterval = null;
  }
}
