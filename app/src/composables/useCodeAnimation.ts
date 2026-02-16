import { reactive } from 'vue';
import type { AGCCodeBlock, AGCSourceLine } from '../core/agc-source';

export interface CodeLine {
  id: number;
  line: AGCSourceLine;
}

export interface CodeFileHeader {
  id: number;
  type: 'file-header';
  text: string;
}

export interface CodeSeparator {
  id: number;
  type: 'separator';
}

export type CodeEntry = CodeLine | CodeFileHeader | CodeSeparator;

let nextId = 0;
let lineQueue: AGCSourceLine[] = [];
let typeTimer: ReturnType<typeof setInterval> | null = null;
let currentLineIndex = 0;

const LINE_INTERVAL = 120;

const codeState = reactive({
  entries: [] as CodeEntry[],
  headerTitle: 'AGC SOURCE',
  currentFile: null as string | null,
  version: 0,
});

function stopCodeAnimation(): void {
  if (typeTimer) {
    clearInterval(typeTimer);
    typeTimer = null;
  }
  lineQueue = [];
  currentLineIndex = 0;
}

export function showCodeBlock(block: AGCCodeBlock): void {
  // Track current file for the explorer
  codeState.currentFile = block.file;

  // Stop any running animation
  stopCodeAnimation();

  // Add file header
  codeState.entries.push({
    id: nextId++,
    type: 'file-header',
    text: `── ${block.file} ──`,
  });

  codeState.headerTitle = `AGC SOURCE — ${block.title}`;

  // Queue all lines for animated display
  lineQueue = [...block.lines];
  currentLineIndex = 0;

  typeTimer = setInterval(() => {
    if (currentLineIndex >= lineQueue.length) {
      stopCodeAnimation();
      return;
    }

    const line = lineQueue[currentLineIndex];
    codeState.entries.push({ id: nextId++, line });
    codeState.version++;
    currentLineIndex++;
  }, LINE_INTERVAL);
}

export function clearCodeViewer(): void {
  stopCodeAnimation();
  codeState.entries.length = 0;
  codeState.headerTitle = 'AGC SOURCE';
  codeState.currentFile = null;
  codeState.version++;
}

export function flushCodeBlock(): void {
  if (typeTimer) {
    clearInterval(typeTimer);
    typeTimer = null;
  }

  for (let i = currentLineIndex; i < lineQueue.length; i++) {
    codeState.entries.push({ id: nextId++, line: lineQueue[i] });
  }
  lineQueue = [];
  currentLineIndex = 0;
  codeState.version++;
}

export function addCodeSeparator(): void {
  codeState.entries.push({ id: nextId++, type: 'separator' });
  codeState.version++;
}

export function useCodeAnimation() {
  return {
    codeState,
    showCodeBlock,
    clearCodeViewer,
    flushCodeBlock,
    addCodeSeparator,
  };
}
