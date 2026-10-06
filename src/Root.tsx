import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {PROMO_DURATION, QualityDayPromo} from './QualityDayPromo';
import {defaultPromoProps, promoSchema} from './schema';

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="QualityDayPromo"
			component={QualityDayPromo}
			durationInFrames={PROMO_DURATION}
			fps={30}
			width={1920}
			height={1080}
			schema={promoSchema}
			defaultProps={defaultPromoProps}
		/>
	);
};
