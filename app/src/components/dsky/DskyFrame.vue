<script setup lang="ts">
import DskyDisplay from './DskyDisplay.vue';
import DskyKeypad from './DskyKeypad.vue';
</script>

<template>
  <div class="dsky-container">
    <div class="dsky-frame">
      <div class="dsky-nameplate">DISPLAY &amp; KEYBOARD</div>
      <DskyDisplay />
      <DskyKeypad />
    </div>
  </div>
</template>
