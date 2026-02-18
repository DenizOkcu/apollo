import { getAgcState } from '../stores/agc';

let clockTimer: ReturnType<typeof setInterval> | null = null;

export function startClock(): void {
  if (clockTimer) return;
  clockTimer = setInterval(() => {
    const state = getAgcState();
    if (state.clockRunning) {
      // 100ms = 1 centisecond (real-time)
      state.missionElapsedTime += 1;
    }
  }, 100);
}

export function stopClock(): void {
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
  }
}

export function setMET(centiseconds: number): void {
  const state = getAgcState();
  state.missionElapsedTime = centiseconds;
}

export function getMETComponents(): { hours: number; minutes: number; seconds: number; centiseconds: number } {
  const state = getAgcState();
  const total = Math.floor(state.missionElapsedTime);
  const cs = total % 100;
  const totalSeconds = Math.floor(total / 100);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return { hours, minutes, seconds, centiseconds: cs };
}

export function formatMETForDisplay(): [number, number, number] {
  const { hours, minutes, seconds, centiseconds } = getMETComponents();
  return [hours, minutes, seconds * 100 + centiseconds];
}

// Format centiseconds as MM:SS for display (5 digits: MMbSS where b=blank)
export function formatMinSec(centiseconds: number): { min: number; sec: number } {
  const totalSec = Math.floor(Math.abs(centiseconds) / 100);
  return {
    min: Math.floor(totalSec / 60),
    sec: totalSec % 60,
  };
}
