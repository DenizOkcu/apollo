import { state, notify } from '../core/state';
import { appendNarration, clearNarration } from '../ui/panel';
import { setKeyListener } from '../dsky/keyboard';
import type { DSKYKey } from '../dsky/keyboard';

export interface ScenarioStep {
  time: number;  // ms from scenario start
  action: 'narrate' | 'setState' | 'waitForKey' | 'setNav' | 'setLights' | 'callback';
  text?: string;
  timestamp?: string;
  stateChanges?: Partial<typeof state>;
  navChanges?: Partial<typeof state.nav>;
  lightChanges?: Partial<typeof state.lights>;
  key?: DSKYKey;
  callback?: () => void;
}

export interface Scenario {
  id: string;
  title: string;
  steps: ScenarioStep[];
  onComplete?: () => void;
}

let currentScenario: Scenario | null = null;
let timeouts: ReturnType<typeof setTimeout>[] = [];
let waitingForKey: DSKYKey | null = null;
let waitResolve: (() => void) | null = null;
let telemetryInterval: ReturnType<typeof setInterval> | null = null;

export function runScenario(scenario: Scenario): void {
  stopScenario();
  clearNarration();

  currentScenario = scenario;
  state.scenarioActive = true;

  setKeyListener((key) => {
    if (waitingForKey && key === waitingForKey) {
      waitingForKey = null;
      if (waitResolve) {
        waitResolve();
        waitResolve = null;
      }
    }
  });

  processSteps();
}

export function stopScenario(): void {
  currentScenario = null;
  state.scenarioActive = false;
  waitingForKey = null;
  waitResolve = null;

  for (const t of timeouts) clearTimeout(t);
  timeouts = [];

  if (telemetryInterval) {
    clearInterval(telemetryInterval);
    telemetryInterval = null;
  }

  setKeyListener(null);
}

function processSteps(): void {
  if (!currentScenario) return;
  const steps = currentScenario.steps;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const delay = step.time;

    const t = setTimeout(() => {
      executeStep(step);
    }, delay);
    timeouts.push(t);
  }
}

function executeStep(step: ScenarioStep): void {
  switch (step.action) {
    case 'narrate':
      if (step.text) {
        appendNarration(step.text, step.timestamp);
      }
      break;

    case 'setState':
      if (step.stateChanges) {
        Object.assign(state, step.stateChanges);
        notify('display');
      }
      break;

    case 'setNav':
      if (step.navChanges) {
        Object.assign(state.nav, step.navChanges);
        notify('display');
      }
      break;

    case 'setLights':
      if (step.lightChanges) {
        Object.assign(state.lights, step.lightChanges);
        notify('display');
      }
      break;

    case 'callback':
      if (step.callback) step.callback();
      break;

    case 'waitForKey':
      waitingForKey = step.key || null;
      break;
  }
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
    // Ease-out curve for more natural deceleration feel
    const eased = 1 - Math.pow(1 - t, 2);

    for (const key of Object.keys(endValues)) {
      const navKey = key as keyof typeof state.nav;
      (state.nav as any)[navKey] = startValues[key] + (endValues[key] - startValues[key]) * eased;
    }

    // Re-render the display if a monitor is active
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
