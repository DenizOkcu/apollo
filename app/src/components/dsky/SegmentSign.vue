<script setup lang="ts">
const props = defineProps<{
  value: '+' | '-' | null;
}>();
</script>

<template>
  <div class="seg-sign">
    <div :class="['sign-plus', { active: props.value === '+' }]">
      <div class="sign-bar sign-h" />
      <div class="sign-bar sign-v" />
    </div>
    <div :class="['sign-minus', { active: props.value === '-' }]">
      <div class="sign-bar sign-h" />
    </div>
  </div>
</template>
