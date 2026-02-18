import { reactive } from 'vue';

export interface NarrationEntry {
  id: number;
  text: string;
  timestamp?: string;
  isHint: boolean;
}

export interface NarrationOptions {
  timestamp?: string;
  isHint?: boolean;
}

let nextId = 0;

export const narrationState = reactive({
  entries: [] as NarrationEntry[],
});

export function appendNarration(text: string, options?: NarrationOptions): void {
  narrationState.entries.push({
    id: nextId++,
    text,
    timestamp: options?.timestamp,
    isHint: options?.isHint ?? false,
  });
}

export function clearNarration(): void {
  narrationState.entries.length = 0;
}
