import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {drift, phase} from '../loop';
import {colors} from '../theme';

type Props = {
	variant?: 'dark' | 'light';
	particles?: number;
	grid?: boolean;
	accent?: 'blue' | 'gold';
	// Make every motion repeat exactly after this many frames.
	loop?: number;
};

// Animated brand backdrop: drifting light blobs, perspective grid and floating particles.
export const Backdrop: React.FC<Props> = ({variant = 'dark', particles = 60, grid = true, accent = 'blue', loop}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const dark = variant === 'dark';

	const dots = useMemo(
		() =>
			new Array(particles).fill(0).map((_, i) => ({
				x: random(`x${i}`) * width,
				y: random(`y${i}`) * height,
				r: 1 + random(`r${i}`) * 3,
				speed: 0.2 + random(`s${i}`) * 0.8,
				phase: random(`p${i}`) * Math.PI * 2,
				warm: random(`w${i}`) > (accent === 'gold' ? 0.4 : 0.8),
			})),
		[particles, width, height, accent],
	);

	const ph = (rate: number) => phase(frame, rate, loop);
	const blobA = {x: 0.25 + Math.sin(ph(0.35)) * 0.08, y: 0.3 + Math.cos(ph(0.3)) * 0.08};
	const blobB = {x: 0.78 + Math.cos(ph(0.28)) * 0.07, y: 0.72 + Math.sin(ph(0.33)) * 0.07};
	const warm = accent === 'gold' ? 'rgba(255,194,51,0.30)' : 'rgba(247,132,30,0.22)';

	const base = dark
		? `radial-gradient(ellipse at 50% 120%, ${colors.deep} 0%, ${colors.navy} 45%, ${colors.night} 100%)`
		: `radial-gradient(ellipse at 50% 40%, ${colors.white} 0%, ${colors.paper} 55%, #E3ECFF 100%)`;

	return (
		<AbsoluteFill style={{background: base, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at ${blobA.x * 100}% ${blobA.y * 100}%, ${
						dark ? 'rgba(61,139,255,0.35)' : 'rgba(61,139,255,0.18)'
					} 0%, transparent 40%), radial-gradient(circle at ${blobB.x * 100}% ${blobB.y * 100}%, ${
						dark ? warm : 'rgba(255,194,51,0.20)'
					} 0%, transparent 38%)`,
				}}
			/>
			{grid ? (
				<AbsoluteFill style={{perspective: 900, perspectiveOrigin: '50% 30%'}}>
					<div
						style={{
							position: 'absolute',
							left: '-50%',
							width: '200%',
							height: '120%',
							top: '45%',
							transform: 'rotateX(72deg)',
							transformOrigin: '50% 0%',
							backgroundImage: `linear-gradient(${
								dark ? 'rgba(120,170,255,0.16)' : 'rgba(21,87,214,0.10)'
							} 2px, transparent 2px), linear-gradient(90deg, ${
								dark ? 'rgba(120,170,255,0.16)' : 'rgba(21,87,214,0.10)'
							} 2px, transparent 2px)`,
							backgroundSize: '90px 90px',
							backgroundPosition: `0px ${drift(frame, 1.6, 90, loop)}px`,
							maskImage: 'linear-gradient(180deg, transparent 0%, black 35%, black 60%, transparent 100%)',
							WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 35%, black 60%, transparent 100%)',
						}}
					/>
				</AbsoluteFill>
			) : null}
			<svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
				{dots.map((d, i) => {
					const y = (d.y - drift(frame, d.speed * 1.5, height, loop) + height) % height;
					const x = d.x + Math.sin(ph(0.75) + d.phase) * 14;
					const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(ph(1.2) + d.phase));
					const fill = d.warm ? colors.amber : dark ? colors.ice : colors.royal;
					return <circle key={i} cx={x} cy={y} r={d.r} fill={fill} opacity={twinkle * (dark ? 0.7 : 0.35)} />;
				})}
			</svg>
			<AbsoluteFill
				style={{
					background: dark
						? 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)'
						: 'radial-gradient(ellipse at center, transparent 60%, rgba(21,87,214,0.10) 100%)',
					opacity: loop ? 1 : interpolate(frame, [0, 10], [0.6, 1], {extrapolateRight: 'clamp'}),
				}}
			/>
		</AbsoluteFill>
	);
};
