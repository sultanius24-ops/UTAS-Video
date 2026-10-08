import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GoldSoundtrack} from './audio/GoldSoundtrack';
import {GoldenUnveil} from './scenes/GoldenUnveil';
import {PromoProps} from './schema';

export const GoldenUnveilVideo: React.FC<PromoProps> = (props) => (
	<AbsoluteFill>
		<GoldenUnveil {...props} />
		<GoldSoundtrack {...props} />
	</AbsoluteFill>
);
