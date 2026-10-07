import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {QualityDayPromo} from './QualityDayPromo';
import {LogoFinale} from './scenes/LogoFinale';
import {Standby} from './scenes/Standby';
import {LOOP_FRAMES, PROMO_DURATION} from './timeline';
import {defaultPromoProps, promoSchema, PromoProps} from './schema';

const StandbyLoop: React.FC<PromoProps> = (props) => <Standby {...props} loop={LOOP_FRAMES} />;
const LogoLoop: React.FC<PromoProps> = (props) => <LogoFinale {...props} hold={LOOP_FRAMES} />;

const common = {fps: 30, schema: promoSchema, defaultProps: defaultPromoProps};

// Ceremony package, in running order:
// 1. Standby (loop) -> 2. Countdown + logo build -> 3. Logo hold (loop). Plus a vertical cut for social media.
export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="Standby" component={StandbyLoop} durationInFrames={LOOP_FRAMES} width={1920} height={1080} {...common} />
			<Composition id="CountdownReveal" component={QualityDayPromo} durationInFrames={PROMO_DURATION} width={1920} height={1080} {...common} />
			<Composition id="LogoLoop" component={LogoLoop} durationInFrames={LOOP_FRAMES} width={1920} height={1080} {...common} />
			<Composition id="CountdownRevealVertical" component={QualityDayPromo} durationInFrames={PROMO_DURATION} width={1080} height={1920} {...common} />
		</>
	);
};
