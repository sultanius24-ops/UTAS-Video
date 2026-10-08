// Frame timeline for the "Golden Unveil" (30 fps).
export const FADE_IN = [0, 30];
export const COUNT_FROM = 10;
export const COUNT_START = 30; // "10" appears; the gold light sets off around the building
export const STEP = 30;
export const COUNT_END = COUNT_START + COUNT_FROM * STEP; // 330: the light completes its loop
export const FINAL_STRETCH = 3;
export const LIGHT_UP = [COUNT_END, COUNT_END + 50]; // outline flashes, the building lights up

// Logo parts rise from below the frame, one after another, into the sky beside the flag.
export const RISE_DURATION = 90;
export const PARTS: {layer: string; start: number}[] = [
	{layer: 'wave', start: 360},
	{layer: 'bar-1', start: 392},
	{layer: 'bar-2', start: 412},
	{layer: 'bar-3', start: 432},
	{layer: 'bar-4', start: 452},
	{layer: 'ring', start: 482},
	{layer: 'building', start: 516},
];
export const LOGO_DONE = 516 + RISE_DURATION; // 606
export const SHINE = LOGO_DONE + 6;
// Final camera push-in onto the logo, then a second shine once it settles.
export const ZOOM = [640, 752];
export const ZOOM_SCALE = 2.2;
export const SHINE_2 = 756;
export const DURATION = 810;
