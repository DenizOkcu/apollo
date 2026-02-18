import { onMounted, onUnmounted } from 'vue';
import { bindPhysicalKeyboard, unbindPhysicalKeyboard } from '../dsky/keyboard';

let bound = false;

export function useKeyboard(): void {
  onMounted(() => {
    if (!bound) {
      bindPhysicalKeyboard();
      bound = true;
    }
  });

  onUnmounted(() => {
    if (bound) {
      unbindPhysicalKeyboard();
      bound = false;
    }
  });
}
