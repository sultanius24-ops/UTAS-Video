// Outline of the building in campus-dusk.jpg pixel coordinates (2000×1125), traced by hand
// along the front towers, crenellated walls and dome, clockwise from the bottom-left.
// The base line is routed above the billboard on the right so the light never crosses it.
export const PHOTO = {w: 2000, h: 1125};

type P = [number, number];

const dome = (cx: number, cy: number, rx: number, ry: number, steps = 40): P[] =>
	new Array(steps + 1).fill(0).map((_, i) => {
		const a = Math.PI + (i / steps) * Math.PI;
		return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
	});

export const OUTLINE: P[] = [
	[338, 700],
	[338, 401],
	[460, 401],
	[460, 451],
	[566, 451],
	[566, 402],
	[774, 402],
	[774, 475],
	[851, 475],
	...dome(956, 490, 105, 110),
	[1151, 488],
	[1151, 405],
	[1368, 405],
	[1368, 465],
	[1521, 465],
	[1521, 409],
	[1661, 409],
	[1661, 700],
	[1450, 930],
	[1080, 1045],
	[815, 1045],
	[530, 940],
	[338, 700],
];

const seg = OUTLINE.slice(1).map((p, i) => Math.hypot(p[0] - OUTLINE[i][0], p[1] - OUTLINE[i][1]));
export const CUMULATIVE = seg.reduce<number[]>((acc, l) => [...acc, acc[acc.length - 1] + l], [0]);
export const OUTLINE_LENGTH = CUMULATIVE[CUMULATIVE.length - 1];
export const OUTLINE_D = `M ${OUTLINE.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')}`;

// Point at distance s along the outline (wraps around).
export const pointAt = (s: number): P => {
	const d = ((s % OUTLINE_LENGTH) + OUTLINE_LENGTH) % OUTLINE_LENGTH;
	let i = 1;
	while (i < CUMULATIVE.length - 1 && CUMULATIVE[i] < d) i++;
	const t = (d - CUMULATIVE[i - 1]) / (CUMULATIVE[i] - CUMULATIVE[i - 1] || 1);
	const a = OUTLINE[i - 1];
	const b = OUTLINE[i];
	return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
};
