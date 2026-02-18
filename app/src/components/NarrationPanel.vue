<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { narrationState } from '../composables/useNarration';
import type { NarrationEntry } from '../composables/useNarration';

const contentEl = ref<HTMLElement | null>(null);

// Track which entries have been fully typed out
const typedTexts = ref<Map<number, string>>(new Map());
const intervals = new Set<ReturnType<typeof setInterval>>();

function startTyping(entry: NarrationEntry): void {
  typedTexts.value.set(entry.id, '');
  let i = 0;
  const timer = setInterval(() => {
    if (i < entry.text.length) {
      typedTexts.value.set(entry.id, entry.text.slice(0, i + 1));
      i++;
      scrollToBottom();
    } else {
      clearInterval(timer);
      intervals.delete(timer);
    }
  }, 20);
  intervals.add(timer);
}

function scrollToBottom(): void {
  if (contentEl.value) {
    contentEl.value.scrollTop = contentEl.value.scrollHeight;
  }
}

// Watch for new entries
let lastLength = 0;
watch(
  () => narrationState.entries.length,
  async () => {
    if (narrationState.entries.length > lastLength) {
      // New entries added
      for (let i = lastLength; i < narrationState.entries.length; i++) {
        startTyping(narrationState.entries[i]);
      }
    } else if (narrationState.entries.length === 0) {
      // Cleared
      for (const timer of intervals) clearInterval(timer);
      intervals.clear();
      typedTexts.value.clear();
    }
    lastLength = narrationState.entries.length;
    await nextTick();
    scrollToBottom();
  },
  { immediate: true }
);

onUnmounted(() => {
  for (const timer of intervals) clearInterval(timer);
  intervals.clear();
});

function getTypedText(entry: NarrationEntry): string {
  return typedTexts.value.get(entry.id) ?? entry.text;
}
</script>

<template>
  <div class="narration-panel">
    <div class="narration-header">MISSION LOG</div>
    <div ref="contentEl" class="narration-content">
      <div
        v-for="entry in narrationState.entries"
        :key="entry.id"
        :class="['narration-entry', { 'key-hint': entry.isHint }]"
      >
        <span v-if="entry.timestamp" class="narration-timestamp">{{ entry.isHint ? '>> ' : `[${entry.timestamp}] ` }}</span>
        <span class="narration-text">{{ getTypedText(entry) }}</span>
      </div>
    </div>
  </div>
</template>
