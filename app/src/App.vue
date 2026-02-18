<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useKeyboard } from './composables/useKeyboard';
import { useMobile } from './composables/useMobile';
import { codeState } from './composables/useCodeAnimation';
import { startClock } from './core/clock';
import { runScenario } from './scenarios/scenario-runner';
import type { Scenario } from './scenarios/scenario-runner';
import { landingScenario } from './scenarios/landing';
import { alarm1202Scenario } from './scenarios/alarm-1202';
import { freePlayScenario } from './scenarios/free-play';
import { lampTestScenario } from './scenarios/lamp-test';
import { lunarAscentScenario } from './scenarios/lunar-ascent';
import { abortScenario } from './scenarios/abort';
import { tliScenario } from './scenarios/tli';
import AppMain from './components/AppMain.vue';
import ScenarioPicker from './components/ScenarioPicker.vue';
import CodeExplorer from './components/CodeExplorer.vue';
import HelpBar from './components/HelpBar.vue';

const SCENARIOS: Record<string, Scenario> = {
  'landing': landingScenario,
  'alarm-1202': alarm1202Scenario,
  'free-play': freePlayScenario,
  'lamp-test': lampTestScenario,
  'lunar-ascent': lunarAscentScenario,
  'abort': abortScenario,
  'tli': tliScenario,
};

const showPicker = ref(true);
const showExplorer = ref(false);


useKeyboard();
useMobile();

onMounted(() => {
  startClock();
});

function onScenarioSelect(id: string): void {
  showPicker.value = false;
  const scenario = SCENARIOS[id];
  if (scenario) {
    runScenario(scenario);
  }
}

function openScenarioPicker(): void {
  showPicker.value = true;
}

function openExplorer(): void {
  showExplorer.value = true;
}

function closeExplorer(): void {
  showExplorer.value = false;
}
</script>

<template>
  <ScenarioPicker v-if="showPicker" @select="onScenarioSelect" />

  <div class="app-header">
    <div>
      <div class="app-title">APOLLO 11 AGC</div>
      <div class="app-subtitle">DSKY TERMINAL EMULATOR</div>
    </div>
    <div class="header-right">
      <button class="btn-scenarios" @click="openScenarioPicker">BACK TO SCENARIOS</button>
    </div>
  </div>

  <AppMain @open-explorer="openExplorer" />
  <HelpBar />
  <div class="crt-overlay" />

  <CodeExplorer
    v-if="showExplorer"
    :initial-file="codeState.currentFile"
    @close="closeExplorer"
  />
</template>
