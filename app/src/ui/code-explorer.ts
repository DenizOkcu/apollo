/**
 * AGC Code Explorer — full-screen overlay for browsing the entire
 * Apollo 11 AGC codebase (Luminary099 + Comanche055).
 */

interface AGCModule {
  name: string;
  label: string;
  files: string[];
}

interface AGCIndex {
  modules: AGCModule[];
}

import { getMobileController } from './mobile-controller';

let overlayEl: HTMLElement | null = null;
let sidebarEl: HTMLElement | null = null;
let sourceEl: HTMLElement | null = null;
let headerTitleEl: HTMLElement | null = null;
let layoutEl: HTMLElement | null = null;

let index: AGCIndex | null = null;
let activeModule: string | null = null;
let activeFile: string | null = null;
const fileCache = new Map<string, string>();

// ── parseLine (same logic as agc-source.ts) ────────────────────

function parseLine(raw: string): { isComment: boolean; isLabel: boolean; isHighlight: boolean } {
  const trimmed = raw.trimStart();
  const isComment = trimmed.startsWith('#');
  const isLabel = !isComment && /^[A-Z0-9_]+\s/.test(trimmed) && !trimmed.startsWith(' ');
  const isHighlight = isComment && (
    /BURN.BABY|FLAGORGY|POODOO|CURTAINS|WHIMPER|BAILOUT|CRANK.*SILLY|OFF TO SEE|WIZARD|MAGNIFICENT|ASTRONAUT|HELLO|GOODBYE|TEMPORARY.*HOPE|NOLI SE TANGERE|HONI SOIT|ENEMA|POOH|GUILDENSTERN|PINBALL/i.test(raw) ||
    /WE CAME|NOT NEEDED|PILOT|HERO|FAMOUS|HAMILTON|PRIDE|THE FOLLOWING|THIS ROUTINE|IMPORTANT|NOTE WELL|HISTORY/i.test(raw)
  );
  return { isComment, isLabel, isHighlight };
}

// ── Index fetching ─────────────────────────────────────────────

async function fetchIndex(): Promise<AGCIndex> {
  if (index) return index;
  const res = await fetch(`${import.meta.env.BASE_URL}agc/agc-index.json`);
  index = (await res.json()) as AGCIndex;
  return index;
}

// ── Source file fetching ───────────────────────────────────────

async function fetchSource(moduleName: string, fileName: string): Promise<string> {
  const key = `${moduleName}/${fileName}`;
  const cached = fileCache.get(key);
  if (cached !== undefined) return cached;
  const res = await fetch(`${import.meta.env.BASE_URL}agc/${key}`);
  const text = await res.text();
  fileCache.set(key, text);
  return text;
}

// ── Render source ──────────────────────────────────────────────

function renderSource(text: string): void {
  if (!sourceEl) return;
  sourceEl.innerHTML = '';

  const lines = text.split('\n');
  // Create a document fragment for performance
  const frag = document.createDocumentFragment();

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const { isComment, isLabel, isHighlight } = parseLine(raw);

    const lineEl = document.createElement('div');
    lineEl.className = 'code-line';

    if (isHighlight) {
      lineEl.classList.add('code-highlight');
    } else if (isComment) {
      lineEl.classList.add('code-comment');
    } else if (isLabel) {
      lineEl.classList.add('code-label');
    } else if (raw.trim() === '') {
      lineEl.classList.add('code-blank');
    }

    const numEl = document.createElement('span');
    numEl.className = 'code-linenum';
    numEl.textContent = String(i + 1);

    const textEl = document.createElement('span');
    textEl.className = 'code-text';
    textEl.textContent = raw;

    lineEl.appendChild(numEl);
    lineEl.appendChild(textEl);
    frag.appendChild(lineEl);
  }

  sourceEl.appendChild(frag);
}

// ── Navigate to a file ─────────────────────────────────────────

async function navigateTo(moduleName: string, fileName: string): Promise<void> {
  activeModule = moduleName;
  activeFile = fileName;

  // Update header
  if (headerTitleEl) {
    headerTitleEl.textContent = `AGC EXPLORER — ${moduleName} / ${fileName}`;
  }

  // Highlight active file in sidebar
  if (sidebarEl) {
    for (const el of sidebarEl.querySelectorAll('.explorer-file.active')) {
      el.classList.remove('active');
    }
    const target = sidebarEl.querySelector(
      `.explorer-file[data-module="${moduleName}"][data-file="${fileName}"]`
    );
    if (target) {
      target.classList.add('active');
      target.scrollIntoView({ block: 'nearest' });
    }
  }

  // Show loading
  if (sourceEl) {
    sourceEl.innerHTML = '<div class="explorer-source-loading">LOADING...</div>';
  }

  const text = await fetchSource(moduleName, fileName);
  // Guard: user may have navigated away while we fetched
  if (activeModule === moduleName && activeFile === fileName) {
    renderSource(text);
  }
}

// ── Build sidebar ──────────────────────────────────────────────

function buildSidebar(agcIndex: AGCIndex, initialModule?: string, initialFile?: string): void {
  if (!sidebarEl) return;
  sidebarEl.innerHTML = '';

  for (const mod of agcIndex.modules) {
    const headerDiv = document.createElement('div');
    headerDiv.className = 'explorer-module-header expanded';
    headerDiv.textContent = mod.label;
    headerDiv.dataset.module = mod.name;

    const listDiv = document.createElement('div');
    listDiv.className = 'explorer-file-list expanded';

    // Toggle collapse
    headerDiv.addEventListener('click', () => {
      headerDiv.classList.toggle('expanded');
      listDiv.classList.toggle('expanded');
    });

    for (const file of mod.files) {
      const fileEl = document.createElement('div');
      fileEl.className = 'explorer-file';
      fileEl.textContent = file.replace('.agc', '');
      fileEl.dataset.module = mod.name;
      fileEl.dataset.file = file;

      if (mod.name === initialModule && file === initialFile) {
        fileEl.classList.add('active');
      }

      fileEl.addEventListener('click', () => {
        void navigateTo(mod.name, file);
        if (getMobileController()?.isMobile) {
          sidebarEl?.classList.remove('sidebar-open');
          layoutEl?.querySelector('.explorer-sidebar-backdrop')?.classList.remove('active');
          const tab = layoutEl?.querySelector('.explorer-files-tab') as HTMLElement | null;
          if (tab) tab.style.display = '';
        }
      });

      listDiv.appendChild(fileEl);
    }

    sidebarEl.appendChild(headerDiv);
    sidebarEl.appendChild(listDiv);
  }
}

// ── Open / Close ───────────────────────────────────────────────

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    closeExplorer();
  }
}

export async function openExplorer(initialFile?: string | null): Promise<void> {
  // Don't open twice
  if (overlayEl) return;

  const agcIndex = await fetchIndex();

  // Resolve initial file → module
  let startModule = agcIndex.modules[0]?.name ?? '';
  let startFile = agcIndex.modules[0]?.files[0] ?? '';

  if (initialFile) {
    for (const mod of agcIndex.modules) {
      if (mod.files.includes(initialFile)) {
        startModule = mod.name;
        startFile = initialFile;
        break;
      }
    }
  }

  // Build overlay DOM
  const overlay = document.createElement('div');
  overlay.className = 'explorer-overlay';

  // Header
  const header = document.createElement('div');
  header.className = 'explorer-header';

  const title = document.createElement('div');
  title.className = 'explorer-header-title';
  title.textContent = 'AGC EXPLORER';
  headerTitleEl = title;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'explorer-close';
  closeBtn.textContent = 'CLOSE [ESC]';
  closeBtn.addEventListener('click', closeExplorer);

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Layout
  const layout = document.createElement('div');
  layout.className = 'explorer-layout';

  const sidebar = document.createElement('div');
  sidebar.className = 'explorer-sidebar';
  sidebarEl = sidebar;

  const source = document.createElement('div');
  source.className = 'explorer-source';
  sourceEl = source;

  layout.appendChild(sidebar);
  layout.appendChild(source);
  layoutEl = layout;

  // Mobile: add FILES tab and sidebar backdrop
  const mc = getMobileController();
  if (mc?.isMobile) {
    const filesTab = document.createElement('button');
    filesTab.className = 'explorer-files-tab';
    filesTab.textContent = 'FILES';

    const sidebarBackdrop = document.createElement('div');
    sidebarBackdrop.className = 'explorer-sidebar-backdrop';

    filesTab.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar-open');
      sidebarBackdrop.classList.toggle('active');
      filesTab.style.display = sidebar.classList.contains('sidebar-open') ? 'none' : '';
    });

    sidebarBackdrop.addEventListener('click', () => {
      sidebar.classList.remove('sidebar-open');
      sidebarBackdrop.classList.remove('active');
      filesTab.style.display = '';
    });

    layout.appendChild(sidebarBackdrop);
    layout.appendChild(filesTab);
  }

  overlay.appendChild(header);
  overlay.appendChild(layout);

  document.body.appendChild(overlay);
  overlayEl = overlay;

  // Build file tree
  buildSidebar(agcIndex, startModule, startFile);

  // Navigate to initial file
  void navigateTo(startModule, startFile);

  // ESC to close
  document.addEventListener('keydown', onKeyDown);
}

export function closeExplorer(): void {
  if (!overlayEl) return;

  document.removeEventListener('keydown', onKeyDown);

  overlayEl.classList.add('hidden');
  const el = overlayEl;
  setTimeout(() => {
    el.remove();
  }, 300);

  overlayEl = null;
  sidebarEl = null;
  sourceEl = null;
  headerTitleEl = null;
  layoutEl = null;
  activeModule = null;
  activeFile = null;
}
