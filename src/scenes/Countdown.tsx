import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {MaskReveal} from '../components/Reveal';
import {PromoProps} from '../schema';
import {colors, fonts} from '../theme';

export const COUNT_FROM = 10;
export const STEP = 30; // one number per second
export const INTRO = 30; // ring and titles settle before the first number
export const FINAL_STRETCH = 3; // the last numbers turn orange and intensify
export const COUNTDOWN_END = INTRO + COUNT_FROM * STEP;
// Extra frames after "1" that overlap with the flash into the logo.
export const COUNTDOWN_DURATION = COUNTDOWN_END + 24;

const RING = 620;
const R = 270;
const C = 2 * Math.PI * R;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Countdown: React.FC<PromoProps> = ({kicker, kickerAr, eventTitle, year}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const vertical = height > width;
	// Titles sit just above and below the ring in portrait; at the frame edges in landscape.
	const edge = vertical ? height / 2 - RING / 2 - 230 : 70;

	const t = frame - INTRO;
	const idx = Math.min(COUNT_FROM - 1, Math.max(0, Math.floor(t / STEP)));
	const n = COUNT_FROM - idx;
	const local = t - idx * STEP;
	const started = t >= 0;
	const done = frame >= COUNTDOWN_END;
	const final = n <= FINAL_STRETCH;

	// Number entrance (punch in from large + blur) and exit (shrink away).
	const enter = spring({frame: local, fps, config: {damping: 14, stiffness: 160, mass: 0.8}});
	const exit = interpolate(local, [STEP - 7, STEP], [0, 1], clamp);
	const numScale = (1.45 - 0.45 * enter) * (1 - 0.25 * exit);
	const numBlur = interpolate(local, [0, 8], [16, 0], clamp) + exit * 10;
	const numOpacity = started && !done ? Math.min(1, local / 4) * (1 - exit) : 0;

	// Shockwave ring released on every tick.
	const wave = interpolate(local, [0, 22], [0, 1], clamp);

	const ringIn = spring({frame: frame - 2, fps, config: {damping: 200}, durationInFrames: 26});
	const sweep = started ? Math.min(1, local / STEP) : 0;
	const accent = final ? colors.orange : colors.sky;
	const stretch = interpolate(frame, [COUNTDOWN_END - FINAL_STRETCH * STEP, COUNTDOWN_END], [0, 1], clamp);
	const shake = final && started ? Math.sin(frame * 2.3) * 4 * Math.exp(-local / 6) : 0;
	const camera = 1 + 0.08 * stretch + 0.015 * Math.exp(-local / 5) * (started ? 1 : 0);
	const textIn = interpolate(frame, [4, 26], [0, 1], clamp);
	const textOut = interpolate(frame, [COUNTDOWN_END - 10, COUNTDOWN_END + 6], [1, 0], clamp);
	// After "1" the ring rushes outwards into the white flash.
	const warp = interpolate(frame, [COUNTDOWN_END - 4, COUNTDOWN_END + 18], [0, 1], {...clamp, easing: (x) => x * x});
	const ringOpacity = ringIn * (1 - warp * 0.6);

	return (
		<AbsoluteFill>
			<Backdrop particles={70} accent={final ? 'gold' : 'blue'} />
			{/* Warm glow builds through the final seconds */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% 50%, rgba(247,132,30,${0.32 * stretch}) 0%, transparent 55%)`,
				}}
			/>
			<AbsoluteFill style={{transform: `scale(${camera}) translateX(${shake}px)`}}>
				{/* Ring system */}
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						width: RING,
						height: RING,
						transform: `translate(-50%, -50%) scale(${(0.8 + 0.2 * ringIn) * (1 + warp * 2.6)}) rotate(${(1 - ringIn) * -90 + warp * 40}deg)`,
						opacity: ringOpacity,
					}}
				>
					<svg width={RING} height={RING} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
						<defs>
							<linearGradient id="cd-sweep" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0%" stopColor={final ? colors.amber : colors.sky} />
								<stop offset="100%" stopColor={final ? colors.orange : colors.royal} />
							</linearGradient>
						</defs>
						{/* Shockwave */}
						{started && !done ? (
							<circle
								cx={RING / 2}
								cy={RING / 2}
								r={R + wave * 200}
								fill="none"
								stroke={accent}
								strokeWidth={6 * (1 - wave) + 1}
								opacity={(1 - wave) * (final ? 0.8 : 0.5)}
							/>
						) : null}
						{/* Track + per-second sweep */}
						<circle cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke="rgba(191,216,255,0.14)" strokeWidth={14} />
						<circle
							cx={RING / 2}
							cy={RING / 2}
							r={R}
							fill="none"
							stroke="url(#cd-sweep)"
							strokeWidth={14}
							strokeLinecap="round"
							strokeDasharray={C}
							strokeDashoffset={C * (1 - sweep)}
							transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
							style={{filter: `drop-shadow(0 0 16px ${final ? 'rgba(247,132,30,0.9)' : 'rgba(61,139,255,0.8)'})`}}
						/>
						{/* Outer segments: one per second, each lights up once that second has passed */}
						{new Array(COUNT_FROM).fill(0).map((_, i) => {
							const gap = 0.05;
							const a0 = (i / COUNT_FROM + gap / 2) * Math.PI * 2 - Math.PI / 2;
							const a1 = ((i + 1) / COUNT_FROM - gap / 2) * Math.PI * 2 - Math.PI / 2;
							const ro = R + 44;
							const lit = started && (i < idx || done);
							const current = started && !done && i === idx;
							const segFinal = COUNT_FROM - i <= FINAL_STRETCH;
							return (
								<path
									key={i}
									d={`M ${RING / 2 + Math.cos(a0) * ro} ${RING / 2 + Math.sin(a0) * ro} A ${ro} ${ro} 0 0 1 ${RING / 2 + Math.cos(a1) * ro} ${RING / 2 + Math.sin(a1) * ro}`}
									fill="none"
									strokeWidth={8}
									strokeLinecap="round"
									stroke={lit || current ? (segFinal ? colors.orange : colors.sky) : 'rgba(191,216,255,0.18)'}
									opacity={current ? 0.5 + 0.5 * sweep : 1}
								/>
							);
						})}
					</svg>
					{/* The number: SVG text with a gradient fill (CSS background-clip text breaks under filters in Chromium) */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							transform: `scale(${numScale})`,
							filter: `blur(${numBlur}px) drop-shadow(0 0 40px ${final ? 'rgba(247,132,30,0.55)' : 'rgba(61,139,255,0.45)'})`,
							opacity: numOpacity,
						}}
					>
						<svg width={RING} height={RING} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
							<defs>
								<linearGradient id="cd-num" x1="0" y1="0" x2={final ? 1 : 0} y2={final ? 0 : 1}>
									<stop offset="0%" stopColor={final ? colors.amber : colors.white} />
									<stop offset="100%" stopColor={final ? colors.orange : colors.ice} />
								</linearGradient>
							</defs>
							<text
								x={RING / 2}
								y={RING / 2}
								textAnchor="middle"
								dominantBaseline="central"
								fill="url(#cd-num)"
								style={{
									fontFamily: fonts.display,
									fontWeight: 900,
									fontSize: n >= 10 ? 300 : 360,
									letterSpacing: '-0.02em',
									fontVariantNumeric: 'tabular-nums',
								}}
							>
								{n}
							</text>
						</svg>
					</div>
				</div>

				{/* Titles */}
				<AbsoluteFill style={{alignItems: 'center', paddingTop: edge, opacity: textIn * textOut}}>
					<MaskReveal delay={6}>
						<div
							style={{
								fontFamily: fonts.display,
								fontWeight: 700,
								fontSize: 30,
								letterSpacing: '0.45em',
								marginRight: '-0.45em',
								textTransform: 'uppercase',
								color: colors.amber,
								textAlign: 'center',
							}}
						>
							{kicker}
						</div>
					</MaskReveal>
					<MaskReveal delay={12}>
						<div style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: 44, color: colors.white, direction: 'rtl', textAlign: 'center', marginTop: 4}}>
							{kickerAr}
						</div>
					</MaskReveal>
				</AbsoluteFill>
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: vertical ? edge + 60 : 80, opacity: textIn * textOut}}>
					<MaskReveal delay={16}>
						<div
							style={{
								fontFamily: fonts.display,
								fontWeight: 300,
								fontSize: 30,
								letterSpacing: '0.5em',
								marginRight: '-0.5em',
								color: colors.ice,
								textTransform: 'uppercase',
							}}
						>
							{eventTitle} <b style={{fontWeight: 800, color: colors.white}}>{year}</b>
						</div>
					</MaskReveal>
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
