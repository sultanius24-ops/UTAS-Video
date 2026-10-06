import React from 'react';
import {AbsoluteFill} from 'remotion';
import {linearTiming, springTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {Opening} from './scenes/Opening';
import {TitleReveal} from './scenes/TitleReveal';
import {Journey} from './scenes/Journey';
import {Values} from './scenes/Values';
import {Patronage} from './scenes/Patronage';
import {LogoFinale} from './scenes/LogoFinale';
import {flashThrough, zoomThrough} from './transitions';
import {FINALE_DURATION, JOURNEY_DURATION, OPENING_DURATION, PATRONAGE_DURATION, T, TITLE_DURATION, VALUES_DURATION} from './timeline';
import {Soundtrack} from './audio/Soundtrack';
import {PromoProps} from './schema';
import {colors} from './theme';

export const QualityDayPromo: React.FC<PromoProps> = (props) => {
	return (
		<AbsoluteFill style={{backgroundColor: colors.night}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={OPENING_DURATION}>
					<Opening {...props} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={zoomThrough()} timing={linearTiming({durationInFrames: T.toTitle})} />
				<TransitionSeries.Sequence durationInFrames={TITLE_DURATION}>
					<TitleReveal {...props} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={wipe({direction: 'from-right'})}
					timing={springTiming({config: {damping: 200}, durationInFrames: T.toJourney})}
				/>
				<TransitionSeries.Sequence durationInFrames={JOURNEY_DURATION}>
					<Journey {...props} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={slide({direction: 'from-bottom'})}
					timing={springTiming({config: {damping: 200}, durationInFrames: T.toValues})}
				/>
				<TransitionSeries.Sequence durationInFrames={VALUES_DURATION}>
					<Values {...props} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: T.toPatronage})} />
				<TransitionSeries.Sequence durationInFrames={PATRONAGE_DURATION}>
					<Patronage {...props} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={flashThrough()} timing={linearTiming({durationInFrames: T.toFinale})} />
				<TransitionSeries.Sequence durationInFrames={FINALE_DURATION}>
					<LogoFinale {...props} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<Soundtrack {...props} />
		</AbsoluteFill>
	);
};
