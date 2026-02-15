export interface ScenarioChoice {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

const SCENARIOS: ScenarioChoice[] = [
  {
    id: 'landing',
    title: 'The Landing',
    description: 'Experience the final minutes of Apollo 11\'s descent to the Moon. Guide the Lunar Module from braking phase to touchdown.',
    difficulty: 'Guided',
  },
  {
    id: 'alarm-1202',
    title: 'The 1202 Alarm',
    description: 'The most famous computer error in history. See how the AGC handled executive overflow during powered descent.',
    difficulty: 'Guided',
  },
  {
    id: 'tli',
    title: 'Launch to the Moon',
    description: 'Trans-Lunar Injection: the S-IVB fires and Apollo 11 leaves Earth orbit. Velocity builds to escape speed — after this, there is no turning back.',
    difficulty: 'Guided',
  },
  {
    id: 'lunar-ascent',
    title: 'The Ascent',
    description: 'Lift off from the Moon. One engine, no backup, never tested. If it doesn\'t ignite, the crew dies on the surface.',
    difficulty: 'Guided',
  },
  {
    id: 'abort',
    title: 'Abort!',
    description: 'What if Steve Bales had called NO-GO? A "what-if" scenario: abort the landing and fire the ascent engine to escape.',
    difficulty: 'Guided',
  },
  {
    id: 'free-play',
    title: 'Explore Freely',
    description: 'Full DSKY access. Type any verb/noun combination and explore the AGC interface at your own pace.',
    difficulty: 'Open',
  },
  {
    id: 'lamp-test',
    title: 'Lamp Test',
    description: 'A quick demo: light up every segment and indicator on the DSKY, just like the astronauts did before critical operations.',
    difficulty: 'Quick',
  },
];

export function createScenarioPicker(onSelect: (id: string) => void): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'scenario-overlay';
  overlay.id = 'scenario-overlay';

  const modal = document.createElement('div');
  modal.className = 'scenario-modal';

  const title = document.createElement('h1');
  title.className = 'scenario-title';
  title.textContent = 'APOLLO 11 AGC';

  const subtitle = document.createElement('p');
  subtitle.className = 'scenario-subtitle';
  subtitle.textContent = 'Apollo Guidance Computer — DSKY Terminal Emulator';

  const desc = document.createElement('p');
  desc.className = 'scenario-desc';
  desc.textContent = 'July 20, 1969. Choose your experience:';

  modal.appendChild(title);
  modal.appendChild(subtitle);
  modal.appendChild(desc);

  const grid = document.createElement('div');
  grid.className = 'scenario-grid';

  for (const scenario of SCENARIOS) {
    const card = document.createElement('button');
    card.className = 'scenario-card';
    card.dataset.id = scenario.id;

    const cardTitle = document.createElement('div');
    cardTitle.className = 'scenario-card-title';
    cardTitle.textContent = scenario.title;

    const badge = document.createElement('span');
    badge.className = 'scenario-badge';
    badge.textContent = scenario.difficulty;

    const cardDesc = document.createElement('div');
    cardDesc.className = 'scenario-card-desc';
    cardDesc.textContent = scenario.description;

    card.appendChild(cardTitle);
    card.appendChild(badge);
    card.appendChild(cardDesc);

    card.addEventListener('click', () => {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 500);
      onSelect(scenario.id);
    });

    grid.appendChild(card);
  }

  modal.appendChild(grid);

  const footer = document.createElement('div');
  footer.className = 'scenario-footer';
  footer.textContent = 'Original AGC source code by MIT Instrumentation Lab — Led by Margaret Hamilton';
  modal.appendChild(footer);

  overlay.appendChild(modal);
  return overlay;
}
