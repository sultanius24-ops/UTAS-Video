import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ParticleSoundtrack} from './audio/ParticleSoundtrack';
import {ParticleReveal} from './scenes/ParticleReveal';
import {PromoProps} from './schema';

export const EveryPointCounts: React.FC<PromoProps> = (props) => (
	<AbsoluteFill>
		<ParticleReveal {...props} />
		<ParticleSoundtrack {...props} />
	</AbsoluteFill>
);
