import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {BrandBars} from '../components/BrandBars';
import {AccentLine, MaskReveal} from '../components/Reveal';
import {Streaks} from '../components/LightSweep';
import {PromoProps} from '../schema';
import {colors, fonts, gradients} from '../theme';

export const OPENING_DURATION = 150;

export const Opening: React.FC<PromoProps> = ({universityName, universityNameAr}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const drift = interpolate(frame, [0, OPENING_DURATION], [1, 1.06]);
	const tracking = interpolate(frame, [70, 130], [0.2, 0.62], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const glow = spring({frame: frame - 6, fps, config: {damping: 30}});

	return (
		<AbsoluteFill>
			<Backdrop particles={70} />
			<Streaks count={7} />
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'column',
					transform: `scale(${drift})`,
				}}
			>
				<div style={{position: 'relative', marginBottom: 54}}>
					<div
						style={{
							position: 'absolute',
							inset: -120,
							background: `radial-gradient(circle, rgba(61,139,255,${0.45 * glow}) 0%, transparent 60%)`,
						}}
					/>
					<BrandBars height={230} barWidth={50} gap={18} delay={4} />
				</div>
				<MaskReveal delay={30}>
					<div
						style={{
							fontFamily: fonts.arabic,
							fontWeight: 700,
							fontSize: 54,
							color: colors.white,
							direction: 'rtl',
							textAlign: 'center',
						}}
					>
						{universityNameAr}
					</div>
				</MaskReveal>
				<MaskReveal delay={40}>
					<div
						style={{
							fontFamily: fonts.display,
							fontWeight: 500,
							fontSize: 34,
							letterSpacing: '0.08em',
							color: colors.ice,
							textTransform: 'uppercase',
							textAlign: 'center',
							marginTop: 6,
						}}
					>
						{universityName}
					</div>
				</MaskReveal>
				<div style={{margin: '34px 0 26px'}}>
					<AccentLine delay={58} width={420} height={4} background={gradients.orangeText} align="center" />
				</div>
				<div
					style={{
						fontFamily: fonts.display,
						fontWeight: 300,
						fontSize: 30,
						letterSpacing: `${tracking}em`,
						color: colors.amber,
						opacity: interpolate(frame, [70, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
						textTransform: 'uppercase',
						marginRight: `-${tracking}em`,
					}}
				>
					Proudly Presents
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
