<script setup lang="ts">
import { computed } from 'vue';

type Segment = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';

const DIGIT_SEGMENTS: Record<number, Segment[]> = {
  0: ['a', 'b', 'c', 'd', 'e', 'f'],
  1: ['b', 'c'],
  2: ['a', 'b', 'd', 'e', 'g'],
  3: ['a', 'b', 'c', 'd', 'g'],
  4: ['b', 'c', 'f', 'g'],
  5: ['a', 'c', 'd', 'f', 'g'],
  6: ['a', 'c', 'd', 'e', 'f', 'g'],
  7: ['a', 'b', 'c'],
  8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  9: ['a', 'b', 'c', 'd', 'f', 'g'],
};

const ALL_SEGMENTS: Segment[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

const props = defineProps<{
  value: number | null;
}>();

const activeSegments = computed(() => {
  if (props.value === null || props.value < 0 || props.value > 9) return [];
  return DIGIT_SEGMENTS[props.value] || [];
});
</script>

<template>
  <div class="seg-digit">
    <div
      v-for="seg in ALL_SEGMENTS"
      :key="seg"
      :class="['seg', `seg-${seg}`, { active: activeSegments.includes(seg) }]"
      :data-segment="seg"
    />
  </div>
</template>
