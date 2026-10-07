// Point clouds the particles fly between: the countdown digits and the logo. They're sampled in
// the browser from the real Montserrat glyphs and the logo image, with a seeded RNG so every
// render worker computes the exact same targets.

export type Shape = {x: Float32Array; y: Float32Array; r?: Uint8Array; g?: Uint8Array; b?: Uint8Array};

export const mulberry32 = (seed: number) => () => {
	seed |= 0;
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Hilbert-curve index: sorting each shape's points by it means particle i lands in a similar
// region of every shape, so morphs flow coherently instead of crossing chaotically.
const hilbert = (n: number, x: number, y: number) => {
	let d = 0;
	for (let s = n / 2; s >= 1; s = Math.floor(s / 2)) {
		const rx = (x & s) > 0 ? 1 : 0;
		const ry = (y & s) > 0 ? 1 : 0;
		d += s * s * ((3 * rx) ^ ry);
		if (ry === 0) {
			if (rx === 1) {
				x = n - 1 - x;
				y = n - 1 - y;
			}
			const t = x;
			x = y;
			y = t;
		}
	}
	return d;
};

const sampleCanvas = (
	ctx: CanvasRenderingContext2D,
	count: number,
	seed: number,
	withColor: boolean,
	alphaMin = 128,
): Shape => {
	const {width, height} = ctx.canvas;
	const data = ctx.getImageData(0, 0, width, height).data;
	const pixels: number[] = [];
	for (let i = 0; i < width * height; i++) {
		if (data[i * 4 + 3] >= alphaMin) {
			pixels.push(i);
		}
	}
	const rand = mulberry32(seed);
	const picks = new Array(count).fill(0).map(() => pixels[Math.floor(rand() * pixels.length)]);
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const p of picks) {
		const x = p % width;
		const y = Math.floor(p / width);
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);
	}
	const key = (p: number) =>
		hilbert(
			1024,
			Math.floor((((p % width) - minX) / Math.max(1, maxX - minX)) * 1023),
			Math.floor(((Math.floor(p / width) - minY) / Math.max(1, maxY - minY)) * 1023),
		);
	picks.sort((a, b) => key(a) - key(b));

	const shape: Shape = {x: new Float32Array(count), y: new Float32Array(count)};
	if (withColor) {
		shape.r = new Uint8Array(count);
		shape.g = new Uint8Array(count);
		shape.b = new Uint8Array(count);
	}
	picks.forEach((p, i) => {
		// Jitter within the pixel so dense areas don't look gridded.
		shape.x[i] = (p % width) + rand();
		shape.y[i] = Math.floor(p / width) + rand();
		if (withColor) {
			shape.r![i] = data[p * 4];
			shape.g![i] = data[p * 4 + 1];
			shape.b![i] = data[p * 4 + 2];
		}
	});
	return shape;
};

export const sampleDigit = (text: string, count: number, width: number, height: number, fontSize: number, seed: number): Shape => {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d', {willReadFrequently: true})!;
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = `900 ${fontSize}px Montserrat`;
	// Optical centre: Montserrat digits sit slightly high on a middle baseline.
	ctx.fillText(text, width / 2, height / 2 + fontSize * 0.04);
	return sampleCanvas(ctx, count, seed, false);
};

export const sampleImage = (
	img: HTMLImageElement,
	count: number,
	width: number,
	height: number,
	rect: {x: number; y: number; w: number; h: number},
	seed: number,
): Shape => {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d', {willReadFrequently: true})!;
	ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
	return sampleCanvas(ctx, count, seed, true, 170);
};
