# UTAS Quality Day 2026: New Logo Unveiling Package

Videos for unveiling the new Quality Day logo at the inauguration ceremony, built with [Remotion](https://www.remotion.dev). All renders are in [`renders/`](renders/).

## Ceremony running order

| # | File | Length | Use |
|---|------|--------|-----|
| 1 | `1-standby-loop.mp4` | 20s loop | On screen before the unveiling. Set the player to **repeat**. Silent |
| 2 | `2-countdown-logo-reveal.mp4` | 22s | Play when the patron starts the unveiling: countdown 10 → 1, then the logo builds itself. With sound |
| 3 | `3-logo-hold-loop.mp4` | 20s loop | Switch to this right after #2 ends to keep the logo on screen. Set to **repeat**. Silent |
| – | `social-vertical-9x16.mp4` | 22s | Vertical cut of #2 for Instagram Reels, Stories and WhatsApp status |
| – | `logo-screen.png` | still | Logo screen image for slides, the website or a fallback |

The background motion in #2 runs on the same clock as #3, so #2's last frame flows straight into #3's first and the switch is invisible. Both loops repeat seamlessly; the jump at the loop point measures the same as a normal frame-to-frame change.

## What happens in the reveal

1. **Countdown (0–11s):** One number per second inside a ring that sweeps each second, with a pulse on every beat. **3 · 2 · 1** turn orange with a warm glow and a slow zoom.
2. **Flash (11–12s):** After "1" the ring rushes outward into a white flash.
3. **The logo builds itself (12–15s):** The Q ring draws itself, the four bars rise like a growth chart, the wave ribbon sweeps in, and the building rises into place. Then a particle burst and a shine.
4. **Titles (15–22s):** QUALITY DAY 2026, يوم الجودة, the university name and the tagline.

The build uses `public/images/logo-layers/`: the logo cut into parts by `scripts/split_logo.py`. Every pixel belongs to exactly one layer, so the assembled logo is identical to the original.

## Audio (reveal videos only)

All sound is synthesised by `scripts/generate_audio.py`, so it's royalty-free:

- A beat on every number (heavier for 3-2-1) and soft half-second ticks.
- A riser into the flash, where a cinematic hit lands and the music resolves into a bright major chord.
- A swish as the ring draws, rising notes as each bar lands, a whoosh for the wave, a shimmer for the building, and a hit, shimmer and sparkle when the logo completes.
- Mastered to -16 LUFS with a -1.5 dBTP ceiling by `scripts/master.mjs`.

## Customise

- Text (kicker, title, year, university name, tagline, standby note): `src/schema.ts`. You can also edit it live in Remotion Studio's props panel.
- Countdown length: `COUNT_FROM` in `src/scenes/Countdown.tsx`. Then update `src/audio/timing.json` (Studio warns if it's stale) and re-run `python scripts/generate_audio.py`.
- Logo build timing: `BUILD` in `src/components/LogoBuild.tsx`. The sound cues follow automatically.
- `musicFile`: set a file in `public/` to replace the built-in music bed.

## Commands

```bash
npm install
npm run studio                    # live preview and editing
npm run render                    # render the whole package into renders/
node scripts/render-all.mjs --only=CountdownReveal   # one composition only
pip install numpy scipy soundfile pillow
npm run generate:audio            # rebuild SFX and music
npm run split:logo                # rebuild logo layers after changing the logo
```
