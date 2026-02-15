import { pressKey } from '../dsky/keyboard';
import type { DSKYKey } from '../dsky/keyboard';

export function createKeypadPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'dsky-keypad';

  const rows: { label: string; key: DSKYKey; className?: string }[][] = [
    [
      { label: 'VERB', key: 'VERB', className: 'key-action' },
      { label: 'NOUN', key: 'NOUN', className: 'key-action' },
    ],
    [
      { label: '7', key: '7' },
      { label: '8', key: '8' },
      { label: '9', key: '9' },
      { label: 'CLR', key: 'CLR', className: 'key-action' },
    ],
    [
      { label: '4', key: '4' },
      { label: '5', key: '5' },
      { label: '6', key: '6' },
      { label: 'PRO', key: 'PRO', className: 'key-action' },
    ],
    [
      { label: '1', key: '1' },
      { label: '2', key: '2' },
      { label: '3', key: '3' },
      { label: 'KEY\nREL', key: 'KEY_REL', className: 'key-action' },
    ],
    [
      { label: '+', key: 'PLUS', className: 'key-sign' },
      { label: '0', key: '0' },
      { label: '−', key: 'MINUS', className: 'key-sign' },
      { label: 'ENTR', key: 'ENTER', className: 'key-enter' },
    ],
    [
      { label: 'RSET', key: 'RSET', className: 'key-action key-rset' },
    ],
  ];

  for (const row of rows) {
    const rowEl = document.createElement('div');
    rowEl.className = 'keypad-row';

    for (const keyDef of row) {
      const btn = document.createElement('button');
      btn.className = `dsky-key ${keyDef.className || 'key-digit'}`;
      btn.textContent = keyDef.label;
      btn.dataset.key = keyDef.key;

      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        pressKey(keyDef.key);
      });
      btn.addEventListener('mouseup', () => {
        btn.classList.remove('pressed');
      });
      btn.addEventListener('mouseleave', () => {
        btn.classList.remove('pressed');
      });
      // Touch support
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        pressKey(keyDef.key);
      });
      btn.addEventListener('touchend', () => {
        btn.classList.remove('pressed');
      });

      rowEl.appendChild(btn);
    }

    panel.appendChild(rowEl);
  }

  return panel;
}

export function createNarrationPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'narration-panel';

  const header = document.createElement('div');
  header.className = 'narration-header';
  header.textContent = 'MISSION LOG';

  const content = document.createElement('div');
  content.className = 'narration-content';
  content.id = 'narration-content';

  panel.appendChild(header);
  panel.appendChild(content);

  return panel;
}

export function appendNarration(text: string, timestamp?: string): void {
  const content = document.getElementById('narration-content');
  if (!content) return;

  const entry = document.createElement('div');
  const isHint = timestamp === '  >>';
  entry.className = isHint ? 'narration-entry key-hint' : 'narration-entry';

  if (timestamp) {
    const ts = document.createElement('span');
    ts.className = 'narration-timestamp';
    ts.textContent = isHint ? '>> ' : `[${timestamp}] `;
    entry.appendChild(ts);
  }

  const textEl = document.createElement('span');
  textEl.className = 'narration-text';
  entry.appendChild(textEl);

  content.appendChild(entry);
  content.scrollTop = content.scrollHeight;

  // Typing animation
  let i = 0;
  const typeInterval = setInterval(() => {
    if (i < text.length) {
      textEl.textContent += text[i];
      i++;
      content.scrollTop = content.scrollHeight;
    } else {
      clearInterval(typeInterval);
    }
  }, 20);
}

export function clearNarration(): void {
  const content = document.getElementById('narration-content');
  if (content) content.innerHTML = '';
}

export function createHelpBar(): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'help-bar';
  bar.innerHTML = `
    <div class="help-keys">
      <span class="help-key"><kbd>V</kbd> Verb</span>
      <span class="help-key"><kbd>N</kbd> Noun</span>
      <span class="help-key"><kbd>Enter</kbd> ENTR</span>
      <span class="help-key"><kbd>0-9</kbd> Digits</span>
      <span class="help-key"><kbd>+/-</kbd> Sign</span>
      <span class="help-key"><kbd>C</kbd> CLR</span>
      <span class="help-key"><kbd>P</kbd> PRO</span>
      <span class="help-key"><kbd>R</kbd> RSET</span>
      <span class="help-key"><kbd>K</kbd> KEY REL</span>
    </div>
  `;
  return bar;
}
