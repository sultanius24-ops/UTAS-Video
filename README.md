# UTAS Quality Day 2026: New Logo Countdown

A 21 second (1920×1080, 30 fps) countdown that ends with the new Quality Day logo appearing. It's built with [Remotion](https://www.remotion.dev) and meant for the logo unveiling at the inauguration ceremony.

The latest render is in [`renders/quality-day-promo.mp4`](renders/quality-day-promo.mp4).

## Sequence

| Time | What happens |
|------|--------------|
| 0–1s | "Unveiling the New Logo / تدشين الشعار الجديد" and the countdown ring settle in |
| 1–11s | Countdown **10 → 1**, one number per second. A ring sweeps each second, an outer segment lights per second, and a shockwave pulses on each beat |
| 8–11s | Final stretch **3 · 2 · 1**: orange numbers, warm glow, slow camera push and a riser |
| 11–12s | White flash |
| 12–21s | Logo reveal: swoosh arcs, logo lands with a hit and particle burst, a shine sweeps across, then QUALITY DAY 2026, يوم الجودة, the university name and the tagline. The logo holds to the end |

## Audio

Everything is synthesised locally by `scripts/generate_audio.py`, so there are no licensing issues:

- A thump, click and ping on every number (heavier for 3-2-1) and a soft "tock" on each half second.
- A riser into the flash, a cinematic hit and shimmer on the logo, and a sparkle on the shine.
- Music bed: a suspense drone that opens up through the countdown, then resolves to a bright D major chord with a gentle arpeggio when the logo lands.
- `scripts/master.mjs` normalises the final mix to -16 LUFS with a -1.5 dBTP ceiling.

The cue sheet is in `src/audio/Soundtrack.tsx`.

## Customise

- Text (kicker, title, year, university name, tagline): `src/schema.ts`. You can also edit it live in Remotion Studio's props panel.
- Countdown length: `COUNT_FROM` in `src/scenes/Countdown.tsx`. Then update `src/audio/timing.json` (Studio warns if it's stale) and re-run `python scripts/generate_audio.py` so the music follows.
- `musicFile`: set a file in `public/` to replace the built-in music bed.

## Commands

```bash
npm install
npm run studio   # live preview and editing
npm run render   # renders and masters out/quality-day-promo.mp4
pip install numpy scipy soundfile && npm run generate:audio   # rebuild SFX and music
```
