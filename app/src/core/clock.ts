import { state, notify } from './state';

let clockTimer: ReturnType<typeof setInterval> | null = null;

export function startClock(): void {
  if (clockTimer) return;
  clockTimer = setInterval(() => {
    if (state.clockRunning) {
      state.missionElapsedTime += 1;  // 1 centisecond per 10ms
      // Don't notify every tick — display will poll on monitor interval
    }
  }, 10);
}

export function stopClock(): void {
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
  }
}

export function setMET(centiseconds: number): void {
  state.missionElapsedTime = centiseconds;
  notify('clock');
}

export function getMETComponents(): { hours: number; minutes: number; seconds: number; centiseconds: number } {
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
  // R1 = hours as 5 digits (00XXX)
  // R2 = minutes as 5 digits (000XX)
  // R3 = seconds.centiseconds as 5 digits (XXX.XX → XXXXX with implicit decimal)
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
