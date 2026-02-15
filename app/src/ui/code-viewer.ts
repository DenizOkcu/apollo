import type { AGCCodeBlock, AGCSourceLine } from '../core/agc-source';
import { openExplorer } from './code-explorer';

let contentEl: HTMLElement | null = null;
let headerEl: HTMLElement | null = null;
let lineQueue: { line: AGCSourceLine; blockTitle: string }[] = [];
let typeTimer: ReturnType<typeof setInterval> | null = null;
let currentLineIndex = 0;
let currentFile: string | null = null;

const LINE_INTERVAL = 120;  // ms between lines appearing

export function createCodeViewer(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'code-panel';

  const header = document.createElement('div');
  header.className = 'code-header';

  const headerText = document.createElement('span');
  headerText.textContent = 'AGC SOURCE';
  headerEl = headerText;

  const exploreBtn = document.createElement('button');
  exploreBtn.className = 'code-explore-btn';
  exploreBtn.textContent = 'EXPLORE >';
  exploreBtn.addEventListener('click', () => {
    void openExplorer(currentFile);
  });

  header.appendChild(headerText);
  header.appendChild(exploreBtn);

  const content = document.createElement('div');
  content.className = 'code-content';
  content.id = 'code-content';

  panel.appendChild(header);
  panel.appendChild(content);

  contentEl = content;

  return panel;
}

export function showCodeBlock(block: AGCCodeBlock): void {
  if (!contentEl) return;

  // Track current file for the explorer
  currentFile = block.file;

  // Stop any running animation
  stopCodeAnimation();

  // Add file header
  const fileHeader = document.createElement('div');
  fileHeader.className = 'code-file-header';
  fileHeader.textContent = `── ${block.file} ──`;
  contentEl.appendChild(fileHeader);

  if (headerEl) {
    headerEl.textContent = `AGC SOURCE — ${block.title}`;
  }

  // Queue all lines for animated display
  lineQueue = block.lines.map(line => ({ line, blockTitle: block.title }));
  currentLineIndex = 0;

  typeTimer = setInterval(() => {
    if (currentLineIndex >= lineQueue.length) {
      stopCodeAnimation();
      return;
    }

    const { line } = lineQueue[currentLineIndex];
    appendCodeLine(line);
    currentLineIndex++;
  }, LINE_INTERVAL);
}

export function appendCodeLine(line: AGCSourceLine): void {
  if (!contentEl) return;

  const lineEl = document.createElement('div');
  lineEl.className = 'code-line';

  if (line.isHighlight) {
    lineEl.classList.add('code-highlight');
  } else if (line.isComment) {
    lineEl.classList.add('code-comment');
  } else if (line.isLabel) {
    lineEl.classList.add('code-label');
  } else if (line.text.trim() === '') {
    lineEl.classList.add('code-blank');
  }

  // Line number
  const numEl = document.createElement('span');
  numEl.className = 'code-linenum';
  numEl.textContent = '  ';

  // Line content
  const textEl = document.createElement('span');
  textEl.className = 'code-text';
  textEl.textContent = line.text;

  lineEl.appendChild(numEl);
  lineEl.appendChild(textEl);

  contentEl.appendChild(lineEl);
  contentEl.scrollTop = contentEl.scrollHeight;
}

export function clearCodeViewer(): void {
  stopCodeAnimation();
  if (contentEl) {
    contentEl.innerHTML = '';
  }
  if (headerEl) {
    headerEl.textContent = 'AGC SOURCE';
  }
  currentFile = null;
}

export function stopCodeAnimation(): void {
  if (typeTimer) {
    clearInterval(typeTimer);
    typeTimer = null;
  }
  lineQueue = [];
  currentLineIndex = 0;
}

/**
 * Flush any remaining queued lines immediately (no animation).
 */
export function flushCodeBlock(): void {
  if (!contentEl) return;

  stopCodeAnimation();

  // Append any remaining lines instantly
  for (let i = currentLineIndex; i < lineQueue.length; i++) {
    appendCodeLine(lineQueue[i].line);
  }
  lineQueue = [];
  currentLineIndex = 0;
}

/**
 * Add a separator between code blocks.
 */
export function addCodeSeparator(): void {
  if (!contentEl) return;
  const sep = document.createElement('div');
  sep.className = 'code-separator';
  contentEl.appendChild(sep);
  contentEl.scrollTop = contentEl.scrollHeight;
}
