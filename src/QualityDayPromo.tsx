import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig} from 'remotion';
import {linearTiming, springTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {Opening, OPENING_DURATION} from './scenes/Opening';
import {TitleReveal, TITLE_DURATION} from './scenes/TitleReveal';
import {Journey, JOURNEY_DURATION} from './scenes/Journey';
import {Values, VALUES_DURATION} from './scenes/Values';
import {Patronage, PATRONAGE_DURATION} from './scenes/Patronage';
import {LogoFinale, FINALE_DURATION} from './scenes/LogoFinale';
import {flashThrough, zoomThrough} from './transitions';
import {PromoProps} from './schema';
import {colors} from './theme';

const T = {
	toTitle: 20,
	toJourney: 22,
	toValues: 20,
	toPatronage: 24,
	toFinale: 24,
};

export const PROMO_DURATION =
	OPENING_DURATION +
	TITLE_DURATION +
	JOURNEY_DURATION +
	VALUES_DURATION +
	PATRONAGE_DURATION +
	FINALE_DURATION -
	Object.values(T).reduce((a, b) => a + b, 0);

export const QualityDayPromo: React.FC<PromoProps> = (props) => {
	const {fps, durationInFrames} = useVideoConfig();

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
			{props.musicFile ? (
				<Audio
					src={staticFile(props.musicFile)}
					volume={(f) =>
						interpolate(f, [0, fps, durationInFrames - fps * 2, durationInFrames], [0, 0.8, 0.8, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})
					}
				/>
			) : null}
		</AbsoluteFill>
	);
};
