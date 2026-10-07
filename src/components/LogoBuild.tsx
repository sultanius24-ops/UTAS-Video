import React from 'react';
import {Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// The logo split into layers by scripts/split_logo.py. All layers share the logo's full canvas.
const layer = (name: string) => staticFile(`images/logo-layers/${name}.png`);
export const LOGO_ASPECT = 850 / 1328;

// Frame (relative to the start of the build) at which each part animates.
export const BUILD = {
	ring: [10, 44],
	bars: [22, 28, 34, 40],
	wave: [40, 66],
	building: [54, 80],
	complete: 82,
} as const;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);

const fill: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%'};

// Assembles the logo: the Q ring draws itself, the bars rise like a growth chart, the wave
// sweeps in underneath and the building rises into place.
export const LogoBuild: React.FC<{width: number}> = ({width}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const height = width * LOGO_ASPECT;

	// Ring: conic sweep clockwise from where the Q's stroke begins (top-left), centred on the ring.
	const ring = interpolate(frame, BUILD.ring, [0, 1], {...clamp, easing: ease});
	const ringAngle = ring * 372;
	const ringMask = `conic-gradient(from 300deg at 63.6% 36%, #000 0deg, #000 ${Math.max(0, ringAngle - 12)}deg, transparent ${ringAngle}deg)`;

	const wave = interpolate(frame, BUILD.wave, [0, 1], {...clamp, easing: ease});
	const waveMask = `linear-gradient(90deg, #000 ${wave * 118 - 18}%, transparent ${wave * 118}%)`;

	const building = interpolate(frame, BUILD.building, [0, 1], {...clamp, easing: ease});
	const buildingMask = `linear-gradient(0deg, #000 ${building * 125 - 25}%, transparent ${building * 125}%)`;

	return (
		<div style={{position: 'relative', width, height}}>
			<Img src={layer('ring')} style={{...fill, maskImage: ringMask, WebkitMaskImage: ringMask, opacity: ring > 0 ? 1 : 0}} />
			<Img
				src={layer('building')}
				style={{
					...fill,
					maskImage: buildingMask,
					WebkitMaskImage: buildingMask,
					filter: `blur(${(1 - building) * 6}px)`,
					opacity: building > 0 ? 1 : 0,
				}}
			/>
			{/* Bars rise out of the ground line (y = 720 in logo pixels) */}
			<div style={{...fill, clipPath: `inset(0 0 ${(1 - 720 / 850) * 100}% 0)`}}>
				{BUILD.bars.map((start, i) => {
					const s = spring({frame: frame - start, fps, config: {damping: 11, stiffness: 120, mass: 0.8}});
					return (
						<Img
							key={i}
							src={layer(`bar-${i + 1}`)}
							style={{...fill, transform: `translateY(${(1 - s) * height * 0.8}px)`, opacity: frame >= start ? 1 : 0}}
						/>
					);
				})}
			</div>
			<Img
				src={layer('wave')}
				style={{
					...fill,
					maskImage: waveMask,
					WebkitMaskImage: waveMask,
					transform: `translateX(${(1 - wave) * -40}px)`,
					opacity: wave > 0 ? 1 : 0,
				}}
			/>
		</div>
	);
};

// Full logo, used for the shine mask.
export const LOGO_SRC = staticFile('images/quality-day-logo.png');
