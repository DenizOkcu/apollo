<script setup lang="ts">
import { ref } from 'vue';

interface ScenarioChoice {
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

const emit = defineEmits<{
  select: [id: string];
}>();

const hidden = ref(false);

function select(id: string): void {
  hidden.value = true;
  setTimeout(() => emit('select', id), 500);
}
</script>

<template>
  <div :class="['scenario-overlay', { hidden }]">
    <div class="scenario-modal">
      <h1 class="scenario-title">APOLLO 11 AGC</h1>
      <p class="scenario-subtitle">Apollo Guidance Computer — DSKY Terminal Emulator</p>
      <p class="scenario-desc">July 20, 1969. Choose your experience:</p>

      <div class="scenario-grid">
        <button
          v-for="scenario in SCENARIOS"
          :key="scenario.id"
          class="scenario-card"
          :data-id="scenario.id"
          @click="select(scenario.id)"
        >
          <div class="scenario-card-title">{{ scenario.title }}</div>
          <span class="scenario-badge">{{ scenario.difficulty }}</span>
          <div class="scenario-card-desc">{{ scenario.description }}</div>
        </button>
      </div>

      <div class="scenario-footer">
        Original AGC source code by MIT Instrumentation Lab — Led by Margaret Hamilton
      </div>
    </div>
  </div>
</template>
