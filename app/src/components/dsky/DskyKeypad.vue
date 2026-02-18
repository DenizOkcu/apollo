<script setup lang="ts">
import { ref } from 'vue';
import { pressKey } from '../../dsky/keyboard';
import type { DSKYKey } from '../../dsky/keyboard';

interface KeyDef {
  label: string;
  key: DSKYKey;
  className?: string;
}

const rows: KeyDef[][] = [
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
    { label: '\u2212', key: 'MINUS', className: 'key-sign' },
    { label: 'ENTR', key: 'ENTER', className: 'key-enter' },
  ],
  [
    { label: 'RSET', key: 'RSET', className: 'key-action key-rset' },
  ],
];

const pressedKey = ref<string | null>(null);

function onPress(e: Event, keyDef: KeyDef): void {
  e.preventDefault();
  pressedKey.value = keyDef.key;
  pressKey(keyDef.key);
}

function onRelease(): void {
  pressedKey.value = null;
}
</script>

<template>
  <div class="dsky-keypad">
    <div v-for="(row, ri) in rows" :key="ri" class="keypad-row">
      <button
        v-for="keyDef in row"
        :key="keyDef.key"
        :class="['dsky-key', keyDef.className || 'key-digit', { pressed: pressedKey === keyDef.key }]"
        :data-key="keyDef.key"
        @mousedown="onPress($event, keyDef)"
        @mouseup="onRelease"
        @mouseleave="onRelease"
        @touchstart="onPress($event, keyDef)"
        @touchend="onRelease"
      >{{ keyDef.label }}</button>
    </div>
  </div>
</template>
