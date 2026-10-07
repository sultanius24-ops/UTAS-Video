// Helpers that turn free-running motion into motion that repeats exactly every `loop` frames,
// so standby/hold screens can play on repeat without a visible seam.
const TAU = Math.PI * 2;

// Phase (radians) for something that oscillates at `rate` rad/s. With a loop length the rate is
// snapped to a whole number of cycles per loop.
export const phase = (frame: number, rate: number, loop?: number, fps = 30) => {
	if (!loop) {
		return (frame / fps) * rate;
	}
	const cycles = Math.max(1, Math.round((Math.abs(rate) * loop) / fps / TAU)) * Math.sign(rate || 1);
	return (TAU * cycles * frame) / loop;
};

// Distance travelled at `speed` px/frame, wrapped to `span`. With a loop length the speed is
// snapped so the travel covers a whole number of spans per loop.
export const drift = (frame: number, speed: number, span: number, loop?: number) => {
	const raw = loop ? (span * Math.max(1, Math.round((speed * loop) / span)) * frame) / loop : speed * frame;
	return ((raw % span) + span) % span;
};

// Length of the standby and logo-hold loops.
export const LOOP_FRAMES = 600;
