import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fonts are bundled locally (public/fonts) so renders never depend on the network.
const montserrat = [300, 500, 700, 800, 900].map((weight) =>
	loadFont({
		family: 'Montserrat',
		url: staticFile(`fonts/montserrat-latin-${weight}-normal.woff2`),
		weight: String(weight),
	}),
);

const cairo = [400, 700, 800].map((weight) =>
	loadFont({
		family: 'Cairo',
		url: staticFile(`fonts/cairo-arabic-${weight}-normal.woff2`),
		weight: String(weight),
	}),
);

export const fontsReady = Promise.all([...montserrat, ...cairo]);
