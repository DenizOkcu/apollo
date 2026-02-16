<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useCodeAnimation } from '../composables/useCodeAnimation';
import type { CodeEntry } from '../composables/useCodeAnimation';

const { codeState } = useCodeAnimation();
const contentEl = ref<HTMLElement | null>(null);

const emit = defineEmits<{
  openExplorer: [];
}>();

function isFileHeader(entry: CodeEntry): entry is { id: number; type: 'file-header'; text: string } {
  return 'type' in entry && entry.type === 'file-header';
}

function isSeparator(entry: CodeEntry): entry is { id: number; type: 'separator' } {
  return 'type' in entry && entry.type === 'separator';
}

function scrollToBottom(): void {
  if (contentEl.value) {
    contentEl.value.scrollTop = contentEl.value.scrollHeight;
  }
}

watch(() => codeState.version, async () => {
  await nextTick();
  scrollToBottom();
});
</script>

<template>
  <div class="code-panel">
    <div class="code-header">
      <span>{{ codeState.headerTitle }}</span>
      <button class="code-explore-btn" @click="emit('openExplorer')">EXPLORE CODE</button>
    </div>
    <div ref="contentEl" class="code-content">
      <template v-for="entry in codeState.entries" :key="entry.id">
        <div v-if="isFileHeader(entry)" class="code-file-header">{{ entry.text }}</div>
        <div v-else-if="isSeparator(entry)" class="code-separator" />
        <div
          v-else
          :class="[
            'code-line',
            {
              'code-highlight': entry.line.isHighlight,
              'code-comment': !entry.line.isHighlight && entry.line.isComment,
              'code-label': !entry.line.isHighlight && !entry.line.isComment && entry.line.isLabel,
              'code-blank': !entry.line.isHighlight && !entry.line.isComment && !entry.line.isLabel && entry.line.text.trim() === '',
            }
          ]"
        >
          <span class="code-linenum">&nbsp;&nbsp;</span>
          <span class="code-text">{{ entry.line.text }}</span>
        </div>
      </template>
    </div>
  </div>
</template>
