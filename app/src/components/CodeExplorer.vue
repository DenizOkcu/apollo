<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useMobile } from '../composables/useMobile';
import { parseLine } from '../core/agc-source';
import type { AGCSourceLine } from '../core/agc-source';

interface AGCModule {
  name: string;
  label: string;
  files: string[];
}

interface AGCIndex {
  modules: AGCModule[];
}

const props = defineProps<{
  initialFile?: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { isMobile } = useMobile();

const index = ref<AGCIndex | null>(null);
const activeModule = ref('');
const activeFile = ref('');
const headerTitle = ref('AGC EXPLORER');
const sourceLines = ref<AGCSourceLine[]>([]);
const loading = ref(false);
const loadError = ref<string | null>(null);
const sidebarOpen = ref(false);
const hidden = ref(false);

const fileCache = new Map<string, string>();

async function fetchIndex(): Promise<AGCIndex> {
  if (index.value) return index.value;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}agc/agc-index.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    index.value = (await res.json()) as AGCIndex;
    return index.value;
  } catch (e) {
    loadError.value = 'Failed to load AGC source index';
    throw e;
  }
}

async function fetchSource(moduleName: string, fileName: string): Promise<string> {
  const key = `${moduleName}/${fileName}`;
  const cached = fileCache.get(key);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}agc/${key}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    fileCache.set(key, text);
    return text;
  } catch (e) {
    loadError.value = `Failed to load ${fileName}`;
    throw e;
  }
}

async function navigateTo(moduleName: string, fileName: string): Promise<void> {
  activeModule.value = moduleName;
  activeFile.value = fileName;
  headerTitle.value = `AGC EXPLORER — ${moduleName} / ${fileName}`;
  loading.value = true;
  loadError.value = null;

  try {
    const text = await fetchSource(moduleName, fileName);
    if (activeModule.value === moduleName && activeFile.value === fileName) {
      sourceLines.value = text.split('\n').map(line => parseLine(line, fileName));
      loading.value = false;
    }
  } catch {
    loading.value = false;
  }
}

function selectFile(moduleName: string, fileName: string): void {
  void navigateTo(moduleName, fileName);
  if (isMobile.value) {
    sidebarOpen.value = false;
  }
}

const collapsedModules = reactive(new Set<string>());

function toggleModule(name: string): void {
  if (collapsedModules.has(name)) {
    collapsedModules.delete(name);
  } else {
    collapsedModules.add(name);
  }
}

function close(): void {
  hidden.value = true;
  setTimeout(() => emit('close'), 300);
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close();
}

onMounted(async () => {
  document.addEventListener('keydown', onKeyDown);

  try {
    const agcIndex = await fetchIndex();
    let startModule = agcIndex.modules[0]?.name ?? '';
    let startFile = agcIndex.modules[0]?.files[0] ?? '';

    if (props.initialFile) {
      for (const mod of agcIndex.modules) {
        if (mod.files.includes(props.initialFile)) {
          startModule = mod.name;
          startFile = props.initialFile;
          break;
        }
      }
    }

    void navigateTo(startModule, startFile);
  } catch {
    // Error already stored in loadError
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <div :class="['explorer-overlay', { hidden }]">
    <div class="explorer-header">
      <div class="explorer-header-title">{{ headerTitle }}</div>
      <button class="explorer-close" @click="close">CLOSE [ESC]</button>
    </div>
    <div class="explorer-layout">
      <div :class="['explorer-sidebar', { 'sidebar-open': sidebarOpen }]">
        <template v-if="index">
          <template v-for="mod in index.modules" :key="mod.name">
            <div
              :class="['explorer-module-header', { expanded: !collapsedModules.has(mod.name) }]"
              @click="toggleModule(mod.name)"
            >{{ mod.label }}</div>
            <div :class="['explorer-file-list', { expanded: !collapsedModules.has(mod.name) }]">
              <div
                v-for="file in mod.files"
                :key="file"
                :class="['explorer-file', { active: activeModule === mod.name && activeFile === file }]"
                :data-module="mod.name"
                :data-file="file"
                @click="selectFile(mod.name, file)"
              >{{ file.replace('.agc', '') }}</div>
            </div>
          </template>
        </template>
      </div>

      <div
        v-if="isMobile && sidebarOpen"
        class="explorer-sidebar-backdrop active"
        @click="sidebarOpen = false"
      />

      <div class="explorer-source">
        <div v-if="loadError" class="explorer-source-loading">{{ loadError }}</div>
        <div v-else-if="loading" class="explorer-source-loading">LOADING...</div>
        <template v-else>
          <div
            v-for="(line, i) in sourceLines"
            :key="i"
            :class="[
              'code-line',
              {
                'code-highlight': line.isHighlight,
                'code-comment': !line.isHighlight && line.isComment,
                'code-label': !line.isHighlight && !line.isComment && line.isLabel,
                'code-blank': !line.isHighlight && !line.isComment && !line.isLabel && line.text.trim() === '',
              }
            ]"
          >
            <span class="code-linenum">{{ i + 1 }}</span>
            <span class="code-text">{{ line.text }}</span>
          </div>
        </template>
      </div>

      <button
        v-if="isMobile && !sidebarOpen"
        class="explorer-files-tab"
        @click="sidebarOpen = true"
      >FILES</button>
    </div>
  </div>
</template>
