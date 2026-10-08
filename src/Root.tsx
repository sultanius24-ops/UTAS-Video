import React from 'react';
import {Composition, Folder} from 'remotion';
import './fonts';
import {QualityDayPromo} from './QualityDayPromo';
import {EveryPointCounts} from './EveryPointCounts';
import {GoldenUnveilVideo} from './GoldenUnveilVideo';
import {DURATION as GOLD_DURATION} from './gold/timing';
import {DURATION as PARTICLE_DURATION} from './particles/timing';
import {LogoFinale} from './scenes/LogoFinale';
import {Standby} from './scenes/Standby';
import {LOOP_FRAMES, PROMO_DURATION} from './timeline';
import {defaultPromoProps, promoSchema, PromoProps} from './schema';

const StandbyLoop: React.FC<PromoProps> = (props) => <Standby {...props} loop={LOOP_FRAMES} />;
const LogoLoop: React.FC<PromoProps> = (props) => <LogoFinale {...props} hold={LOOP_FRAMES} />;

const common = {fps: 30, schema: promoSchema, defaultProps: defaultPromoProps};

export const RemotionRoot: React.FC = () => {
	return (
		<>
			{/* Current: gold light traces the campus building, countdown top-left, logo rises beside the flag. */}
			<Composition id="GoldenUnveil" component={GoldenUnveilVideo} durationInFrames={GOLD_DURATION} width={1920} height={1080} {...common} />
			{/* Earlier concept: thousands of points form the countdown, then gather into the logo. */}
			<Folder name="Every-Point-Counts">
				<Composition id="EveryPointCounts" component={EveryPointCounts} durationInFrames={PARTICLE_DURATION} width={1920} height={1080} {...common} />
				<Composition id="EveryPointCountsVertical" component={EveryPointCounts} durationInFrames={PARTICLE_DURATION} width={1080} height={1920} {...common} />
			</Folder>
			{/* Previous concept: ring countdown, logo builds from its parts, standby/hold loops. */}
			<Folder name="Previous-concept">
				<Composition id="Standby" component={StandbyLoop} durationInFrames={LOOP_FRAMES} width={1920} height={1080} {...common} />
				<Composition id="CountdownReveal" component={QualityDayPromo} durationInFrames={PROMO_DURATION} width={1920} height={1080} {...common} />
				<Composition id="LogoLoop" component={LogoLoop} durationInFrames={LOOP_FRAMES} width={1920} height={1080} {...common} />
				<Composition id="CountdownRevealVertical" component={QualityDayPromo} durationInFrames={PROMO_DURATION} width={1080} height={1920} {...common} />
			</Folder>
		</>
	);
};
