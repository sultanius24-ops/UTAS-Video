// Scene lengths and transition overlaps, shared by the video and the soundtrack.
import {COUNTDOWN_DURATION, COUNTDOWN_END, COUNT_FROM, INTRO, STEP, FINAL_STRETCH} from './scenes/Countdown';
import {COMPLETE, FINALE_DURATION} from './scenes/LogoFinale';
import {BUILD} from './components/LogoBuild';

export {COUNTDOWN_DURATION, COUNTDOWN_END, COUNT_FROM, INTRO, STEP, FINAL_STRETCH, FINALE_DURATION, BUILD};

export const FLASH = 24;
export const FINALE_START = COUNTDOWN_DURATION - FLASH;
// The white flash peaks halfway through the transition: that's where the music resolves.
export const FLASH_PEAK = FINALE_START + FLASH / 2;
export const LOGO_COMPLETE = FINALE_START + COMPLETE;
export const PROMO_DURATION = COUNTDOWN_DURATION + FINALE_DURATION - FLASH;

// Absolute frame of each number's first appearance, from COUNT_FROM down to 1.
export const TICKS = new Array(COUNT_FROM).fill(0).map((_, i) => ({n: COUNT_FROM - i, at: INTRO + i * STEP}));

export {LOOP_FRAMES} from './loop';
