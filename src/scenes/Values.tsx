import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {KenBurns} from '../components/KenBurns';
import {LightSweep} from '../components/LightSweep';
import {MaskReveal} from '../components/Reveal';
import {PromoProps} from '../schema';
import {colors, fonts, gradients} from '../theme';

export const VALUES_DURATION = 200;

const Icon: React.FC<{kind: 'star' | 'bulb' | 'cycle'}> = ({kind}) => {
	const common = {stroke: 'white', strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	return (
		<svg width={34} height={34} viewBox="0 0 24 24">
			{kind === 'star' ? <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" {...common} /> : null}
			{kind === 'bulb' ? (
				<>
					<path d="M9 18h6M10 21h4" {...common} />
					<path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3z" {...common} />
				</>
			) : null}
			{kind === 'cycle' ? (
				<>
					<path d="M20 11a8 8 0 00-14.3-4.9L4 8" {...common} />
					<path d="M4 3v5h5" {...common} />
					<path d="M4 13a8 8 0 0014.3 4.9L20 16" {...common} />
					<path d="M20 21v-5h-5" {...common} />
				</>
			) : null}
		</svg>
	);
};

// Scene frames where each value appears, matched to the narration.
export const VALUE_CUES = [96, 124, 152];

const VALUES: {label: string; icon: 'star' | 'bulb' | 'cycle'}[] = [
	{label: 'Excellence', icon: 'star'},
	{label: 'Innovation', icon: 'bulb'},
	{label: 'Continuous Improvement', icon: 'cycle'},
];

export const Values: React.FC<PromoProps> = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const open = interpolate(frame, [0, 34], [0, 1], {
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.65, 0, 0.35, 1),
	});
	// Diagonal panel that slides open to reveal the campus photo.
	const leftEdge = 100 - 54 * open;
	const clip = `polygon(${leftEdge + 6}% 0, 100% 0, 100% 100%, ${leftEdge - 6}% 100%)`;

	return (
		<AbsoluteFill>
			<Backdrop particles={40} grid={false} />
			<AbsoluteFill style={{clipPath: clip}}>
				<KenBurns src={staticFile('images/campus-palms.jpg')} from={1.12} to={1.02} panX={[-30, 20]} origin="40% 50%" />
				<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(3,12,43,0.55) 0%, transparent 35%)'}} />
				<LightSweep start={40} duration={36} opacity={0.6} />
			</AbsoluteFill>
			{/* Accent edge following the diagonal */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: `${leftEdge - 6}%`,
					width: '12%',
					clipPath: 'polygon(calc(50% + 0px) 0, calc(50% + 14px) 0, calc(0% + 14px) 100%, 0% 100%)',
					background: gradients.orange,
					opacity: open,
					transform: 'translateX(-8px)',
				}}
			/>
			<AbsoluteFill style={{padding: '0 150px', justifyContent: 'center', width: '50%'}}>
				<MaskReveal delay={16}>
					<div style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 26, letterSpacing: '0.4em', color: colors.amber}}>
						OUR COMMITMENT
					</div>
				</MaskReveal>
				<MaskReveal delay={24}>
					<div style={{fontFamily: fonts.display, fontWeight: 800, fontSize: 80, lineHeight: 1.06, color: colors.white, marginTop: 16}}>
						Building a
					</div>
				</MaskReveal>
				<MaskReveal delay={31}>
					<div style={{fontFamily: fonts.display, fontWeight: 800, fontSize: 80, lineHeight: 1.06, color: colors.white}}>
						Culture of{' '}
						<span
							style={{
								background: gradients.orangeText,
								WebkitBackgroundClip: 'text',
								backgroundClip: 'text',
								color: 'transparent',
							}}
						>
							Quality
						</span>
					</div>
				</MaskReveal>
				<div style={{display: 'flex', flexDirection: 'column', gap: 20, marginTop: 50}}>
					{VALUES.map((v, i) => {
						const p = spring({frame: frame - VALUE_CUES[i], fps, config: {damping: 15}});
						return (
							<div
								key={v.label}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 22,
									opacity: p,
									transform: `translateX(${(1 - p) * -60}px)`,
								}}
							>
								<div
									style={{
										width: 66,
										height: 66,
										borderRadius: 18,
										background: i === 2 ? gradients.orange : gradients.blue,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
									}}
								>
									<Icon kind={v.icon} />
								</div>
								<div style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 34, color: colors.white}}>{v.label}</div>
							</div>
						);
					})}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
