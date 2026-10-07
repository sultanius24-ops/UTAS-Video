import React from 'react';
import {AbsoluteFill, Freeze, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {BUILD, LOGO_ASPECT, LOGO_SRC, LogoBuild} from '../components/LogoBuild';
import {AccentLine, LetterCascade, MaskReveal} from '../components/Reveal';
import {WaveRibbons} from '../components/WaveRibbons';
import {LOOP_FRAMES, phase} from '../loop';
import {PromoProps} from '../schema';
import {colors, fonts, gradients} from '../theme';

export const FINALE_DURATION = 330;
export const COMPLETE = BUILD.complete;
const TEXT = COMPLETE + 14;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Layout adapts to landscape (16:9) and portrait (9:16).
const useLayout = () => {
	const {width, height} = useVideoConfig();
	const vertical = height > width;
	const logoW = vertical ? 900 : 780;
	const logoH = logoW * LOGO_ASPECT;
	const cy = vertical ? height * 0.38 : 330;
	return {vertical, logoW, logoH, cy, textTop: cy + logoH / 2 + 40, width, height};
};

// Burst of particles released when the logo completes.
const Burst: React.FC<{cy: number}> = ({cy}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const f = frame - COMPLETE;
	if (f < 0 || f > 50) {
		return null;
	}
	return (
		<svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
			{new Array(46).fill(0).map((_, i) => {
				const angle = random(`a${i}`) * Math.PI * 2;
				const dist = (6 + random(`v${i}`) * 14) * f * (1 - f / 120);
				const x = width / 2 + Math.cos(angle) * (260 + dist);
				const y = cy + Math.sin(angle) * (170 + dist * 0.7);
				return (
					<circle
						key={i}
						cx={x}
						cy={y}
						r={2 + random(`r${i}`) * 4}
						fill={random(`c${i}`) > 0.5 ? colors.orange : colors.royal}
						opacity={interpolate(f, [0, 50], [0.9, 0])}
					/>
				);
			})}
		</svg>
	);
};

const Titles: React.FC<PromoProps & {vertical: boolean}> = ({eventTitle, eventTitleAr, year, universityName, tagline, vertical}) => {
	const frame = useCurrentFrame();
	return (
		<>
			<LetterCascade
				text={`${eventTitle.toUpperCase()} ${year}`}
				delay={TEXT}
				stagger={1.6}
				style={{fontFamily: fonts.display, fontWeight: 900, fontSize: vertical ? 70 : 84, letterSpacing: '0.08em', justifyContent: 'center'}}
				letterStyle={{
					background: `linear-gradient(90deg, ${colors.deep}, ${colors.royal})`,
					WebkitBackgroundClip: 'text',
					backgroundClip: 'text',
					color: 'transparent',
				}}
			/>
			<MaskReveal delay={TEXT + 16}>
				<div style={{fontFamily: fonts.arabic, fontWeight: 800, fontSize: vertical ? 60 : 52, color: colors.orange, direction: 'rtl', textAlign: 'center', lineHeight: 1.3}}>
					{eventTitleAr} {year}
				</div>
			</MaskReveal>
			<div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 14, maxWidth: vertical ? 860 : undefined}}>
				{vertical ? null : <AccentLine delay={TEXT + 28} width={90} height={3} background={gradients.orangeText} />}
				<MaskReveal delay={TEXT + 30}>
					<div
						style={{
							fontFamily: fonts.display,
							fontWeight: 600,
							fontSize: vertical ? 28 : 24,
							lineHeight: 1.4,
							letterSpacing: '0.14em',
							color: colors.ink,
							textTransform: 'uppercase',
							textAlign: 'center',
							maxWidth: vertical ? 700 : undefined,
						}}
					>
						{universityName}
					</div>
				</MaskReveal>
				{vertical ? null : <AccentLine delay={TEXT + 28} width={90} height={3} background={gradients.orangeText} />}
			</div>
			<div
				style={{
					marginTop: 22,
					fontFamily: fonts.display,
					fontWeight: 500,
					fontSize: vertical ? 32 : 28,
					letterSpacing: '0.06em',
					color: colors.royal,
					opacity: interpolate(frame, [TEXT + 50, TEXT + 70], [0, 1], clamp),
				}}
			>
				{tagline}
			</div>
		</>
	);
};

// The logo build and title lock-up. With `hold`, everything is already built and only ambient
// motion plays, repeating seamlessly every `hold` frames (used for the logo loop screen).
export const LogoFinale: React.FC<PromoProps & {hold?: number}> = ({hold, ...props}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {vertical, logoW, logoH, cy, textTop} = useLayout();

	// Ambient motion (background, ribbons, breathing) runs on the loop's clock. In the reveal it is
	// offset so the reveal's last frame is the frame just before the hold loop's first: cutting
	// from the reveal to the loop is invisible.
	const shift = hold ? 0 : LOOP_FRAMES - FINALE_DURATION;
	const settle = hold ? 1 : interpolate(frame, [COMPLETE, COMPLETE + 60], [0, 1], clamp);
	const landed = spring({frame: frame - COMPLETE, fps, config: {damping: 9, stiffness: 140}});
	const bump = hold ? 0 : Math.sin(Math.min(1, landed) * Math.PI) * 0.035;
	const breathe = 1 + bump + settle * (0.02 + Math.sin(phase(frame + shift, 0.6, LOOP_FRAMES)) * 0.012);
	const glow = hold ? 0.25 : interpolate(frame, [COMPLETE - 4, COMPLETE + 6, COMPLETE + 60], [0, 0.7, 0.25], clamp);
	const shineStart = hold ? hold * 0.3 : COMPLETE + 12;
	const sweep = interpolate(frame, [shineStart, shineStart + 42], [-40, 140], clamp);

	const built = (node: React.ReactNode) => (hold ? <Freeze frame={FINALE_DURATION - 1}>{node}</Freeze> : node);

	return (
		<AbsoluteFill>
			<Sequence from={-shift} layout="none">
				<Backdrop variant="light" particles={40} grid={false} loop={LOOP_FRAMES} />
			</Sequence>
			<AbsoluteFill
				style={{background: `radial-gradient(circle at 50% ${cy}px, rgba(61,139,255,${0.25 * glow}) 0%, rgba(255,194,51,${0.18 * glow}) 22%, transparent 45%)`}}
			/>
			{hold ? null : <Burst cy={cy} />}
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: cy,
					width: logoW,
					height: logoH,
					transform: `translate(-50%, -50%) scale(${breathe})`,
					filter: 'drop-shadow(0 24px 40px rgba(21,87,214,0.22))',
				}}
			>
				{built(<LogoBuild width={logoW} />)}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: `linear-gradient(110deg, transparent ${sweep - 14}%, rgba(255,255,255,0.85) ${sweep}%, transparent ${sweep + 14}%)`,
						maskImage: `url(${LOGO_SRC})`,
						WebkitMaskImage: `url(${LOGO_SRC})`,
						maskSize: '100% 100%',
						WebkitMaskSize: '100% 100%',
					}}
				/>
			</div>
			<AbsoluteFill style={{alignItems: 'center', top: textTop, flexDirection: 'column'}}>
				{built(<Titles {...props} vertical={vertical} />)}
			</AbsoluteFill>
			<Sequence from={-shift} layout="none">
				<WaveRibbons reveal={hold ? -100 : COMPLETE - 10 + shift} y={vertical ? 40 : 95} scale={vertical ? 0.9 : 0.7} light loop={LOOP_FRAMES} />
			</Sequence>
		</AbsoluteFill>
	);
};
