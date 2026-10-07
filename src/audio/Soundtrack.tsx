import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {COUNTDOWN_END, FINAL_STRETCH, FINALE_START, LOGO_HIT, PROMO_DURATION, STEP, TICKS} from '../timeline';
import {PromoProps} from '../schema';
import timing from './timing.json';

type Cue = {sfx: string; at: number; volume: number};

// Sound-design cue sheet, derived from the timeline so it stays in sync if the countdown changes.
const CUES: Cue[] = [
	{sfx: 'whoosh-soft', at: 2, volume: 0.35},
	// A beat on every number, heavier for the final stretch, and a soft "tock" on each half second.
	...TICKS.flatMap(({n, at}) => [
		{sfx: n <= FINAL_STRETCH ? 'count-hit-final' : 'count-hit', at, volume: n <= FINAL_STRETCH ? 0.7 : 0.5},
		...(n > 1 ? [{sfx: 'tock', at: at + STEP / 2, volume: n <= FINAL_STRETCH ? 0.28 : 0.18}] : []),
	]),
	// Riser lands exactly on the logo hit; whoosh as the flash swallows the countdown.
	{sfx: 'riser-long', at: LOGO_HIT - 78, volume: 0.5},
	{sfx: 'whoosh-reverse', at: FINALE_START - 4, volume: 0.35},
	{sfx: 'impact-big', at: LOGO_HIT - 1, volume: 0.8},
	{sfx: 'shimmer', at: LOGO_HIT, volume: 0.45},
	{sfx: 'whoosh-soft', at: LOGO_HIT + 20, volume: 0.3},
	{sfx: 'sparkle', at: LOGO_HIT + 40, volume: 0.4},
	{sfx: 'shimmer-soft', at: LOGO_HIT + 74, volume: 0.25},
];

// Mix levels leave headroom; scripts/master.mjs brings the final file up to broadcast loudness.
const SFX_LEVEL = 0.75;
const MUSIC_LEVEL = 0.4;

if (timing.total_frames !== PROMO_DURATION || timing.logo_hit !== LOGO_HIT || timing.countdown_end !== COUNTDOWN_END) {
	console.warn('src/audio/timing.json is out of date with the scene timings: re-run scripts/generate_audio.py');
}

export const Soundtrack: React.FC<PromoProps> = ({musicFile}) => {
	const {durationInFrames} = useVideoConfig();
	const music = musicFile || 'audio/music-bed.wav';

	return (
		<>
			<Audio
				src={staticFile(music)}
				volume={(f) =>
					MUSIC_LEVEL *
					interpolate(f, [0, 10, durationInFrames - 45, durationInFrames], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})
				}
			/>
			{CUES.map((c, i) => (
				<Sequence key={`${c.sfx}-${i}`} name={`SFX ${c.sfx}`} from={c.at} layout="none">
					<Audio src={staticFile(`audio/sfx/${c.sfx}.wav`)} volume={c.volume * SFX_LEVEL} />
				</Sequence>
			))}
		</>
	);
};
