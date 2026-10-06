import React from 'react';
import {AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {KenBurns} from '../components/KenBurns';
import {AccentLine, LetterCascade, MaskReveal} from '../components/Reveal';
import {Streaks} from '../components/LightSweep';
import {WaveRibbons} from '../components/WaveRibbons';
import {PromoProps} from '../schema';
import {colors, fonts, gradients} from '../theme';

export const TITLE_DURATION = 180;

export const TitleReveal: React.FC<PromoProps> = ({eventTitle, eventTitleAr, year}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const [first, ...rest] = eventTitle.toUpperCase().split(' ');
	const second = rest.join(' ');
	const pill = spring({frame: frame - 8, fps, config: {damping: 14}});
	const shade = interpolate(frame, [0, 25], [0.2, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: colors.night}}>
			<KenBurns src={staticFile('images/campus-front.jpg')} from={1.04} to={1.18} panX={[60, -40]} origin="60% 40%" />
			<AbsoluteFill
				style={{
					opacity: shade,
					background: `linear-gradient(90deg, rgba(3,12,43,0.94) 0%, rgba(6,26,77,0.82) 38%, rgba(6,26,77,0.25) 70%, rgba(6,26,77,0.05) 100%)`,
				}}
			/>
			<AbsoluteFill
				style={{background: 'linear-gradient(180deg, rgba(3,12,43,0.35) 0%, transparent 30%, transparent 60%, rgba(3,12,43,0.85) 100%)'}}
			/>
			<Streaks count={5} color="#FFD27A" seed={3} />
			<AbsoluteFill style={{padding: '0 150px', justifyContent: 'center'}}>
				<div style={{marginTop: -120}}>
					<div
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 14,
							padding: '10px 26px',
							borderRadius: 40,
							border: `2px solid rgba(255,194,51,0.7)`,
							background: 'rgba(255,194,51,0.12)',
							color: colors.amber,
							fontFamily: fonts.display,
							fontWeight: 700,
							fontSize: 26,
							letterSpacing: '0.3em',
							transform: `translateX(${(1 - pill) * -80}px)`,
							opacity: pill,
							marginBottom: 26,
						}}
					>
						<span style={{width: 10, height: 10, borderRadius: 10, background: colors.orange}} />
						UTAS · {year}
					</div>
					<LetterCascade
						text={first}
						delay={14}
						style={{
							fontFamily: fonts.display,
							fontWeight: 900,
							fontSize: 200,
							lineHeight: 0.95,
							color: colors.white,
							letterSpacing: '0.02em',
							textShadow: '0 20px 60px rgba(0,0,0,0.45)',
						}}
					/>
					<LetterCascade
						text={second}
						delay={34}
						style={{
							fontFamily: fonts.display,
							fontWeight: 900,
							fontSize: 200,
							lineHeight: 0.95,
							letterSpacing: '0.02em',
						}}
						letterStyle={{
							background: gradients.orangeText,
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
						}}
					/>
					<div style={{display: 'flex', alignItems: 'center', gap: 34, marginTop: 22}}>
						<AccentLine delay={52} width={180} height={6} background={gradients.orangeText} />
						<MaskReveal delay={58}>
							<div style={{fontFamily: fonts.arabic, fontWeight: 800, fontSize: 76, color: colors.white, direction: 'rtl'}}>
								{eventTitleAr}
							</div>
						</MaskReveal>
					</div>
				</div>
			</AbsoluteFill>
			<WaveRibbons reveal={20} y={60} scale={0.9} />
		</AbsoluteFill>
	);
};
