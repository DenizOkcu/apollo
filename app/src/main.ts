import './styles/layout.css';
import './styles/dsky.css';
import './styles/lights.css';
import './styles/code.css';
import './styles/explorer.css';

import { createDisplayPanel } from './dsky/display';
import { bindPhysicalKeyboard } from './dsky/keyboard';
import { createKeypadPanel, createNarrationPanel, createHelpBar } from './ui/panel';
import { createCodeViewer } from './ui/code-viewer';
import { createScenarioPicker } from './ui/scenario-picker';
import { startClock } from './core/clock';
import { runScenario } from './scenarios/scenario-runner';
import type { Scenario } from './scenarios/scenario-runner';
import { landingScenario } from './scenarios/landing';
import { alarm1202Scenario } from './scenarios/alarm-1202';
import { freePlayScenario } from './scenarios/free-play';
import { lampTestScenario } from './scenarios/lamp-test';

const SCENARIOS: Record<string, Scenario> = {
  'landing': landingScenario,
  'alarm-1202': alarm1202Scenario,
  'free-play': freePlayScenario,
  'lamp-test': lampTestScenario,
};

function init(): void {
  const app = document.getElementById('app')!;

  // Header
  const header = document.createElement('div');
  header.className = 'app-header';
  header.innerHTML = `
    <div>
      <div class="app-title">APOLLO 11 AGC</div>
      <div class="app-subtitle">DSKY TERMINAL EMULATOR</div>
    </div>
    <div class="header-right">
      <button class="btn-scenarios" id="btn-scenarios">SCENARIOS</button>
    </div>
  `;

  // Main content area
  const main = document.createElement('div');
  main.className = 'app-main';

  // DSKY container (left)
  const dskyContainer = document.createElement('div');
  dskyContainer.className = 'dsky-container';

  const dskyFrame = document.createElement('div');
  dskyFrame.className = 'dsky-frame';

  const nameplate = document.createElement('div');
  nameplate.className = 'dsky-nameplate';
  nameplate.textContent = 'DISPLAY & KEYBOARD';

  const displayPanel = createDisplayPanel();
  const keypadPanel = createKeypadPanel();

  dskyFrame.appendChild(nameplate);
  dskyFrame.appendChild(displayPanel);
  dskyFrame.appendChild(keypadPanel);
  dskyContainer.appendChild(dskyFrame);

  // Narration panel (middle)
  const narrationPanel = createNarrationPanel();

  // Code viewer panel (right)
  const codeViewer = createCodeViewer();

  main.appendChild(dskyContainer);
  main.appendChild(narrationPanel);
  main.appendChild(codeViewer);

  // Help bar
  const helpBar = createHelpBar();

  // CRT overlay
  const crt = document.createElement('div');
  crt.className = 'crt-overlay';

  // Assemble
  app.appendChild(header);
  app.appendChild(main);
  app.appendChild(helpBar);
  app.appendChild(crt);

  // Bind keyboard
  bindPhysicalKeyboard();

  // Start clock
  startClock();

  // Scenario picker
  function showPicker(): void {
    const picker = createScenarioPicker((id) => {
      const scenario = SCENARIOS[id];
      if (scenario) {
        runScenario(scenario);
      }
    });
    app.appendChild(picker);
  }

  // Show picker on launch
  showPicker();

  // Re-show picker on button click
  document.getElementById('btn-scenarios')!.addEventListener('click', () => {
    showPicker();
  });
}

init();
