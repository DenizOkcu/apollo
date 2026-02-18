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

export const codeState = reactive({
  entries: [] as CodeEntry[],
  headerTitle: 'AGC SOURCE',
  currentFile: null as string | null,
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
    currentLineIndex++;
  }, LINE_INTERVAL);
}

export function clearCodeViewer(): void {
  stopCodeAnimation();
  codeState.entries.length = 0;
  codeState.headerTitle = 'AGC SOURCE';
  codeState.currentFile = null;
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
}

export function addCodeSeparator(): void {
  codeState.entries.push({ id: nextId++, type: 'separator' });
}
