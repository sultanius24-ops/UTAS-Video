import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {MaskReveal} from '../components/Reveal';
import {PromoProps} from '../schema';
import {colors, fonts, gradients} from '../theme';

export const JOURNEY_DURATION = 240;

const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const MILESTONES = ['Planning', 'Teamwork', 'Preparation', 'Refinement'];

const RING = 440;
const STROKE = 18;

const Ring: React.FC<{progress: number}> = ({progress}) => {
	const r = (RING - STROKE) / 2;
	const c = 2 * Math.PI * r;
	const pad = 60;
	const size = RING + pad * 2;
	return (
		<svg
			width={size}
			height={size}
			viewBox={`${-pad} ${-pad} ${size} ${size}`}
			style={{position: 'absolute', left: -pad, top: -pad, transform: 'rotate(-90deg)', overflow: 'visible'}}
		>
			<defs>
				<linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor={colors.amber} />
					<stop offset="50%" stopColor={colors.orange} />
					<stop offset="100%" stopColor={colors.sky} />
				</linearGradient>
			</defs>
			<circle cx={RING / 2} cy={RING / 2} r={r} stroke="rgba(191,216,255,0.14)" strokeWidth={STROKE} fill="none" />
			<circle
				cx={RING / 2}
				cy={RING / 2}
				r={r}
				stroke="url(#ring-grad)"
				strokeWidth={STROKE}
				strokeLinecap="round"
				fill="none"
				strokeDasharray={c}
				strokeDashoffset={c * (1 - progress)}
				style={{filter: 'drop-shadow(0 0 18px rgba(247,132,30,0.6))'}}
			/>
		</svg>
	);
};

export const Journey: React.FC<PromoProps> = ({monthsOfWork, eventTitle}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const days = monthsOfWork * 30;
	const weeks = monthsOfWork * 4;
	const monthsWord = WORDS[monthsOfWork] ?? String(monthsOfWork);

	const count = interpolate(frame, [18, 120], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.22, 1, 0.36, 1),
	});
	const ringIn = spring({frame: frame - 6, fps, config: {damping: 16}});
	const track = interpolate(frame, [60, 200], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.cubic),
	});
	const steps = [...MILESTONES, eventTitle];

	const stats = [
		{value: String(weeks), label: 'Weeks of planning & preparation'},
		{value: '1', label: 'Team united by one vision'},
		{value: '100%', label: 'Commitment to excellence'},
	];

	return (
		<AbsoluteFill>
			<Backdrop particles={50} />
			<AbsoluteFill style={{padding: '110px 150px 0', flexDirection: 'row', alignItems: 'flex-start', gap: 120}}>
				<div
					style={{
						position: 'relative',
						width: RING,
						height: RING,
						flexShrink: 0,
						transform: `scale(${0.7 + 0.3 * ringIn}) rotate(${(1 - ringIn) * -40}deg)`,
						opacity: ringIn,
					}}
				>
					<Ring progress={count} />
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<div
							style={{
								fontFamily: fonts.display,
								fontWeight: 900,
								fontSize: 170,
								lineHeight: 1,
								background: gradients.orangeText,
								WebkitBackgroundClip: 'text',
								backgroundClip: 'text',
								color: 'transparent',
								fontVariantNumeric: 'tabular-nums',
							}}
						>
							{Math.round(days * count)}
						</div>
						<div
							style={{
								fontFamily: fonts.display,
								fontWeight: 700,
								fontSize: 30,
								letterSpacing: '0.35em',
								color: colors.ice,
								marginTop: 6,
								marginRight: '-0.35em',
							}}
						>
							DAYS
						</div>
					</div>
				</div>
				<div style={{paddingTop: 20}}>
					<MaskReveal delay={10}>
						<div style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 26, letterSpacing: '0.4em', color: colors.amber}}>
							THE JOURNEY
						</div>
					</MaskReveal>
					<MaskReveal delay={18}>
						<div style={{fontFamily: fonts.display, fontWeight: 800, fontSize: 86, lineHeight: 1.05, color: colors.white, marginTop: 14}}>
							{monthsWord} Months
						</div>
					</MaskReveal>
					<MaskReveal delay={26}>
						<div
							style={{
								fontFamily: fonts.display,
								fontWeight: 800,
								fontSize: 86,
								lineHeight: 1.05,
								background: gradients.blueText,
								WebkitBackgroundClip: 'text',
								backgroundClip: 'text',
								color: 'transparent',
							}}
						>
							in the Making
						</div>
					</MaskReveal>
					<div style={{display: 'flex', gap: 56, marginTop: 44}}>
						{stats.map((s, i) => {
							const p = spring({frame: frame - 50 - i * 10, fps, config: {damping: 15}});
							return (
								<div key={s.label} style={{opacity: p, transform: `translateY(${(1 - p) * 40}px)`, maxWidth: 260}}>
									<div style={{fontFamily: fonts.display, fontWeight: 800, fontSize: 58, color: colors.white}}>{s.value}</div>
									<div style={{width: 46, height: 4, borderRadius: 4, background: gradients.orangeText, margin: '8px 0 12px'}} />
									<div style={{fontFamily: fonts.display, fontWeight: 500, fontSize: 22, color: colors.ice, lineHeight: 1.35}}>
										{s.label}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</AbsoluteFill>

			{/* Timeline */}
			<div style={{position: 'absolute', left: 150, right: 150, bottom: 150, height: 120}}>
				<div style={{position: 'absolute', top: 22, left: 0, right: 0, height: 6, borderRadius: 6, background: 'rgba(191,216,255,0.14)'}} />
				<div
					style={{
						position: 'absolute',
						top: 22,
						left: 0,
						width: `${track * 100}%`,
						height: 6,
						borderRadius: 6,
						background: `linear-gradient(90deg, ${colors.sky}, ${colors.orange})`,
						boxShadow: '0 0 24px rgba(247,132,30,0.7)',
					}}
				/>
				{steps.map((label, i) => {
					const at = i / (steps.length - 1);
					const reached = track >= at - 0.001;
					const pop = spring({
						frame: frame - (60 + at * 140),
						fps,
						config: {damping: 10, stiffness: 160},
					});
					const last = i === steps.length - 1;
					return (
						<div
							key={label}
							style={{
								position: 'absolute',
								left: `${at * 100}%`,
								top: 0,
								transform: 'translateX(-50%)',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								width: 260,
							}}
						>
							<div
								style={{
									width: 50,
									height: 50,
									borderRadius: 50,
									border: `4px solid ${reached ? (last ? colors.amber : colors.sky) : 'rgba(191,216,255,0.3)'}`,
									background: reached ? (last ? gradients.orange : colors.royal) : colors.navy,
									transform: `scale(${0.6 + 0.4 * Math.min(1, pop) + (reached ? 0.08 * Math.sin(Math.min(1, pop) * Math.PI) : 0)})`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									boxShadow: reached ? `0 0 26px ${last ? 'rgba(255,194,51,0.8)' : 'rgba(61,139,255,0.7)'}` : 'none',
								}}
							>
								{reached ? (
									<svg width={22} height={22} viewBox="0 0 24 24">
										<path d="M4 12.5l5 5L20 6.5" stroke="white" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								) : null}
							</div>
							<div
								style={{
									marginTop: 16,
									fontFamily: fonts.display,
									fontWeight: last ? 800 : 600,
									fontSize: last ? 26 : 22,
									letterSpacing: '0.08em',
									textTransform: 'uppercase',
									color: reached ? (last ? colors.amber : colors.white) : 'rgba(191,216,255,0.45)',
								}}
							>
								{label}
							</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
