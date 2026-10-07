import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {ASSEMBLE, BURST, DIGITS, DURATION, FINAL_STRETCH, GATHER, LOCK, LOGO_RESOLVE, MORPH, TITLES} from '../particles/timing';
import {PromoProps} from '../schema';
import timing from './timing.json';

type Cue = {sfx: string; at: number; volume: number};

// Cue sheet for "Every Point Counts", derived from the particle timeline.
const CUES: Cue[] = [
	// The scattered points gather into the first number.
	{sfx: 'swarm', at: GATHER[0] - 4, volume: 0.45},
	{sfx: 'whoosh-soft', at: GATHER[0] + 2, volume: 0.3},
	// Each number locks in with a beat; the points flutter as they re-form into the next one.
	...LOCK.map((at, i) => {
		const final = DIGITS.length - i <= FINAL_STRETCH;
		return {sfx: final ? 'count-hit-final' : 'count-hit', at, volume: final ? 0.65 : 0.45};
	}),
	...LOCK.slice(0, -1).map((at) => ({sfx: 'swarm', at: at + 30 - MORPH - 4, volume: 0.28})),
	// Riser into the burst; the "1" explodes into dawn.
	{sfx: 'riser-long', at: BURST[0] - 78, volume: 0.5},
	{sfx: 'impact-big', at: BURST[0] - 1, volume: 0.75},
	{sfx: 'whoosh-big', at: BURST[0] - 10, volume: 0.45},
	// The points settle into the logo, then it resolves.
	{sfx: 'assemble', at: ASSEMBLE[0] + 4, volume: 0.55},
	{sfx: 'impact-soft', at: LOGO_RESOLVE[0] + 4, volume: 0.45},
	{sfx: 'shimmer', at: LOGO_RESOLVE[0] + 2, volume: 0.4},
	{sfx: 'sparkle', at: TITLES + 6, volume: 0.35},
	{sfx: 'shimmer-soft', at: TITLES + 50, volume: 0.22},
];

// Mix levels leave headroom; scripts/master.mjs brings the final file up to broadcast loudness.
const SFX_LEVEL = 0.75;
const MUSIC_LEVEL = 0.4;
const BED = 'music-bed-particles.wav';

if (timing[BED].total_frames !== DURATION || timing[BED].logo_hit !== BURST[0]) {
	console.warn(`src/audio/timing.json (${BED}) is out of date with the particle timeline: re-run scripts/generate_audio.py`);
}

export const ParticleSoundtrack: React.FC<PromoProps> = ({musicFile}) => {
	const {durationInFrames} = useVideoConfig();
	return (
		<>
			<Audio
				src={staticFile(musicFile || `audio/${BED}`)}
				volume={(f) =>
					MUSIC_LEVEL * interpolate(f, [0, 15, durationInFrames - 45, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
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
