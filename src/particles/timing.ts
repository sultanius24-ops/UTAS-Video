// Frame timeline for the "Every Point Counts" reveal (30 fps).
export const PARTICLES = 6000;
export const DIGITS = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
export const FINAL_STRETCH = 3; // 3-2-1 glow orange

export const INTRO_TEXT = [8, 56]; // "60 days..." line while the points drift
export const GATHER = [60, 84]; // scattered points gather into "10"
export const LOCK = DIGITS.map((_, i) => 84 + i * 30); // frame each number locks into place
export const MORPH = 12; // frames for one number to re-form into the next
export const BURST = [372, 386]; // "1" explodes outward
export const DAWN = [368, 402]; // light floods the screen
export const ASSEMBLE = [386, 462]; // points fly in and become the logo
export const LOGO_RESOLVE = [454, 476]; // crisp logo fades in as the points dissolve
export const TITLES = 482;
export const DURATION = 750;
