import React from 'react';
import {AbsoluteFill} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Countdown} from './scenes/Countdown';
import {LogoFinale} from './scenes/LogoFinale';
import {flashThrough} from './transitions';
import {COUNTDOWN_DURATION, FINALE_DURATION, FLASH} from './timeline';
import {Soundtrack} from './audio/Soundtrack';
import {PromoProps} from './schema';
import {colors} from './theme';

export const QualityDayPromo: React.FC<PromoProps> = (props) => {
	return (
		<AbsoluteFill style={{backgroundColor: colors.night}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={COUNTDOWN_DURATION}>
					<Countdown {...props} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={flashThrough()} timing={linearTiming({durationInFrames: FLASH})} />
				<TransitionSeries.Sequence durationInFrames={FINALE_DURATION}>
					<LogoFinale {...props} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<Soundtrack {...props} />
		</AbsoluteFill>
	);
};
