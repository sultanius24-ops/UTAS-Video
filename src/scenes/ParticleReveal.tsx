import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
	AbsoluteFill,
	cancelRender,
	continueRender,
	delayRender,
	Img,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {fontsReady} from '../fonts';
import {AccentLine, LetterCascade, MaskReveal} from '../components/Reveal';
import {mulberry32, sampleDigit, sampleImage, Shape} from '../particles/targets';
import {
	ASSEMBLE,
	BURST,
	DAWN,
	DIGITS,
	DURATION,
	FINAL_STRETCH,
	GATHER,
	INTRO_TEXT,
	LOCK,
	LOGO_RESOLVE,
	MORPH,
	PARTICLES as N,
	TITLES,
} from '../particles/timing';
import {PromoProps} from '../schema';
import {colors, fonts, gradients} from '../theme';

const LOGO = staticFile('images/quality-day-logo.png');
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const useLayout = () => {
	const {width, height} = useVideoConfig();
	const vertical = height > width;
	const logoW = vertical ? 920 : 820;
	const logoH = (logoW * 850) / 1328;
	const logoCy = vertical ? height * 0.38 : height * 0.4;
	return {
		width,
		height,
		vertical,
		fontSize: 0.62 * Math.min(width, height),
		logo: {x: (width - logoW) / 2, y: logoCy - logoH / 2, w: logoW, h: logoH},
		titleTop: logoCy + logoH / 2 + 34,
	};
};

type Particles = {
	shapes: Shape[]; // scatter, 10 … 1, burst, logo
	rgb: Float32Array[]; // colour per shape, 3 floats per particle
	seed: Float32Array; // per-particle random values (4 per particle)
	assemblyDelay: Float32Array;
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// Sample every target once per render worker (seeded, so all workers agree).
const useParticles = (): Particles | null => {
	const {width, height, fontSize, logo} = useLayout();
	const [handle] = useState(() => delayRender('Sampling particle targets'));
	const [data, setData] = useState<Particles | null>(null);

	useEffect(() => {
		(async () => {
			await fontsReady;
			await document.fonts.load(`900 ${fontSize}px Montserrat`);
			const img = new Image();
			img.src = LOGO;
			await img.decode();

			const rand = mulberry32(2026);
			const seed = new Float32Array(N * 4).map(() => rand());

			const scatter: Shape = {x: new Float32Array(N), y: new Float32Array(N)};
			for (let i = 0; i < N; i++) {
				scatter.x[i] = seed[i * 4] * width;
				scatter.y[i] = seed[i * 4 + 1] * height;
			}
			const digits = DIGITS.map((d, k) => sampleDigit(d, N, width, height, fontSize, 100 + k));
			const one = digits[digits.length - 1];
			const burst: Shape = {x: new Float32Array(N), y: new Float32Array(N)};
			for (let i = 0; i < N; i++) {
				const dx = one.x[i] - width / 2;
				const dy = one.y[i] - height / 2;
				const a = Math.atan2(dy, dx || 0.001) + (seed[i * 4 + 2] - 0.5) * 1.6;
				const dist = 260 + seed[i * 4 + 3] * 760;
				burst.x[i] = one.x[i] + Math.cos(a) * dist;
				burst.y[i] = one.y[i] + Math.sin(a) * dist;
			}
			const logoShape = sampleImage(img, N, width, height, logo, 7);

			const shapes = [scatter, ...digits, burst, logoShape];
			const cool = [hex(colors.ice), hex(colors.sky)];
			const warm = [hex(colors.amber), hex(colors.orange)];
			const rgb = shapes.map((shape, s) => {
				const out = new Float32Array(N * 3);
				const digitIndex = s - 1;
				const isWarm = (digitIndex >= DIGITS.length - FINAL_STRETCH && digitIndex < DIGITS.length) || s === DIGITS.length + 1;
				for (let i = 0; i < N; i++) {
					if (shape.r) {
						out[i * 3] = shape.r[i];
						out[i * 3 + 1] = shape.g![i];
						out[i * 3 + 2] = shape.b![i];
					} else {
						const [a, b] = isWarm ? warm : cool;
						const m = seed[i * 4 + 2];
						for (let c = 0; c < 3; c++) out[i * 3 + c] = a[c] + (b[c] - a[c]) * m;
					}
				}
				return out;
			});

			// Points settle into the logo from left to right, with a little randomness.
			const assemblyDelay = new Float32Array(N);
			for (let i = 0; i < N; i++) {
				assemblyDelay[i] = Math.min(1, Math.max(0, (logoShape.x[i] - logo.x) / logo.w)) * 0.45 + seed[i * 4 + 3] * 0.1;
			}
			setData({shapes, rgb, seed, assemblyDelay});
			continueRender(handle);
		})().catch((e) => cancelRender(e));
	}, [handle, width, height, fontSize, logo.x, logo.y, logo.w, logo.h]);

	return data;
};

type Segment = {from: number; to: number; start: number; end: number; stagger: number; ease: (t: number) => number; swirl: number};

const SEGMENTS: Segment[] = [
	{from: 0, to: 1, start: GATHER[0], end: GATHER[1], stagger: 0.45, ease: easeInOut, swirl: 120},
	...DIGITS.slice(1).map((_, k) => ({
		from: k + 1,
		to: k + 2,
		start: LOCK[k] + 30 - MORPH,
		end: LOCK[k + 1],
		stagger: 0.3,
		ease: easeInOut,
		swirl: 70,
	})),
	{from: DIGITS.length, to: DIGITS.length + 1, start: BURST[0], end: BURST[1], stagger: 0.12, ease: easeOut, swirl: 0},
	{from: DIGITS.length + 1, to: DIGITS.length + 2, start: ASSEMBLE[0], end: ASSEMBLE[1], stagger: 0, ease: easeInOut, swirl: 160},
];

const drawParticles = (ctx: CanvasRenderingContext2D, p: Particles, frame: number, dawn: number) => {
	const {width, height} = ctx.canvas;
	ctx.clearRect(0, 0, width, height);
	let seg = SEGMENTS[0];
	for (const s of SEGMENTS) {
		if (frame >= s.start) seg = s;
	}
	const before = frame < SEGMENTS[0].start;
	const A = p.shapes[seg.from];
	const B = p.shapes[seg.to];
	const cA = p.rgb[seg.from];
	const cB = p.rgb[seg.to];
	const span = seg.end - seg.start;
	const t = (frame - seg.start) / span;
	const assembling = seg.to === p.shapes.length - 1;
	const fade = interpolate(frame, [LOGO_RESOLVE[0] + 4, LOGO_RESOLVE[1]], [1, 0], clamp);
	if (fade <= 0) return;

	for (let i = 0; i < N; i++) {
		const r0 = p.seed[i * 4];
		const r1 = p.seed[i * 4 + 1];
		const r2 = p.seed[i * 4 + 2];
		let x: number;
		let y: number;
		let k: number;
		if (before) {
			// Drifting dust before anything gathers.
			x = A.x[i] + Math.sin(frame * 0.02 + r0 * 40) * 24;
			y = A.y[i] + Math.cos(frame * 0.017 + r1 * 40) * 18 - frame * (0.2 + r2 * 0.4);
			k = 0;
			const c = cA;
			ctx.fillStyle = `rgba(${c[i * 3]},${c[i * 3 + 1]},${c[i * 3 + 2]},${0.35 + 0.4 * r2})`;
		} else {
			const delay = assembling ? p.assemblyDelay[i] : r0 * seg.stagger;
			const local = Math.min(1, Math.max(0, (t - delay) / (1 - (assembling ? 0.55 : seg.stagger))));
			k = seg.ease(local);
			let ax = A.x[i];
			let ay = A.y[i];
			if (seg.from === 0) {
				ax += Math.sin(frame * 0.02 + r0 * 40) * 24;
				ay += Math.cos(frame * 0.017 + r1 * 40) * 18 - frame * (0.2 + r2 * 0.4);
			}
			const dx = B.x[i] - ax;
			const dy = B.y[i] - ay;
			const len = Math.hypot(dx, dy) || 1;
			const swirl = Math.sin(Math.PI * k) * (r1 - 0.5) * 2 * Math.min(seg.swirl, len * 0.35);
			x = ax + dx * k + (-dy / len) * swirl;
			y = ay + dy * k + (dx / len) * swirl;
			if (local >= 1 && !assembling) {
				// Holding a shape: a gentle shimmer so the number feels alive.
				x += Math.sin(frame * 0.25 + r0 * 30) * 1.1;
				y += Math.cos(frame * 0.21 + r1 * 30) * 1.1;
			}
			const r = cA[i * 3] + (cB[i * 3] - cA[i * 3]) * k;
			const g = cA[i * 3 + 1] + (cB[i * 3 + 1] - cA[i * 3 + 1]) * k;
			const b = cA[i * 3 + 2] + (cB[i * 3 + 2] - cA[i * 3 + 2]) * k;
			const twinkle = 0.75 + 0.25 * Math.sin(frame * 0.3 + r2 * 50);
			ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${(dawn > 0.5 ? 0.95 : twinkle) * fade})`;
		}
		const size = (1.3 + r2 * 1.5) * (1 + dawn * 0.35) + (assembling ? 0.8 * k : 0);
		ctx.beginPath();
		ctx.arc(x, y, size, 0, Math.PI * 2);
		ctx.fill();
	}
};

export const ParticleReveal: React.FC<PromoProps> = (props) => {
	const {kicker, kickerAr, eventTitle, eventTitleAr, year, universityName, tagline, taglineAr, introLine, introLineAr} = props;
	const frame = useCurrentFrame();
	const {width, height, vertical, logo, titleTop} = useLayout();
	const particles = useParticles();
	const canvas = useRef<HTMLCanvasElement>(null);
	const glow = useRef<HTMLCanvasElement>(null);

	const dawn = interpolate(frame, DAWN, [0, 1], {...clamp, easing: easeInOut});

	useLayoutEffect(() => {
		if (!particles || !canvas.current || !glow.current) return;
		const ctx = canvas.current.getContext('2d')!;
		drawParticles(ctx, particles, frame, dawn);
		const g = glow.current.getContext('2d')!;
		g.clearRect(0, 0, width, height);
		g.filter = 'blur(9px)';
		g.drawImage(canvas.current, 0, 0);
		g.filter = 'none';
	}, [particles, frame, dawn, width, height]);

	const logoIn = interpolate(frame, LOGO_RESOLVE, [0, 1], {...clamp, easing: easeInOut});
	const shine = interpolate(frame, [TITLES + 4, TITLES + 46], [-40, 140], clamp);
	const breathe = 1 + interpolate(frame, [LOGO_RESOLVE[1], DURATION], [0, 0.025], clamp);
	const textIn = interpolate(frame, [10, 34], [0, 1], clamp);
	const textOut = interpolate(frame, [LOCK[LOCK.length - 1] + 6, BURST[0]], [1, 0], clamp);
	const intro = interpolate(frame, [INTRO_TEXT[0], INTRO_TEXT[0] + 14, INTRO_TEXT[1] - 10, INTRO_TEXT[1]], [0, 1, 1, 0], clamp);
	const edge = vertical ? height / 2 - 560 : 64;
	const dawnRadius = dawn * Math.hypot(width, height) * 0.9;

	return (
		<AbsoluteFill style={{backgroundColor: colors.night}}>
			<AbsoluteFill
				style={{background: `radial-gradient(ellipse at 50% 55%, ${colors.deep} 0%, ${colors.navy} 40%, ${colors.night} 100%)`}}
			/>
			{/* Dawn: light floods out from the centre as the last number bursts */}
			<AbsoluteFill
				style={{
					opacity: dawn > 0 ? 1 : 0,
					background: `radial-gradient(circle at 50% 50%, #FFFFFF 0px, #FFF8EA ${dawnRadius * 0.45}px, ${colors.paper} ${dawnRadius * 0.8}px, rgba(246,249,255,0) ${dawnRadius * 1.4}px)`,
				}}
			/>
			<canvas ref={canvas} width={width} height={height} style={{position: 'absolute', inset: 0}} />
			<canvas
				ref={glow}
				width={width}
				height={height}
				style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.9 * (1 - dawn)}}
			/>

			{/* Crisp logo resolves out of the points */}
			<div
				style={{
					position: 'absolute',
					left: logo.x,
					top: logo.y,
					width: logo.w,
					height: logo.h,
					opacity: logoIn,
					filter: `blur(${(1 - logoIn) * 8}px) drop-shadow(0 24px 40px rgba(21,87,214,${0.22 * logoIn}))`,
					transform: `scale(${breathe})`,
				}}
			>
				<Img src={LOGO} style={{width: '100%', height: '100%'}} />
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: `linear-gradient(110deg, transparent ${shine - 14}%, rgba(255,255,255,0.85) ${shine}%, transparent ${shine + 14}%)`,
						maskImage: `url(${LOGO})`,
						WebkitMaskImage: `url(${LOGO})`,
						maskSize: '100% 100%',
						WebkitMaskSize: '100% 100%',
					}}
				/>
			</div>

			{/* Opening line while the points drift */}
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: intro, flexDirection: 'column', gap: 10}}>
				<div style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: vertical ? 54 : 60, color: colors.white, direction: 'rtl', textAlign: 'center'}}>
					{introLineAr}
				</div>
				<div
					style={{
						fontFamily: fonts.display,
						fontWeight: 300,
						fontSize: vertical ? 30 : 34,
						letterSpacing: '0.3em',
						marginRight: '-0.3em',
						color: colors.ice,
						textTransform: 'uppercase',
						textAlign: 'center',
					}}
				>
					{introLine}
				</div>
			</AbsoluteFill>

			{/* Countdown framing */}
			<AbsoluteFill style={{alignItems: 'center', paddingTop: edge, opacity: textIn * textOut}}>
				<div style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 28, letterSpacing: '0.45em', marginRight: '-0.45em', textTransform: 'uppercase', color: colors.amber}}>
					{kicker}
				</div>
				<div style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: 40, color: colors.white, direction: 'rtl', marginTop: 2}}>{kickerAr}</div>
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: edge + 10, opacity: textIn * textOut}}>
				<div style={{fontFamily: fonts.display, fontWeight: 300, fontSize: 28, letterSpacing: '0.5em', marginRight: '-0.5em', color: colors.ice, textTransform: 'uppercase'}}>
					{eventTitle} <b style={{fontWeight: 800, color: colors.white}}>{year}</b>
				</div>
			</AbsoluteFill>

			{/* Titles */}
			<AbsoluteFill style={{alignItems: 'center', top: titleTop, flexDirection: 'column'}}>
				<LetterCascade
					text={`${eventTitle.toUpperCase()} ${year}`}
					delay={TITLES}
					stagger={1.6}
					style={{fontFamily: fonts.display, fontWeight: 900, fontSize: vertical ? 70 : 78, letterSpacing: '0.08em', justifyContent: 'center'}}
					letterStyle={{
						background: `linear-gradient(90deg, ${colors.deep}, ${colors.royal})`,
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						color: 'transparent',
					}}
				/>
				<MaskReveal delay={TITLES + 14}>
					<div style={{fontFamily: fonts.arabic, fontWeight: 800, fontSize: vertical ? 56 : 48, color: colors.orange, direction: 'rtl', textAlign: 'center', lineHeight: 1.3}}>
						{eventTitleAr} {year}
					</div>
				</MaskReveal>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 10}}>
					{vertical ? null : <AccentLine delay={TITLES + 24} width={90} height={3} background={gradients.orangeText} />}
					<MaskReveal delay={TITLES + 26}>
						<div
							style={{
								fontFamily: fonts.display,
								fontWeight: 600,
								fontSize: vertical ? 28 : 22,
								lineHeight: 1.4,
								letterSpacing: '0.14em',
								color: colors.ink,
								textTransform: 'uppercase',
								textAlign: 'center',
								maxWidth: vertical ? 700 : undefined,
							}}
						>
							{universityName}
						</div>
					</MaskReveal>
					{vertical ? null : <AccentLine delay={TITLES + 24} width={90} height={3} background={gradients.orangeText} />}
				</div>
				<div
					style={{
						marginTop: 26,
						display: 'flex',
						flexDirection: vertical ? 'column' : 'row',
						alignItems: 'center',
						gap: vertical ? 6 : 24,
						opacity: interpolate(frame, [TITLES + 50, TITLES + 70], [0, 1], clamp),
						transform: `translateY(${interpolate(frame, [TITLES + 50, TITLES + 70], [16, 0], clamp)}px)`,
					}}
				>
					<div style={{fontFamily: fonts.display, fontWeight: 600, fontSize: vertical ? 32 : 28, color: colors.royal, letterSpacing: '0.04em'}}>{tagline}</div>
					{vertical ? null : <div style={{width: 2, height: 30, background: colors.orange}} />}
					<div style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: vertical ? 38 : 32, color: colors.royal, direction: 'rtl'}}>{taglineAr}</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
