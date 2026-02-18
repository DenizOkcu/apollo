import { ref, onMounted } from 'vue';

const MOBILE_QUERY = '(max-width: 768px)';

const isMobile = ref(false);
const codePanelOpen = ref(false);

let initialized = false;
let mobileMatch: MediaQueryList | null = null;

function handleChange(): void {
  const match = mobileMatch!.matches;
  isMobile.value = match;
  if (match) {
    document.body.classList.add('is-mobile');
  } else {
    document.body.classList.remove('is-mobile');
    codePanelOpen.value = false;
  }
}

export function initMobile(): void {
  if (initialized) return;
  initialized = true;
  mobileMatch = window.matchMedia(MOBILE_QUERY);
  isMobile.value = mobileMatch.matches;
  if (isMobile.value) document.body.classList.add('is-mobile');
  mobileMatch.addEventListener('change', handleChange);
}

export function toggleCodePanel(): void {
  codePanelOpen.value = !codePanelOpen.value;
}

export function closeCodePanel(): void {
  codePanelOpen.value = false;
}

export function useMobile() {
  onMounted(() => {
    initMobile();
  });

  return {
    isMobile,
    codePanelOpen,
    toggleCodePanel,
    closeCodePanel,
  };
}
