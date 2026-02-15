/**
 * Mobile layout orchestrator — manages the CODE panel slide-in
 * and auto-scrolling the narration log on screens ≤768px.
 */

const MOBILE_QUERY = '(max-width: 768px)';

interface MobileRefs {
  dskyContainer: HTMLElement;
  narrationPanel: HTMLElement;
  codePanel: HTMLElement;
  appMain: HTMLElement;
}

export class MobileController {
  private mobileMatch: MediaQueryList;
  private _isMobile = false;

  private narrationPanel: HTMLElement;
  private codePanel: HTMLElement;

  // Created elements
  private codePanelBackdrop: HTMLElement | null = null;
  private codeToggleTab: HTMLElement | null = null;

  // State
  private codePanelOpen = false;

  get isMobile(): boolean {
    return this._isMobile;
  }

  constructor(refs: MobileRefs) {
    this.narrationPanel = refs.narrationPanel;
    this.codePanel = refs.codePanel;

    this.mobileMatch = window.matchMedia(MOBILE_QUERY);
    this._isMobile = this.mobileMatch.matches;

    this.mobileMatch.addEventListener('change', () => {
      this.handleLayoutChange();
    });

    this.handleLayoutChange();
  }

  private handleLayoutChange(): void {
    this._isMobile = this.mobileMatch.matches;

    if (this._isMobile) {
      document.body.classList.add('is-mobile');
      this.enterMobileMode();
    } else {
      document.body.classList.remove('is-mobile');
      this.exitMobileMode();
    }
  }

  private enterMobileMode(): void {
    // Create code panel backdrop
    if (!this.codePanelBackdrop) {
      this.codePanelBackdrop = document.createElement('div');
      this.codePanelBackdrop.className = 'code-panel-backdrop';
      this.codePanelBackdrop.addEventListener('click', () => this.closeCodePanel());
      document.body.appendChild(this.codePanelBackdrop);
    }

    // Create CODE toggle tab
    if (!this.codeToggleTab) {
      this.codeToggleTab = document.createElement('button');
      this.codeToggleTab.className = 'code-toggle-tab';
      this.codeToggleTab.textContent = 'CODE';
      this.codeToggleTab.addEventListener('click', () => this.toggleCodePanel());
      document.body.appendChild(this.codeToggleTab);
    }
  }

  private exitMobileMode(): void {
    this.codePanelBackdrop?.remove();
    this.codePanelBackdrop = null;

    this.codeToggleTab?.remove();
    this.codeToggleTab = null;

    this.codePanel.classList.remove('code-panel-open');
    this.codePanelOpen = false;
  }

  // ── Public API ──────────────────────────────────────────────

  showDSKYForInput(): void {
    if (!this._isMobile) return;
    this.scrollNarrationToBottom();
  }

  hideDSKYAfterInput(): void {
    // No-op — DSKY is always visible on mobile
  }

  setFreePlayMode(_active: boolean): void {
    // No-op — DSKY is always visible on mobile
  }

  toggleCodePanel(): void {
    if (this.codePanelOpen) {
      this.closeCodePanel();
    } else {
      this.openCodePanel();
    }
  }

  // ── Private helpers ─────────────────────────────────────────

  private openCodePanel(): void {
    this.codePanelOpen = true;
    this.codePanel.classList.add('code-panel-open');
    this.codePanelBackdrop?.classList.add('active');
  }

  private closeCodePanel(): void {
    this.codePanelOpen = false;
    this.codePanel.classList.remove('code-panel-open');
    this.codePanelBackdrop?.classList.remove('active');
  }

  private scrollNarrationToBottom(): void {
    const content = this.narrationPanel.querySelector('.narration-content');
    if (content) {
      content.scrollTop = content.scrollHeight;
    }
  }
}

// ── Singleton ───────────────────────────────────────────────

let instance: MobileController | null = null;

export function initMobileController(refs: MobileRefs): MobileController {
  instance = new MobileController(refs);
  return instance;
}

export function getMobileController(): MobileController | null {
  return instance;
}
