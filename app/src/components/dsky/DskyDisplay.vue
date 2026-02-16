<script setup lang="ts">
import { computed } from 'vue';
import { useAgcStore } from '../../stores/agc';
import SegmentDigit from './SegmentDigit.vue';
import SegmentSign from './SegmentSign.vue';

const store = useAgcStore();

const lightDefs = [
  { key: 'uplinkActy', label: 'UPLINK\nACTY', tooltip: 'UPLINK ACTY — Lit when the AGC is receiving data from Mission Control.' },
  { key: 'noAtt', label: 'NO ATT', tooltip: 'NO ATT — The inertial platform has lost its attitude reference.' },
  { key: 'stby', label: 'STBY', tooltip: 'STBY — The computer is in standby mode to conserve power.' },
  { key: 'keyRel', label: 'KEY REL', tooltip: 'KEY REL — The computer needs the display back; press KEY REL to release it.' },
  { key: 'oprErr', label: 'OPR ERR', tooltip: 'OPR ERR — You pressed an invalid key sequence; press RSET to clear.' },
  { key: 'temp', label: 'TEMP', tooltip: 'TEMP — The stable platform temperature is out of tolerance.' },
  { key: 'gimbalLock', label: 'GIMBAL\nLOCK', tooltip: 'GIMBAL LOCK — The IMU gimbals are near alignment; attitude must change to avoid losing reference.' },
  { key: 'prog', label: 'PROG', tooltip: 'PROG — A program alarm has occurred; check the alarm code with V05 N09.' },
  { key: 'restart', label: 'RESTART', tooltip: 'RESTART — The computer has restarted due to a software or hardware error.' },
  { key: 'tracker', label: 'TRACKER', tooltip: 'TRACKER — The rendezvous radar or landing radar is tracking a target.' },
  { key: 'alt', label: 'ALT', tooltip: 'ALT — Altitude data from the landing radar disagrees with the computer\'s estimate.' },
  { key: 'vel', label: 'VEL', tooltip: 'VEL — Velocity data from the landing radar disagrees with the computer\'s estimate.' },
] as const;

type LightKey = typeof lightDefs[number]['key'];

function isLightActive(key: string): boolean {
  return store.state.lights[key as LightKey];
}

// 2-digit displays
function digit(value: number | null, place: 0 | 1): number | null {
  if (value === null) return null;
  return place === 0 ? Math.floor(value / 10) % 10 : value % 10;
}

const progD0 = computed(() => digit(store.state.program, 0));
const progD1 = computed(() => digit(store.state.program, 1));
const verbD0 = computed(() => digit(store.state.verb, 0));
const verbD1 = computed(() => digit(store.state.verb, 1));
const nounD0 = computed(() => digit(store.state.noun, 0));
const nounD1 = computed(() => digit(store.state.noun, 1));
</script>

<template>
  <div class="dsky-display">
    <!-- Status lights (left column) -->
    <div class="dsky-lights-column">
      <div
        v-for="def in lightDefs"
        :key="def.key"
        :class="['dsky-light', { active: isLightActive(def.key) }]"
        :data-light="def.key"
        :title="def.tooltip"
      >{{ def.label }}</div>
    </div>

    <!-- Main display (right side) -->
    <div class="dsky-display-main">
      <!-- COMP ACTY -->
      <div
        :class="['dsky-comp-acty', { active: store.state.lights.compActy }]"
        title="COMP ACTY — Flashes when the computer is processing a command."
      >COMP&#10;ACTY</div>

      <!-- Program row -->
      <div class="dsky-labeled-row" title="PROG — The current program number running on the AGC (e.g. P63 = lunar braking).">
        <div class="dsky-label">PROG</div>
        <div class="dsky-digits">
          <SegmentDigit :value="progD0" />
          <SegmentDigit :value="progD1" />
        </div>
      </div>

      <!-- Verb / Noun row -->
      <div :class="['dsky-verb-noun-container', { flashing: store.state.verbNounFlash }]">
        <div class="dsky-verb-noun-row">
          <div class="dsky-labeled-row" title="VERB — The action code telling the computer what to do (e.g. V16 = monitor, V35 = lamp test).">
            <div class="dsky-label">VERB</div>
            <div class="dsky-digits">
              <SegmentDigit :value="verbD0" />
              <SegmentDigit :value="verbD1" />
            </div>
          </div>
          <div class="dsky-labeled-row" title="NOUN — The data code telling the computer what to display (e.g. N62 = velocity/time/delta-V).">
            <div class="dsky-label">NOUN</div>
            <div class="dsky-digits">
              <SegmentDigit :value="nounD0" />
              <SegmentDigit :value="nounD1" />
            </div>
          </div>
        </div>
      </div>

      <!-- Separator -->
      <div class="dsky-separator" />

      <!-- Register 1 -->
      <div class="dsky-register" title="Register 1 — The first data field; its meaning depends on the active verb/noun.">
        <SegmentSign :value="store.state.r1.sign" />
        <SegmentDigit v-for="(d, i) in store.state.r1.digits" :key="i" :value="d" />
      </div>

      <div class="dsky-separator" />

      <!-- Register 2 -->
      <div class="dsky-register" title="Register 2 — The second data field; its meaning depends on the active verb/noun.">
        <SegmentSign :value="store.state.r2.sign" />
        <SegmentDigit v-for="(d, i) in store.state.r2.digits" :key="i" :value="d" />
      </div>

      <div class="dsky-separator" />

      <!-- Register 3 -->
      <div class="dsky-register" title="Register 3 — The third data field; its meaning depends on the active verb/noun.">
        <SegmentSign :value="store.state.r3.sign" />
        <SegmentDigit v-for="(d, i) in store.state.r3.digits" :key="i" :value="d" />
      </div>
    </div>
  </div>
</template>
