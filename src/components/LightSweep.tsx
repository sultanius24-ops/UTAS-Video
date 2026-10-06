import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

// A diagonal glint that travels across the frame once.
export const LightSweep: React.FC<{start: number; duration?: number; opacity?: number; style?: React.CSSProperties}> = ({
	start,
	duration = 30,
	opacity = 0.8,
	style,
}) => {
	const frame = useCurrentFrame();
	const x = interpolate(frame, [start, start + duration], [-60, 160], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const visible = frame >= start && frame <= start + duration;
	return (
		<AbsoluteFill
			style={{
				opacity: visible ? opacity : 0,
				background: `linear-gradient(105deg, transparent ${x - 12}%, rgba(255,255,255,0.0) ${x - 8}%, rgba(255,255,255,0.95) ${x}%, rgba(255,255,255,0.0) ${x + 8}%, transparent ${x + 12}%)`,
				mixBlendMode: 'overlay',
				pointerEvents: 'none',
				...style,
			}}
		/>
	);
};

// Thin horizontal light streaks that whip across the screen.
export const Streaks: React.FC<{count?: number; color?: string; seed?: number}> = ({count = 6, color = '#8FC1FF', seed = 1}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{new Array(count).fill(0).map((_, i) => {
				const period = 70 + ((i * 37 + seed * 13) % 50);
				const offset = (i * 23 + seed * 7) % period;
				const p = ((frame + offset) % period) / period;
				const top = 8 + ((i * 53 + seed * 29) % 84);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							top: `${top}%`,
							left: `${-30 + p * 160}%`,
							width: 260 + (i % 3) * 120,
							height: 2,
							background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
							opacity: 0.55 * Math.sin(p * Math.PI),
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
