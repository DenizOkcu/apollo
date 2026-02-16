import { reactive } from 'vue';

export interface NarrationEntry {
  id: number;
  text: string;
  timestamp?: string;
  isHint: boolean;
}

let nextId = 0;

const narrationState = reactive({
  entries: [] as NarrationEntry[],
  version: 0,  // bumped on every mutation to trigger watchers
});

export function appendNarration(text: string, timestamp?: string): void {
  narrationState.entries.push({
    id: nextId++,
    text,
    timestamp,
    isHint: timestamp === '  >>',
  });
  narrationState.version++;
}

export function clearNarration(): void {
  narrationState.entries.length = 0;
  narrationState.version++;
}

export function useNarration() {
  return {
    entries: narrationState.entries,
    version: narrationState,
    appendNarration,
    clearNarration,
  };
}
