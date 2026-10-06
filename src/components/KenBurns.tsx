import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// Slow cinematic push-in/pan across a still photo.
export const KenBurns: React.FC<{
	src: string;
	from?: number;
	to?: number;
	panX?: [number, number];
	panY?: [number, number];
	origin?: string;
	style?: React.CSSProperties;
}> = ({src, from = 1.05, to = 1.2, panX = [0, -40], panY = [0, 0], origin = '50% 50%', style}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const p = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
	const eased = 1 - Math.pow(1 - p, 1.6);
	const scale = from + (to - from) * eased;
	const x = panX[0] + (panX[1] - panX[0]) * eased;
	const y = panY[0] + (panY[1] - panY[0]) * eased;

	return (
		<AbsoluteFill style={{overflow: 'hidden', ...style}}>
			<Img
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `translate(${x}px, ${y}px) scale(${scale})`,
					transformOrigin: origin,
				}}
			/>
		</AbsoluteFill>
	);
};
