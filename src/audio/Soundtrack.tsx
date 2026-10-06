import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {POP} from '../scenes/LogoFinale';
import {VALUE_CUES} from '../scenes/Values';
import {PROMO_DURATION, SCENE_STARTS} from '../timeline';
import {PromoProps} from '../schema';
import voiceover from './voiceover.json';
import timing from './timing.json';

const [OPENING, TITLE, JOURNEY, VALUES, PATRONAGE, FINALE] = SCENE_STARTS;
const LOGO_HIT = FINALE + POP;

type Cue = {sfx: string; at: number; volume: number};

// Sound-design cue sheet, anchored to scene starts so it stays in sync if scenes are retimed.
// Whoosh files peak ~18 frames in, so they start a little before the transition's midpoint.
const CUES: Cue[] = [
	// Opening: bars pop up, name reveals
	{sfx: 'impact-soft', at: OPENING + 4, volume: 0.45},
	...[9, 14, 19, 24].map((f, i) => ({sfx: `pop-${i + 1}`, at: OPENING + f, volume: 0.3})),
	{sfx: 'whoosh-soft', at: OPENING + 28, volume: 0.35},
	{sfx: 'shimmer-soft', at: OPENING + 110, volume: 0.3},
	// Title
	{sfx: 'whoosh-big', at: TITLE - 8, volume: 0.55},
	{sfx: 'impact-big', at: TITLE + 20, volume: 0.6},
	{sfx: 'impact-soft', at: TITLE + 40, volume: 0.3},
	{sfx: 'shimmer-soft', at: TITLE + 58, volume: 0.3},
	// Journey: counter ticks, ring completes, timeline milestones
	{sfx: 'whoosh-big', at: JOURNEY - 7, volume: 0.55},
	{sfx: 'counter-ticks', at: JOURNEY + 18, volume: 0.22},
	{sfx: 'ding', at: JOURNEY + 120, volume: 0.35},
	...[0, 1, 2, 3, 4].map((i) => ({sfx: `blip-${i + 1}`, at: JOURNEY + 60 + Math.round((i / 4) * 140), volume: 0.3})),
	// Values
	{sfx: 'whoosh-big', at: VALUES - 8, volume: 0.5},
	{sfx: 'sparkle', at: VALUES + 40, volume: 0.2},
	...VALUE_CUES.map((f, i) => ({sfx: `pop-${i + 2}`, at: VALUES + f, volume: 0.32})),
	// Patronage: reverse swell into the scene, then the sponsor's name lands
	{sfx: 'swell', at: PATRONAGE - 30, volume: 0.4},
	{sfx: 'impact-soft', at: PATRONAGE + 44, volume: 0.4},
	{sfx: 'shimmer', at: PATRONAGE + 44, volume: 0.35},
	// Finale: riser into the flash, the logo hit, then the shine
	{sfx: 'riser-long', at: LOGO_HIT - 78, volume: 0.45},
	{sfx: 'whoosh-reverse', at: FINALE - 4, volume: 0.3},
	{sfx: 'impact-big', at: LOGO_HIT - 1, volume: 0.75},
	{sfx: 'shimmer', at: LOGO_HIT, volume: 0.4},
	{sfx: 'whoosh-soft', at: LOGO_HIT + 20, volume: 0.3},
	{sfx: 'sparkle', at: LOGO_HIT + 40, volume: 0.35},
	{sfx: 'shimmer-soft', at: LOGO_HIT + 74, volume: 0.2},
];

// Mix levels leave headroom; scripts/master.mjs brings the final file up to broadcast loudness.
const VO_LEVEL = 0.75;
const SFX_LEVEL = 0.75;
const MUSIC_LEVEL = 0.3;
const DUCKED_LEVEL = 0.13;
const DUCK_RAMP = 8;

// Music bed level: fades in, dips under every voice-over line, swells after the last line, fades out.
const musicVolume = (f: number, total: number) => {
	const ducked = voiceover.some((v) => f >= v.from - DUCK_RAMP && f <= v.from + v.durationInFrames + DUCK_RAMP);
	let level = MUSIC_LEVEL;
	for (const v of voiceover) {
		const start = v.from;
		const end = v.from + v.durationInFrames;
		const d = interpolate(f, [start - DUCK_RAMP, start, end, end + DUCK_RAMP * 2], [0, 1, 1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
		level = Math.min(level, MUSIC_LEVEL - (MUSIC_LEVEL - DUCKED_LEVEL) * d);
	}
	if (!ducked && f > LOGO_HIT) {
		level = Math.max(level, 0.36);
	}
	const fades = interpolate(f, [0, 20, total - 45, total], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return level * fades;
};

if (timing.total_frames !== PROMO_DURATION || timing.logo_hit !== LOGO_HIT || timing.finale_start !== FINALE) {
	console.warn('src/audio/timing.json is out of date with the scene timings: re-run scripts/generate_audio.py');
}

export const Soundtrack: React.FC<PromoProps> = ({musicFile}) => {
	const {durationInFrames} = useVideoConfig();
	const music = musicFile || 'audio/music-bed.wav';

	return (
		<>
			<Audio src={staticFile(music)} volume={(f) => musicVolume(f, durationInFrames) * SFX_LEVEL} />
			{voiceover.map((v) => (
				<Sequence key={v.id} name={`VO ${v.id}`} from={v.from} layout="none">
					<Audio src={staticFile(v.src)} volume={VO_LEVEL} />
				</Sequence>
			))}
			{CUES.map((c, i) => (
				<Sequence key={`${c.sfx}-${i}`} name={`SFX ${c.sfx}`} from={c.at} layout="none">
					<Audio src={staticFile(`audio/sfx/${c.sfx}.wav`)} volume={c.volume * SFX_LEVEL} />
				</Sequence>
			))}
		</>
	);
};
