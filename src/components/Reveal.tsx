import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

// Masked slide-up reveal for a line of text (or any element).
export const MaskReveal: React.FC<{
	delay?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
	direction?: 'up' | 'down';
}> = ({delay = 0, children, style, direction = 'up'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: 26});
	const offset = (direction === 'up' ? 110 : -110) * (1 - s);
	return (
		<div style={{overflow: 'hidden', paddingBottom: '0.08em', ...style}}>
			<div style={{transform: `translateY(${offset}%)`}}>{children}</div>
		</div>
	);
};

// Letter-by-letter cascade with a slight blur and rise.
export const LetterCascade: React.FC<{
	text: string;
	delay?: number;
	stagger?: number;
	style?: React.CSSProperties;
	letterStyle?: React.CSSProperties;
}> = ({text, delay = 0, stagger = 2.5, style, letterStyle}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<div style={{display: 'flex', whiteSpace: 'pre', ...style}}>
			{text.split('').map((ch, i) => {
				const f = frame - delay - i * stagger;
				const s = spring({frame: f, fps, config: {damping: 13, mass: 0.6, stiffness: 120}});
				const blur = interpolate(f, [0, 12], [14, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity: interpolate(f, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
							transform: `translateY(${(1 - s) * 80}px) scale(${0.8 + 0.2 * s})`,
							filter: `blur(${blur}px)`,
							...letterStyle,
						}}
					>
						{ch}
					</span>
				);
			})}
		</div>
	);
};

// A horizontal accent line that draws in from one side.
export const AccentLine: React.FC<{
	delay?: number;
	width: number;
	height?: number;
	background: string;
	align?: 'left' | 'center';
}> = ({delay = 0, width, height = 6, background, align = 'left'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: 30});
	return (
		<div
			style={{
				width: width * s,
				height,
				borderRadius: height,
				background,
				margin: align === 'center' ? '0 auto' : undefined,
			}}
		/>
	);
};
