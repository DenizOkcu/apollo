import { getAgcState, defaultLights } from '../stores/agc';
import type { AGCState, NavState, DSKYLights } from '../stores/agc';
import { appendNarration, clearNarration } from '../composables/useNarration';
import { showCodeBlock, clearCodeViewer, addCodeSeparator } from '../composables/useCodeAnimation';
import { setKeyListener, pressKey } from '../dsky/keyboard';
import type { DSKYKey } from '../dsky/keyboard';
import type { AGCCodeBlock } from '../core/agc-source';
import { clearAlarms } from '../core/alarm';

type ScenarioStateChange = Partial<Pick<AGCState,
  'verb' | 'noun' | 'program' | 'inputMode' | 'inputBuffer' | 'inputTarget' |
  'missionElapsedTime' | 'clockRunning' | 'verbNounFlash' | 'scenarioActive' |
  'monitorActive' | 'monitorVerb' | 'monitorNoun'
>>;

export interface ScenarioStep {
  delay: number;
  action: 'narrate' | 'setState' | 'waitForKey' | 'setNav' | 'setLights' | 'callback' | 'showCode';
  text?: string;
  timestamp?: string;
  stateChanges?: ScenarioStateChange;
  navChanges?: Partial<NavState>;
  lightChanges?: Partial<DSKYLights>;
  key?: DSKYKey;
  keyHint?: string;
  callback?: () => void;
  codeBlock?: AGCCodeBlock;
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

  const state = getAgcState();

  // Reset display state
  clearAlarms();
  Object.assign(state.lights, defaultLights());
  state.verbNounFlash = false;
  state.inputMode = 'idle';
  state.inputBuffer = '';
  state.inputTarget = null;
  state.dataLoadQueue = [];

  // Reset keyboard buffers
  state.verbBuffer = '';
  state.nounBuffer = '';
  state.dataBuffer = '';
  state.dataSign = '+';
  if (state.monitorInterval) {
    clearInterval(state.monitorInterval);
    state.monitorInterval = null;
  }
  state.monitorActive = false;
  state.monitorVerb = null;
  state.monitorNoun = null;

  currentScenario = scenario;
  currentStepIndex = 0;
  cancelled = false;
  state.scenarioActive = true;

  setKeyListener((key) => {
    if (waitingForKey && key === waitingForKey) {
      clearAutoRecovery();
      nudgeShown = false;
      waitingForKey = null;
      advanceToNextStep();
    } else if (waitingForKey) {
      if (!nudgeShown) {
        nudgeShown = true;
        appendNarration(getNudgeMessage(waitingForKey, key), { isHint: true });
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

  const state = getAgcState();
  state.scenarioActive = false;
  setKeyListener(null);
}

function scheduleNextStep(): void {
  if (cancelled || !currentScenario) return;
  if (currentStepIndex >= currentScenario.steps.length) {
    if (currentScenario.onComplete) currentScenario.onComplete();
    const state = getAgcState();
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
  const state = getAgcState();

  switch (step.action) {
    case 'narrate':
      if (step.text) {
        appendNarration(step.text, { timestamp: step.timestamp });
      }
      advanceToNextStep();
      break;

    case 'setState':
      if (step.stateChanges) {
        Object.assign(state, step.stateChanges);
    
      }
      advanceToNextStep();
      break;

    case 'setNav':
      if (step.navChanges) {
        Object.assign(state.nav, step.navChanges);
    
      }
      advanceToNextStep();
      break;

    case 'setLights':
      if (step.lightChanges) {
        Object.assign(state.lights, step.lightChanges);
    
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
      nudgeShown = false;
      clearAutoRecovery();
      waitingForKey = step.key || null;
      if (step.keyHint) {
        appendNarration(step.keyHint, { isHint: true });
      }
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
  from: Partial<NavState>,
  to: Partial<NavState>,
  onTick?: () => void
): void {
  if (telemetryInterval) clearInterval(telemetryInterval);

  const state = getAgcState();
  const startTime = Date.now();
  const keys = Object.keys(to) as (keyof NavState)[];
  const startValues: Record<string, number> = {};
  const endValues: Record<string, number> = {};

  for (const key of keys) {
    startValues[key] = from[key] ?? state.nav[key];
    endValues[key] = to[key]!;
  }

  telemetryInterval = setInterval(() => {
    const s = getAgcState();
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 2);

    for (const key of keys) {
      s.nav[key] = startValues[key] + (endValues[key] - startValues[key]) * eased;
    }

    if (s.monitorActive || onTick) {
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
