import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {AccentLine, MaskReveal} from '../components/Reveal';
import {PromoProps} from '../schema';
import {colors, fonts, gradients} from '../theme';

export const PATRONAGE_DURATION = 240;

// Rotating golden light rays behind the patron's name.
const Rays: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const n = 18;
	const len = Math.hypot(width, height);
	return (
		<svg width={width} height={height} style={{position: 'absolute', inset: 0, opacity: 0.5}}>
			<defs>
				<radialGradient id="ray-fade" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor={colors.amber} stopOpacity={0.35} />
					<stop offset="100%" stopColor={colors.amber} stopOpacity={0} />
				</radialGradient>
			</defs>
			<g transform={`translate(${width / 2} ${height / 2}) rotate(${frame * 0.15})`}>
				{new Array(n).fill(0).map((_, i) => {
					const a = (i / n) * Math.PI * 2;
					const b = a + 0.07;
					return (
						<path
							key={i}
							d={`M0 0 L${Math.cos(a) * len} ${Math.sin(a) * len} L${Math.cos(b) * len} ${Math.sin(b) * len} Z`}
							fill="url(#ray-fade)"
						/>
					);
				})}
			</g>
		</svg>
	);
};

// Ornamental corner brackets that draw themselves around the name card.
const Corners: React.FC<{progress: number; w: number; h: number}> = ({progress, w, h}) => {
	const L = 70 * progress;
	const stroke = {stroke: colors.amber, strokeWidth: 4, fill: 'none', strokeLinecap: 'round' as const};
	return (
		<svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
			<path d={`M0 ${L} L0 0 L${L} 0`} {...stroke} />
			<path d={`M${w - L} 0 L${w} 0 L${w} ${L}`} {...stroke} />
			<path d={`M${w} ${h - L} L${w} ${h} L${w - L} ${h}`} {...stroke} />
			<path d={`M${L} ${h} L0 ${h} L0 ${h - L}`} {...stroke} />
		</svg>
	);
};

export const Patronage: React.FC<PromoProps> = ({sponsorName, sponsorTitle, eventTitle, year}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const corners = spring({frame: frame - 40, fps, config: {damping: 200}, durationInFrames: 40});
	const nameIn = spring({frame: frame - 44, fps, config: {damping: 18}});
	const nameBlur = interpolate(frame, [44, 64], [16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const push = interpolate(frame, [0, PATRONAGE_DURATION], [1, 1.05]);
	const CARD_W = 1360;
	const CARD_H = 300;

	return (
		<AbsoluteFill>
			<Backdrop particles={80} grid={false} accent="gold" />
			<Rays />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', transform: `scale(${push})`}}>
				<MaskReveal delay={6}>
					<div
						style={{
							fontFamily: fonts.display,
							fontWeight: 700,
							fontSize: 28,
							letterSpacing: '0.5em',
							marginRight: '-0.5em',
							color: colors.amber,
							textAlign: 'center',
						}}
					>
						INAUGURATION CEREMONY
					</div>
				</MaskReveal>
				<MaskReveal delay={12}>
					<div style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: 40, color: colors.white, direction: 'rtl', textAlign: 'center', marginTop: 4}}>
						حفل الافتتاح
					</div>
				</MaskReveal>
				<div style={{margin: '26px 0 40px'}}>
					<AccentLine delay={22} width={260} height={3} background={gradients.orangeText} align="center" />
				</div>
				<div style={{position: 'relative', width: CARD_W, height: CARD_H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
					<Corners progress={corners} w={CARD_W} h={CARD_H} />
					<div
						style={{
							display: 'flex',
							alignItems: 'baseline',
							gap: 22,
							fontFamily: fonts.display,
							fontWeight: 500,
							fontSize: 32,
							color: colors.ice,
							letterSpacing: '0.06em',
							opacity: interpolate(frame, [30, 46], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
						}}
					>
						<span>Under the Patronage of</span>
						<span style={{fontFamily: fonts.arabic, fontWeight: 700, color: colors.amber}}>تحت رعاية</span>
					</div>
					<div
						style={{
							fontFamily: fonts.display,
							fontWeight: 800,
							fontSize: sponsorName.length > 40 ? 54 : sponsorName.length > 26 ? 66 : 80,
							maxWidth: CARD_W - 120,
							lineHeight: 1.15,
							color: colors.white,
							marginTop: 14,
							textAlign: 'center',
							transform: `scale(${0.85 + 0.15 * nameIn})`,
							opacity: nameIn,
							filter: `blur(${nameBlur}px)`,
							textShadow: '0 0 40px rgba(255,194,51,0.35)',
						}}
					>
						{sponsorName}
					</div>
					<div
						style={{
							fontFamily: fonts.display,
							fontWeight: 500,
							fontSize: 26,
							letterSpacing: '0.24em',
							textTransform: 'uppercase',
							color: colors.amber,
							marginTop: 12,
							opacity: interpolate(frame, [64, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
						}}
					>
						{sponsorTitle}
					</div>
				</div>
				<div
					style={{
						marginTop: 64,
						fontFamily: fonts.display,
						fontWeight: 300,
						fontSize: 34,
						color: colors.white,
						letterSpacing: '0.04em',
						opacity: interpolate(frame, [90, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
						transform: `translateY(${interpolate(frame, [90, 110], [20, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`,
					}}
				>
					Welcome to the <b style={{fontWeight: 800}}>{eventTitle} {year}</b> celebration
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
