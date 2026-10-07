import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {AccentLine, LetterCascade, MaskReveal} from '../components/Reveal';
import {WaveRibbons} from '../components/WaveRibbons';
import {PromoProps} from '../schema';
import {colors, fonts, gradients} from '../theme';

export const FINALE_DURATION = 300;

const LOGO = staticFile('images/quality-day-logo.png');
const LOGO_W = 780;
const LOGO_H = Math.round((LOGO_W * 850) / 1328);
export const POP = 26;

// Two satin arcs (blue + orange) that whip around and "draw" the logo into place.
const Swooshes: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const draw = interpolate(frame, [0, POP + 4], [0, 1], {extrapolateRight: 'clamp'});
	const fade = interpolate(frame, [POP, POP + 22], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const grow = interpolate(frame, [POP - 6, POP + 22], [1, 1.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const cx = width / 2;
	const cy = 330;
	const arcs = [
		{r: 300, color: colors.royal, w: 34, rot: -40, dir: 1},
		{r: 360, color: colors.orange, w: 22, rot: 140, dir: -1},
		{r: 250, color: colors.sky, w: 14, rot: 60, dir: 1},
	];
	return (
		<svg width={width} height={height} style={{position: 'absolute', inset: 0, opacity: fade}}>
			{arcs.map((a, i) => {
				const c = 2 * Math.PI * a.r;
				return (
					<circle
						key={i}
						cx={cx}
						cy={cy}
						r={a.r * grow}
						fill="none"
						stroke={a.color}
						strokeWidth={a.w}
						strokeLinecap="round"
						strokeDasharray={`${c * 0.62 * draw} ${c * 2}`}
						transform={`rotate(${a.rot + a.dir * frame * 6} ${cx} ${cy})`}
					/>
				);
			})}
		</svg>
	);
};

// Burst of particles released at the moment the logo lands.
const Burst: React.FC = () => {
	const frame = useCurrentFrame();
	const {width} = useVideoConfig();
	const f = frame - POP;
	if (f < 0 || f > 50) {
		return null;
	}
	return (
		<svg width={width} height={1080} style={{position: 'absolute', inset: 0}}>
			{new Array(46).fill(0).map((_, i) => {
				const angle = random(`a${i}`) * Math.PI * 2;
				const speed = 6 + random(`v${i}`) * 14;
				const dist = speed * f * (1 - f / 120);
				const x = width / 2 + Math.cos(angle) * (260 + dist);
				const y = 330 + Math.sin(angle) * (170 + dist * 0.7);
				const warm = random(`c${i}`) > 0.5;
				return (
					<circle
						key={i}
						cx={x}
						cy={y}
						r={2 + random(`r${i}`) * 4}
						fill={warm ? colors.orange : colors.royal}
						opacity={interpolate(f, [0, 50], [0.9, 0])}
					/>
				);
			})}
		</svg>
	);
};

export const LogoFinale: React.FC<PromoProps> = ({eventTitle, eventTitleAr, year, universityName, tagline}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const logoIn = spring({frame: frame - POP + 8, fps, config: {damping: 12, mass: 0.9, stiffness: 110}});
	const logoBlur = interpolate(frame, [POP - 8, POP + 10], [24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const breathe = 1 + Math.sin(frame / 30) * 0.008 + interpolate(frame, [POP, FINALE_DURATION], [0, 0.04], {extrapolateLeft: 'clamp'});
	const flash = interpolate(frame, [POP - 2, POP + 2, POP + 18], [0, 0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const sweep = interpolate(frame, [POP + 40, POP + 80], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const titleText = `${eventTitle.toUpperCase()} ${year}`;

	return (
		<AbsoluteFill>
			<Backdrop variant="light" particles={40} grid={false} />
			<Swooshes />
			<Burst />
			{/* Logo with glow, landing pop and a masked shine */}
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: 330,
					width: LOGO_W,
					height: LOGO_H,
					transform: `translate(-50%, -50%) scale(${(0.55 + 0.45 * logoIn) * breathe})`,
					opacity: Math.min(1, logoIn * 1.4),
					filter: `blur(${logoBlur}px) drop-shadow(0 24px 40px rgba(21,87,214,0.25))`,
				}}
			>
				<Img src={LOGO} style={{width: '100%', height: '100%'}} />
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: `linear-gradient(110deg, transparent ${sweep - 14}%, rgba(255,255,255,0.85) ${sweep}%, transparent ${sweep + 14}%)`,
						maskImage: `url(${LOGO})`,
						WebkitMaskImage: `url(${LOGO})`,
						maskSize: '100% 100%',
						WebkitMaskSize: '100% 100%',
					}}
				/>
			</div>
			<AbsoluteFill style={{alignItems: 'center', top: 620, flexDirection: 'column'}}>
				<LetterCascade
					text={titleText}
					delay={POP + 22}
					stagger={1.6}
					style={{
						fontFamily: fonts.display,
						fontWeight: 900,
						fontSize: 84,
						letterSpacing: '0.08em',
						color: colors.deep,
						justifyContent: 'center',
					}}
					letterStyle={{
						background: `linear-gradient(90deg, ${colors.deep}, ${colors.royal})`,
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						color: 'transparent',
					}}
				/>
				<MaskReveal delay={POP + 40}>
					<div style={{fontFamily: fonts.arabic, fontWeight: 800, fontSize: 52, color: colors.orange, direction: 'rtl', textAlign: 'center', lineHeight: 1.3}}>
						{eventTitleAr} {year}
					</div>
				</MaskReveal>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 14}}>
					<AccentLine delay={POP + 52} width={90} height={3} background={gradients.orangeText} />
					<MaskReveal delay={POP + 54}>
						<div style={{fontFamily: fonts.display, fontWeight: 600, fontSize: 24, letterSpacing: '0.14em', color: colors.ink, textTransform: 'uppercase'}}>
							{universityName}
						</div>
					</MaskReveal>
					<AccentLine delay={POP + 52} width={90} height={3} background={gradients.orangeText} />
				</div>
				<div
					style={{
						marginTop: 22,
						fontFamily: fonts.display,
						fontWeight: 500,
						fontStyle: 'normal',
						fontSize: 28,
						letterSpacing: '0.06em',
						color: colors.royal,
						opacity: interpolate(frame, [POP + 74, POP + 94], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
					}}
				>
					{tagline}
				</div>
			</AbsoluteFill>
			<WaveRibbons reveal={POP + 30} y={95} scale={0.7} light />
			<AbsoluteFill style={{background: colors.white, opacity: flash, pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};
