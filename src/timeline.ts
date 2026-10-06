// Scene lengths and transition overlaps, shared by the video and the soundtrack.
import {OPENING_DURATION} from './scenes/Opening';
import {TITLE_DURATION} from './scenes/TitleReveal';
import {JOURNEY_DURATION} from './scenes/Journey';
import {VALUES_DURATION} from './scenes/Values';
import {PATRONAGE_DURATION} from './scenes/Patronage';
import {FINALE_DURATION} from './scenes/LogoFinale';

export {OPENING_DURATION, TITLE_DURATION, JOURNEY_DURATION, VALUES_DURATION, PATRONAGE_DURATION, FINALE_DURATION};

export const T = {
	toTitle: 20,
	toJourney: 22,
	toValues: 20,
	toPatronage: 24,
	toFinale: 24,
};

const DURATIONS = [OPENING_DURATION, TITLE_DURATION, JOURNEY_DURATION, VALUES_DURATION, PATRONAGE_DURATION, FINALE_DURATION];
const OVERLAPS = [T.toTitle, T.toJourney, T.toValues, T.toPatronage, T.toFinale];

// Absolute frame at which each scene begins (transitions overlap neighbouring scenes).
export const SCENE_STARTS = DURATIONS.reduce<number[]>((starts, _, i) => {
	if (i > 0) starts.push(starts[i - 1] + DURATIONS[i - 1] - OVERLAPS[i - 1]);
	return starts;
}, [0]);

export const PROMO_DURATION = DURATIONS.reduce((a, b) => a + b, 0) - OVERLAPS.reduce((a, b) => a + b, 0);
