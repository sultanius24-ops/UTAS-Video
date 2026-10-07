import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {phase} from '../loop';
import {PromoProps} from '../schema';
import {colors, fonts} from '../theme';

const RING = 620;
const R = 270;
const C = 2 * Math.PI * R;
const SEGMENTS = 10;

// Calm holding screen shown before the countdown is started. Every motion repeats exactly
// every `loop` frames so it can play on repeat.
export const Standby: React.FC<PromoProps & {loop: number}> = ({loop, kicker, kickerAr, eventTitle, eventTitleAr, year, standbyNote, standbyNoteAr}) => {
	const frame = useCurrentFrame();
	const turn = (frame / loop) * 360;
	const pulse = 0.5 + 0.5 * Math.sin(phase(frame, 1.2, loop));
	const chase = Math.floor((frame / loop) * SEGMENTS * 4) % SEGMENTS;

	return (
		<AbsoluteFill>
			<Backdrop particles={70} loop={loop} />
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(61,139,255,${0.12 + 0.1 * pulse}) 0%, transparent 45%)`}} />
			<div style={{position: 'absolute', left: '50%', top: '50%', width: RING, height: RING, transform: 'translate(-50%, -50%)'}}>
				<svg width={RING} height={RING} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
					<defs>
						<linearGradient id="sb-arc" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0%" stopColor={colors.sky} />
							<stop offset="100%" stopColor={colors.orange} />
						</linearGradient>
					</defs>
					<circle cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke="rgba(191,216,255,0.14)" strokeWidth={14} />
					{[0, 180].map((offset) => (
						<circle
							key={offset}
							cx={RING / 2}
							cy={RING / 2}
							r={R}
							fill="none"
							stroke="url(#sb-arc)"
							strokeWidth={14}
							strokeLinecap="round"
							strokeDasharray={`${C * 0.18} ${C}`}
							transform={`rotate(${turn * 2 + offset} ${RING / 2} ${RING / 2})`}
							style={{filter: 'drop-shadow(0 0 14px rgba(61,139,255,0.7))'}}
						/>
					))}
					{new Array(SEGMENTS).fill(0).map((_, i) => {
						const a0 = (i / SEGMENTS + 0.025) * Math.PI * 2 - Math.PI / 2;
						const a1 = ((i + 1) / SEGMENTS - 0.025) * Math.PI * 2 - Math.PI / 2;
						const ro = R + 44;
						const c = RING / 2;
						return (
							<path
								key={i}
								d={`M ${c + Math.cos(a0) * ro} ${c + Math.sin(a0) * ro} A ${ro} ${ro} 0 0 1 ${c + Math.cos(a1) * ro} ${c + Math.sin(a1) * ro}`}
								fill="none"
								strokeWidth={8}
								strokeLinecap="round"
								stroke={i === chase ? colors.amber : 'rgba(191,216,255,0.18)'}
							/>
						);
					})}
				</svg>
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
					<div style={{fontFamily: fonts.arabic, fontWeight: 800, fontSize: 88, color: colors.white, direction: 'rtl', lineHeight: 1.2}}>{eventTitleAr}</div>
					<div style={{fontFamily: fonts.display, fontWeight: 800, fontSize: 40, letterSpacing: '0.24em', marginRight: '-0.24em', color: colors.ice, textTransform: 'uppercase'}}>
						{eventTitle}
					</div>
					<div style={{fontFamily: fonts.display, fontWeight: 900, fontSize: 44, color: colors.amber, marginTop: 8, letterSpacing: '0.1em'}}>{year}</div>
				</AbsoluteFill>
			</div>
			<AbsoluteFill style={{alignItems: 'center', paddingTop: 70}}>
				<div style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 30, letterSpacing: '0.45em', marginRight: '-0.45em', textTransform: 'uppercase', color: colors.amber}}>
					{kicker}
				</div>
				<div style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: 44, color: colors.white, direction: 'rtl', marginTop: 4}}>{kickerAr}</div>
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 70, opacity: 0.55 + 0.45 * pulse}}>
				<div style={{fontFamily: fonts.arabic, fontWeight: 700, fontSize: 36, color: colors.white, direction: 'rtl'}}>{standbyNoteAr}</div>
				<div style={{fontFamily: fonts.display, fontWeight: 500, fontSize: 26, letterSpacing: '0.3em', marginRight: '-0.3em', textTransform: 'uppercase', color: colors.ice, marginTop: 6}}>
					{standbyNote}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
