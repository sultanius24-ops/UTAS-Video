import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';

type Empty = Record<string, never>;

// Exiting scene pushes forward and blurs out while the next scene settles in from a slight zoom.
const ZoomThrough: React.FC<TransitionPresentationComponentProps<Empty>> = ({children, presentationDirection, presentationProgress: p}) => {
	const exiting = presentationDirection === 'exiting';
	const scale = exiting ? 1 + p * 0.35 : 1.25 - p * 0.25;
	const opacity = exiting ? 1 - p : p;
	const blur = exiting ? p * 18 : (1 - p) * 18;
	return (
		<AbsoluteFill style={{transform: `scale(${scale})`, opacity, filter: `blur(${blur}px)`}}>{children}</AbsoluteFill>
	);
};

export const zoomThrough = (): TransitionPresentation<Empty> => ({component: ZoomThrough, props: {} as Empty});

// Dark scene dissolves through a bright flash into the light logo scene.
const FlashThrough: React.FC<TransitionPresentationComponentProps<Empty>> = ({children, presentationDirection, presentationProgress: p}) => {
	const exiting = presentationDirection === 'exiting';
	const flash = exiting
		? interpolate(p, [0, 0.5, 1], [0, 1, 1])
		: interpolate(p, [0, 0.5, 1], [1, 1, 0]);
	return (
		<AbsoluteFill style={{opacity: exiting ? 1 : p > 0.5 ? 1 : 0}}>
			<AbsoluteFill style={{transform: exiting ? `scale(${1 + p * 0.15})` : undefined}}>{children}</AbsoluteFill>
			<AbsoluteFill
				style={{
					background: 'radial-gradient(circle, #FFFFFF 0%, #FFF4D6 45%, #FFFFFF 100%)',
					opacity: flash,
				}}
			/>
		</AbsoluteFill>
	);
};

export const flashThrough = (): TransitionPresentation<Empty> => ({component: FlashThrough, props: {} as Empty});
