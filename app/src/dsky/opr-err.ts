import { state, notify } from '../core/state';
import { appendNarration } from '../ui/panel';

const hintMessages: Record<string, string> = {
  'digit-idle': 'You need to press VERB or NOUN first before entering digits.',
  'sign-idle': '+/- signs are only valid during data entry. Start with VERB.',
  'enter-no-data': 'Not enough digits entered. A data field needs exactly 5 digits before ENTER.',
  'enter-no-verb': 'Press VERB first, then enter a 2-digit verb code, before pressing ENTER.',
  'dispatch-fail': 'That verb/noun combination is not recognized. Try V35 ENTR for a lamp test.',
};

let lastHintTime = 0;

export function triggerOprErr(context: string): void {
  state.lights.oprErr = true;
  notify('display');

  // In free-play mode, show a contextual hint (debounced to max one per 2s)
  if (!state.scenarioActive) {
    const now = Date.now();
    if (now - lastHintTime >= 2000) {
      lastHintTime = now;
      const hint = hintMessages[context];
      if (hint) {
        appendNarration(hint);
      }
    }
  }
}
