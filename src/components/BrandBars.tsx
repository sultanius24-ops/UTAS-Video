import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {gradients} from '../theme';

// The four rising bars from the logo, animated as a growing "quality" chart.
const BARS = [
	{h: 0.46, g: gradients.blue},
	{h: 0.62, g: gradients.blue},
	{h: 0.78, g: gradients.blue},
	{h: 1, g: gradients.orange},
];

export const BrandBars: React.FC<{height: number; barWidth?: number; gap?: number; delay?: number}> = ({
	height,
	barWidth = 46,
	gap = 16,
	delay = 0,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<div style={{display: 'flex', alignItems: 'flex-end', gap, height}}>
			{BARS.map((bar, i) => {
				const grow = spring({frame: frame - delay - i * 5, fps, config: {damping: 14, mass: 0.7}});
				return (
					<div
						key={i}
						style={{
							width: barWidth,
							height: height * bar.h * grow,
							background: bar.g,
							clipPath: 'polygon(0 9%, 100% 0, 100% 100%, 0 100%)',
							boxShadow: '0 10px 40px rgba(21,87,214,0.35)',
						}}
					/>
				);
			})}
		</div>
	);
};
