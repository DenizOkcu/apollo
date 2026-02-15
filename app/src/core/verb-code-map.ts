import type { AGCCodeBlock } from './agc-source';
import {
  FREEPLAY_CLOCK,
  FREEPLAY_RENDEZVOUS,
  FREEPLAY_DATA_LOAD,
  FREEPLAY_PROGRAM_CHANGE,
  FREEPLAY_PROCEED,
  FREEPLAY_TERMINATE,
  LANDING_INTRO,
  LANDING_P68_CONFIRM,
  LANDING_P66_MANUAL,
  GUIDANCE_EQUATIONS,
  LANDING_P63,
  LANDING_P64_APPROACH,
  ALARM_POODOO,
  LAMP_TEST_INTRO,
  ALARM_RECOVERY,
} from './agc-source';

// Display verbs: V01-V07 (single-shot) and V11-V17 (monitor)
function isDisplayVerb(verb: number): boolean {
  return (verb >= 1 && verb <= 7) || (verb >= 11 && verb <= 17);
}

// Noun-specific mappings for display verbs
const nounBlocks: Record<number, AGCCodeBlock> = {
  36: FREEPLAY_CLOCK,
  43: LANDING_P68_CONFIRM,
  60: LANDING_P66_MANUAL,
  62: GUIDANCE_EQUATIONS,
  63: LANDING_P63,
  64: LANDING_P64_APPROACH,
  68: FREEPLAY_RENDEZVOUS,
};

// Alarm display: V05 N09 or V15 N09
const alarmVerbs = [5, 15];

/**
 * Look up the AGC code block to display for a given verb/noun command.
 * Priority: specific verb+noun pair, then verb-only fallback.
 */
export function getCodeBlockForCommand(verb: number, noun: number | null): AGCCodeBlock | null {
  // V05/V15 N09 — alarm code display
  if (noun === 9 && alarmVerbs.includes(verb)) {
    return ALARM_POODOO;
  }

  // Display verbs with noun-specific code
  if (isDisplayVerb(verb) && noun !== null && noun in nounBlocks) {
    return nounBlocks[noun];
  }

  // V21-V25 — data load verbs
  if (verb >= 21 && verb <= 25) {
    return FREEPLAY_DATA_LOAD;
  }

  // V35 — lamp test
  if (verb === 35) {
    return LAMP_TEST_INTRO;
  }

  // V36 — fresh start / restart
  if (verb === 36) {
    return ALARM_RECOVERY;
  }

  // V33 — proceed
  if (verb === 33) {
    return FREEPLAY_PROCEED;
  }

  // V34 — terminate
  if (verb === 34) {
    return FREEPLAY_TERMINATE;
  }

  // V37 — program change
  if (verb === 37) {
    return FREEPLAY_PROGRAM_CHANGE;
  }

  return null;
}

/**
 * Returns the introductory AGC code block (PINBALL GAME BUTTONS AND LIGHTS)
 * for display when free-play mode starts.
 */
export function getIntroCodeBlock(): AGCCodeBlock {
  return LANDING_INTRO;
}
