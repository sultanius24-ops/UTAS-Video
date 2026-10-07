import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {phase} from '../loop';
import {colors} from '../theme';

type RibbonSpec = {
	id: string;
	base: number;
	amp: number;
	freq: number;
	speed: number;
	phase: number;
	thickness: number;
	stops: [string, string, string];
	opacity: number;
};

const ribbonPath = (spec: RibbonSpec, flow: number, twistPhase: number, width: number) => {
	const top: string[] = [];
	const bottom: string[] = [];
	const step = 24;
	for (let x = -40; x <= width + 40; x += step) {
		const k = x / width;
		const center = spec.base + Math.sin(k * Math.PI * 2 * spec.freq + flow + spec.phase) * spec.amp;
		// The thickness breathes along the ribbon so it reads like a twisting satin band.
		const twist = Math.abs(Math.sin(k * Math.PI * 1.6 + twistPhase + spec.phase));
		const half = (spec.thickness * (0.25 + 0.75 * twist)) / 2;
		top.push(`${x},${center - half}`);
		bottom.unshift(`${x},${center + half}`);
	}
	return `M ${top.join(' L ')} L ${bottom.join(' L ')} Z`;
};

// Flowing blue/orange satin ribbons echoing the wave at the base of the logo.
export const WaveRibbons: React.FC<{y?: number; scale?: number; reveal?: number; light?: boolean; loop?: number}> = ({
	y = 0,
	scale = 1,
	reveal = 0,
	light = false,
	loop,
}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const progress = interpolate(frame, [reveal, reveal + 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const specs: RibbonSpec[] = [
		{
			id: 'deep',
			base: height * 0.86,
			amp: 46 * scale,
			freq: 1.1,
			speed: 0.9,
			phase: 0,
			thickness: 120 * scale,
			stops: [colors.sky, colors.royal, colors.deep],
			opacity: light ? 0.95 : 0.9,
		},
		{
			id: 'gold',
			base: height * 0.9,
			amp: 60 * scale,
			freq: 0.9,
			speed: -0.7,
			phase: 2.2,
			thickness: 90 * scale,
			stops: [colors.amber, colors.orange, '#E2531A'],
			opacity: 0.95,
		},
		{
			id: 'sky',
			base: height * 0.94,
			amp: 34 * scale,
			freq: 1.4,
			speed: 1.2,
			phase: 4,
			thickness: 70 * scale,
			stops: ['#7DB3FF', colors.sky, colors.royal],
			opacity: 0.8,
		},
	];

	return (
		<svg
			width={width}
			height={height}
			style={{
				position: 'absolute',
				inset: 0,
				transform: `translateY(${y + (1 - progress) * 220}px)`,
				opacity: progress,
				filter: 'drop-shadow(0 18px 30px rgba(3,12,43,0.35))',
			}}
		>
			<defs>
				{specs.map((s) => (
					<linearGradient key={s.id} id={`rib-${s.id}`} x1="0" x2="1" y1="0" y2="1">
						<stop offset="0%" stopColor={s.stops[0]} />
						<stop offset="55%" stopColor={s.stops[1]} />
						<stop offset="100%" stopColor={s.stops[2]} />
					</linearGradient>
				))}
			</defs>
			{specs.map((s) => (
				<path key={s.id} d={ribbonPath(s, phase(frame, s.speed, loop), phase(frame, 0.6, loop), width)} fill={`url(#rib-${s.id})`} opacity={s.opacity} />
			))}
		</svg>
	);
};
