import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {OUTLINE_D, OUTLINE_LENGTH as L, PHOTO, pointAt} from '../gold/outline';
import {COUNT_END, COUNT_FROM, COUNT_START, FADE_IN, FINAL_STRETCH, LIGHT_UP, LOGO_DONE, PARTS, RISE_DURATION, SHINE, STEP, TITLE} from '../gold/timing';
import {PromoProps} from '../schema';
import {fonts} from '../theme';

const GOLD_LIGHT = '#FFEDB5';
const GOLD = '#F2C14E';
const GOLD_DEEP = '#B9862C';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);

// Where the logo settles: in the sky above the dome, just left of the flagpole (photo pixel coordinates).
const LOGO_PHOTO = {cx: 920, cy: 250, w: 350};
const LOGO_ASPECT = 850 / 1328;
const LOGO_SRC = staticFile('images/quality-day-logo.png');

// Rough horizontal centre and bottom edge of each layer, in logo pixels (1328×850), for the gold trails.
const LAYER_GEOMETRY: Record<string, {cx: number; bottom: number}> = {
	wave: {cx: 660, bottom: 848},
	'bar-1': {cx: 155, bottom: 662},
	'bar-2': {cx: 248, bottom: 630},
	'bar-3': {cx: 352, bottom: 652},
	'bar-4': {cx: 464, bottom: 714},
	ring: {cx: 845, bottom: 611},
	building: {cx: 640, bottom: 719},
};

const GoldLight: React.FC = () => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [COUNT_START, COUNT_END], [0, 1], {...clamp, easing: easeInOut});
	const s = p * L;
	const running = frame >= COUNT_START && frame < COUNT_END + 4;
	const [hx, hy] = pointAt(Math.min(s, L - 0.01));
	const flash = interpolate(frame, [COUNT_END - 2, COUNT_END + 6, LIGHT_UP[1] + 30], [0, 1, 0], clamp);
	const traceOpacity = interpolate(frame, [COUNT_END, LIGHT_UP[1], LOGO_DONE + 120], [0.55, 0.8, 0.35], clamp);
	const headPulse = 1 + 0.15 * Math.sin(frame * 0.5);

	// Sparkles shed by the light: one emitted every 14px of travel, drifting and fading.
	const spacing = 14;
	const emitted = Math.floor(s / spacing);
	const sparkles = running
		? new Array(36).fill(0).map((_, k) => {
				const e = emitted - k;
				if (e < 0) return null;
				const [x, y] = pointAt(e * spacing);
				const a = random(`sa${e}`) * Math.PI * 2;
				const drift = k * (0.8 + random(`sd${e}`) * 1.6);
				return (
					<circle
						key={e}
						cx={x + Math.cos(a) * drift}
						cy={y + Math.sin(a) * drift - k * 0.6}
						r={1 + random(`sr${e}`) * 2.2}
						fill={GOLD_LIGHT}
						opacity={(1 - k / 36) * (0.4 + 0.6 * random(`so${e}`))}
					/>
				);
			})
		: null;

	return (
		<svg viewBox={`0 0 ${PHOTO.w} ${PHOTO.h}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'screen', overflow: 'visible'}}>
			<defs>
				<filter id="gl-glow" x="-10%" y="-10%" width="120%" height="120%">
					<feGaussianBlur stdDeviation="5" result="b" />
					<feMerge>
						<feMergeNode in="b" />
						<feMergeNode in="b" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
				<filter id="gl-bloom" x="-10%" y="-10%" width="120%" height="120%">
					<feGaussianBlur stdDeviation="16" />
				</filter>
				<radialGradient id="gl-head">
					<stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
					<stop offset="25%" stopColor={GOLD_LIGHT} stopOpacity={0.9} />
					<stop offset="60%" stopColor={GOLD} stopOpacity={0.35} />
					<stop offset="100%" stopColor={GOLD} stopOpacity={0} />
				</radialGradient>
			</defs>
			{/* The trace the light leaves behind */}
			<path
				d={OUTLINE_D}
				pathLength={L}
				fill="none"
				stroke={GOLD}
				strokeWidth={3 + 3 * flash}
				strokeLinejoin="round"
				strokeDasharray={`${s} ${L}`}
				opacity={frame < COUNT_START ? 0 : traceOpacity + 0.2 * flash}
				filter="url(#gl-glow)"
			/>
			<path d={OUTLINE_D} pathLength={L} fill="none" stroke={GOLD} strokeWidth={14} opacity={0.9 * flash} filter="url(#gl-bloom)" />
			{running ? (
				<>
					{/* Comet tail: layered dashes, brighter and thicker towards the head */}
					{(
						[
							[320, 3, 0.35],
							[170, 5, 0.6],
							[70, 8, 0.95],
						] as const
					).map(([len, w, o]) => (
						<path
							key={len}
							d={OUTLINE_D}
							pathLength={L}
							fill="none"
							stroke={GOLD_LIGHT}
							strokeWidth={w}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeDasharray={`${Math.min(len, s)} ${L * 2}`}
							strokeDashoffset={-(s - Math.min(len, s))}
							opacity={o}
							filter="url(#gl-glow)"
						/>
					))}
					{sparkles}
					<circle cx={hx} cy={hy} r={46 * headPulse} fill="url(#gl-head)" />
					<circle cx={hx} cy={hy} r={5} fill="#FFFFFF" />
				</>
			) : null}
		</svg>
	);
};

// A logo part rising from below the frame into its place, trailing gold light.
const RisingPart: React.FC<{layer: string; start: number; logo: {x: number; y: number; w: number; h: number}}> = ({layer, start, logo}) => {
	const frame = useCurrentFrame();
	const {height} = useVideoConfig();
	const local = frame - start;
	if (local < 0) return null;
	const t = interpolate(local, [0, RISE_DURATION], [0, 1], {...clamp, easing: easeOut});
	const travel = height - logo.y + 60;
	const offset = (1 - t) * travel;
	const opacity = interpolate(local, [0, 24], [0, 1], clamp);
	const geo = LAYER_GEOMETRY[layer];
	const scale = logo.w / 1328;
	const trail = (1 - t) * Math.min(1, local / 10);
	const landGlint = interpolate(local, [RISE_DURATION - 22, RISE_DURATION - 6, RISE_DURATION + 14], [0, 1, 0], clamp);

	return (
		<>
			{/* Gold trail under the rising part */}
			<div
				style={{
					position: 'absolute',
					left: logo.x + geo.cx * scale - 5,
					top: logo.y + geo.bottom * scale + offset - 4,
					width: 10,
					height: Math.min(520, offset + 40),
					background: `linear-gradient(180deg, ${GOLD_LIGHT}, rgba(242,193,78,0.5) 30%, rgba(242,193,78,0))`,
					filter: 'blur(3px)',
					opacity: trail,
					borderRadius: 10,
				}}
			/>
			<Img
				src={staticFile(`images/logo-layers/${layer}.png`)}
				style={{
					position: 'absolute',
					left: logo.x,
					top: logo.y,
					width: logo.w,
					height: logo.h,
					transform: `translateY(${offset}px)`,
					opacity,
					filter: `drop-shadow(0 0 ${6 + 14 * (trail + landGlint)}px rgba(255,205,90,${0.85 * Math.max(trail, landGlint)}))`,
				}}
			/>
		</>
	);
};

const GoldNumber: React.FC<{n: number; local: number}> = ({n, local}) => {
	const {fps} = useVideoConfig();
	const enter = spring({frame: local, fps, config: {damping: 16, stiffness: 140}});
	const exit = interpolate(local, [STEP - 7, STEP], [0, 1], clamp);
	const final = n <= FINAL_STRETCH;
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				transform: `translateY(${(1 - enter) * 40 - exit * 30}px) scale(${(1.25 - 0.25 * enter) * (1 - 0.1 * exit)})`,
				transformOrigin: '0% 50%',
				opacity: Math.min(1, local / 4) * (1 - exit),
				filter: `blur(${interpolate(local, [0, 8], [10, 0], clamp) + exit * 8}px) drop-shadow(0 0 ${final ? 30 : 18}px rgba(242,193,78,${final ? 0.7 : 0.45}))`,
			}}
		>
			<svg width={420} height={190} style={{overflow: 'visible'}}>
				<defs>
					<linearGradient id="gold-num" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={GOLD_LIGHT} />
						<stop offset="55%" stopColor={GOLD} />
						<stop offset="100%" stopColor={GOLD_DEEP} />
					</linearGradient>
				</defs>
				<text x={0} y={158} fill="url(#gold-num)" style={{fontFamily: fonts.display, fontWeight: 800, fontSize: 180, letterSpacing: '-0.02em'}}>
					{n}
				</text>
			</svg>
		</div>
	);
};

export const GoldenUnveil: React.FC<PromoProps> = ({kicker, kickerAr, eventTitle, eventTitleAr, year, universityName, tagline, taglineAr}) => {
	const frame = useCurrentFrame();
	const {width, durationInFrames} = useVideoConfig();
	const k = width / PHOTO.w;
	const logoW = LOGO_PHOTO.w * k;
	const logoH = logoW * LOGO_ASPECT;
	const logo = {x: LOGO_PHOTO.cx * k - logoW / 2, y: LOGO_PHOTO.cy * k - logoH / 2, w: logoW, h: logoH};

	const camera = interpolate(frame, [0, durationInFrames], [1.0, 1.06], clamp);
	const lit = interpolate(frame, LIGHT_UP, [0, 1], {...clamp, easing: easeInOut});
	const black = interpolate(frame, FADE_IN, [1, 0], clamp);
	const halo = interpolate(frame, [PARTS[0].start + 10, LOGO_DONE], [0, 1], {...clamp, easing: easeInOut});
	const shine = interpolate(frame, [SHINE, SHINE + 44], [-40, 140], clamp);

	const t = frame - COUNT_START;
	const idx = Math.min(COUNT_FROM - 1, Math.max(0, Math.floor(t / STEP)));
	const local = t - idx * STEP;
	const counting = t >= 0 && frame < COUNT_END;
	const panelIn = interpolate(frame, [8, 30], [0, 1], clamp);
	const panelOut = interpolate(frame, [COUNT_END - 4, COUNT_END + 14], [1, 0], clamp);
	const titleIn = (d: number) => interpolate(frame, [TITLE + d, TITLE + d + 20], [0, 1], clamp);

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{/* The world: photo, gold light and rising logo share one slowly pushing camera */}
			<AbsoluteFill style={{transform: `scale(${camera})`, transformOrigin: '62% 22%'}}>
				<Img
					src={staticFile('images/campus-dusk.jpg')}
					style={{width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${0.62 + 0.38 * lit}) saturate(${0.9 + 0.2 * lit})`}}
				/>
				{/* Warm light blooming from the building once the outline completes */}
				<AbsoluteFill
					style={{
						background: 'radial-gradient(ellipse 45% 40% at 50% 60%, rgba(255,190,90,0.35), transparent 70%)',
						mixBlendMode: 'screen',
						opacity: lit * interpolate(frame, [LIGHT_UP[1], LIGHT_UP[1] + 120], [1, 0.45], clamp),
					}}
				/>
				<GoldLight />
				{/* Halo that makes the logo glow against the dusk sky */}
				<div
					style={{
						position: 'absolute',
						left: logo.x - logo.w * 0.25,
						top: logo.y - logo.h * 0.45,
						width: logo.w * 1.5,
						height: logo.h * 1.9,
						background: 'radial-gradient(ellipse at center, rgba(255,250,236,0.92) 0%, rgba(255,244,220,0.72) 30%, rgba(255,226,170,0.3) 52%, rgba(255,210,140,0.08) 66%, transparent 76%)',
						opacity: halo,
						filter: 'blur(14px)',
					}}
				/>
				{PARTS.map((part) => (
					<RisingPart key={part.layer} layer={part.layer} start={part.start} logo={logo} />
				))}
				{/* Gold shine across the finished logo */}
				<div
					style={{
						position: 'absolute',
						left: logo.x,
						top: logo.y,
						width: logo.w,
						height: logo.h,
						background: `linear-gradient(110deg, transparent ${shine - 14}%, rgba(255,236,170,0.9) ${shine}%, transparent ${shine + 14}%)`,
						maskImage: `url(${LOGO_SRC})`,
						WebkitMaskImage: `url(${LOGO_SRC})`,
						maskSize: '100% 100%',
						WebkitMaskSize: '100% 100%',
						opacity: frame >= SHINE ? 1 : 0,
					}}
				/>
			</AbsoluteFill>

			{/* Darken the top-left so the countdown and title read clearly */}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 55% 60% at 0% 0%, rgba(2,8,28,0.75), transparent 70%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 45% 55% at 100% 0%, rgba(2,8,28,0.6), transparent 70%)', opacity: interpolate(frame, [TITLE - 20, TITLE + 10], [0, 1], clamp)}} />

			{/* Countdown, top-left */}
			<div style={{position: 'absolute', left: 90, top: 52, opacity: panelIn * panelOut}}>
				<div style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 22, letterSpacing: '0.42em', textTransform: 'uppercase', color: GOLD}}>{kicker}</div>
				<div style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: 34, color: '#FFFFFF', direction: 'rtl', textAlign: 'left', marginTop: 2}}>{kickerAr}</div>
				<div style={{position: 'relative', width: 420, height: 190, marginTop: 4}}>
					{counting ? <GoldNumber key={idx} n={COUNT_FROM - idx} local={local} /> : null}
				</div>
				<div style={{width: 300, height: 3, background: 'rgba(242,193,78,0.25)', borderRadius: 3, marginTop: 4}}>
					<div style={{width: `${counting ? (local / STEP) * 100 : 100}%`, height: '100%', background: `linear-gradient(90deg, ${GOLD_DEEP}, ${GOLD_LIGHT})`, borderRadius: 3, boxShadow: `0 0 10px ${GOLD}`}} />
				</div>
			</div>

			{/* Title, in the sky on the right, once the logo has arrived */}
			<div style={{position: 'absolute', right: 90, top: 58, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right'}}>
				<div style={{display: 'flex', alignItems: 'baseline', gap: 20, opacity: titleIn(0), transform: `translateY(${(1 - titleIn(0)) * 24}px)`}}>
					<div style={{fontFamily: fonts.display, fontWeight: 900, fontSize: 70, lineHeight: 1, color: '#FFFFFF', textShadow: '0 6px 30px rgba(0,0,0,0.5)'}}>{eventTitle.toUpperCase()}</div>
					<div style={{fontFamily: fonts.display, fontWeight: 900, fontSize: 70, lineHeight: 1, color: GOLD, textShadow: '0 0 30px rgba(242,193,78,0.5)'}}>{year}</div>
				</div>
				<div style={{fontFamily: fonts.arabic, fontWeight: 800, fontSize: 52, lineHeight: 1.35, color: GOLD_LIGHT, direction: 'rtl', textAlign: 'right', opacity: titleIn(10), transform: `translateY(${(1 - titleIn(10)) * 24}px)`}}>
					{eventTitleAr}
				</div>
				<div style={{width: 140 * titleIn(20), height: 3, background: `linear-gradient(270deg, ${GOLD}, transparent)`, margin: '10px 0 12px'}} />
				<div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: titleIn(26)}}>
					<div style={{fontFamily: fonts.display, fontWeight: 500, fontSize: 21, color: GOLD_LIGHT}}>{tagline}</div>
					<div style={{width: 2, height: 22, background: GOLD}} />
					<div style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: 25, color: GOLD_LIGHT, direction: 'rtl'}}>{taglineAr}</div>
				</div>
				<div style={{fontFamily: fonts.display, fontWeight: 600, fontSize: 15, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', marginTop: 10, opacity: titleIn(36)}}>
					{universityName}
				</div>
			</div>

			<AbsoluteFill style={{background: '#000', opacity: black}} />
		</AbsoluteFill>
	);
};
