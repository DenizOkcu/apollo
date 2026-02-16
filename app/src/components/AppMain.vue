<script setup lang="ts">
import DskyFrame from './dsky/DskyFrame.vue';
import NarrationPanel from './NarrationPanel.vue';
import CodeViewer from './CodeViewer.vue';
import { useMobile } from '../composables/useMobile';

const { codePanelOpen, toggleCodePanel, closeCodePanel } = useMobile();

const emit = defineEmits<{
  openExplorer: [];
}>();
</script>

<template>
  <div class="app-main">
    <DskyFrame />
    <NarrationPanel />
    <CodeViewer
      :class="{ 'code-panel-open': codePanelOpen }"
      @open-explorer="emit('openExplorer')"
    />
    <div
      v-if="codePanelOpen"
      class="code-panel-backdrop active"
      @click="closeCodePanel"
    />
    <button
      class="code-toggle-tab"
      @click="toggleCodePanel"
    >CODE</button>
  </div>
</template>
