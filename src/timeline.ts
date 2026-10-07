// Scene lengths and transition overlaps, shared by the video and the soundtrack.
import {COUNTDOWN_DURATION, COUNTDOWN_END, COUNT_FROM, INTRO, STEP, FINAL_STRETCH} from './scenes/Countdown';
import {FINALE_DURATION, POP} from './scenes/LogoFinale';

export {COUNTDOWN_DURATION, COUNTDOWN_END, COUNT_FROM, INTRO, STEP, FINAL_STRETCH, FINALE_DURATION};

export const FLASH = 24;
export const FINALE_START = COUNTDOWN_DURATION - FLASH;
export const LOGO_HIT = FINALE_START + POP;
export const PROMO_DURATION = COUNTDOWN_DURATION + FINALE_DURATION - FLASH;

// Absolute frame of each number's first appearance, from COUNT_FROM down to 1.
export const TICKS = new Array(COUNT_FROM).fill(0).map((_, i) => ({n: COUNT_FROM - i, at: INTRO + i * STEP}));
