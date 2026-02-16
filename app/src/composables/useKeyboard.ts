import { onMounted, onUnmounted } from 'vue';
import { bindPhysicalKeyboard } from '../dsky/keyboard';

let bound = false;

export function useKeyboard(): void {
  onMounted(() => {
    if (!bound) {
      bindPhysicalKeyboard();
      bound = true;
    }
  });

  onUnmounted(() => {
    // Keep keyboard bound — singleton
  });
}
