import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';

type Empty = Record<string, never>;

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
