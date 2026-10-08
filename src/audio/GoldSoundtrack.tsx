import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {COUNT_END, COUNT_FROM, COUNT_START, DURATION, FINAL_STRETCH, LOGO_DONE, PARTS, RISE_DURATION, SHINE, SHINE_2, STEP, ZOOM} from '../gold/timing';
import {PromoProps} from '../schema';
import timing from './timing.json';

type Cue = {sfx: string; at: number; volume: number};

const LANDING: Record<string, string> = {
	wave: 'shimmer-soft',
	'bar-1': 'pop-1',
	'bar-2': 'pop-2',
	'bar-3': 'pop-3',
	'bar-4': 'pop-4',
	ring: 'shimmer-soft',
	building: 'shimmer',
};

// Cue sheet for the Golden Unveil, derived from its timeline.
const CUES: Cue[] = [
	// The gold light circles the building while the countdown runs.
	{sfx: 'gold-trail', at: COUNT_START - 4, volume: 0.5},
	...new Array(COUNT_FROM).fill(0).map((_, i) => {
		const final = COUNT_FROM - i <= FINAL_STRETCH;
		return {sfx: final ? 'count-hit-final' : 'count-hit', at: COUNT_START + i * STEP, volume: final ? 0.6 : 0.42};
	}),
	// The loop closes: the outline flashes and the building lights up.
	{sfx: 'riser-long', at: COUNT_END - 78, volume: 0.45},
	{sfx: 'impact-big', at: COUNT_END - 1, volume: 0.7},
	{sfx: 'shimmer', at: COUNT_END, volume: 0.45},
	// Each logo part rises (soft whoosh) and settles beside the flag (chime).
	...PARTS.flatMap(({layer, start}) => [
		{sfx: 'whoosh-soft', at: start, volume: 0.22},
		{sfx: LANDING[layer], at: start + Math.round(RISE_DURATION * 0.55), volume: 0.32},
	]),
	// Logo complete: gold shine.
	{sfx: 'impact-soft', at: LOGO_DONE - 4, volume: 0.45},
	{sfx: 'sparkle', at: SHINE + 4, volume: 0.4},
	// Final push-in onto the logo, and a last shine when it settles.
	{sfx: 'whoosh-soft', at: ZOOM[0] + 10, volume: 0.25},
	{sfx: 'shimmer-soft', at: ZOOM[0] + 20, volume: 0.25},
	{sfx: 'sparkle', at: SHINE_2 + 2, volume: 0.35},
];

// Mix levels leave headroom; scripts/master.mjs brings the final file up to broadcast loudness.
const SFX_LEVEL = 0.75;
const MUSIC_LEVEL = 0.4;
const BED = 'music-bed-gold.wav';

if (timing[BED].total_frames !== DURATION || timing[BED].countdown_end !== COUNT_END) {
	console.warn(`src/audio/timing.json (${BED}) is out of date with the gold timeline: re-run scripts/generate_audio.py`);
}

export const GoldSoundtrack: React.FC<PromoProps> = ({musicFile}) => {
	const {durationInFrames} = useVideoConfig();
	return (
		<>
			<Audio
				src={staticFile(musicFile || `audio/${BED}`)}
				volume={(f) =>
					MUSIC_LEVEL * interpolate(f, [0, 20, durationInFrames - 45, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
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
