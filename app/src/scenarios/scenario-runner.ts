import { state, notify } from '../core/state';
import { appendNarration, clearNarration } from '../ui/panel';
import { showCodeBlock, clearCodeViewer, addCodeSeparator } from '../ui/code-viewer';
import { setKeyListener } from '../dsky/keyboard';
import type { DSKYKey } from '../dsky/keyboard';
import type { AGCCodeBlock } from '../core/agc-source';

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

export function runScenario(scenario: Scenario): void {
  stopScenario();
  clearNarration();
  clearCodeViewer();

  currentScenario = scenario;
  currentStepIndex = 0;
  cancelled = false;
  state.scenarioActive = true;

  setKeyListener((key) => {
    if (waitingForKey && key === waitingForKey) {
      waitingForKey = null;
      // Key matched — advance to next step immediately
      advanceToNextStep();
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
