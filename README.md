# UTAS Quality Day 2026: New Logo Unveiling

Videos for unveiling the new Quality Day logo at the inauguration ceremony, built with [Remotion](https://www.remotion.dev). `renders/logo-screen.png` is the final frame of the current video, for slides or a fallback.

## Current: "Golden Unveil" (`renders/golden-unveil.mp4`)

The campus at dusk (`public/images/campus-dusk.jpg`), 1920×1080, 27s, with sound.

| Time | What happens |
|------|--------------|
| 0–1s | Fade in on the campus at dusk |
| 1–11s | Gold countdown **10 → 1** in the top-left, under "Quality Day / يوم الجودة". A gold light with a sparkling tail travels around the building (towers, crenellated walls, dome, base), leaving a glowing trace |
| 11–12s | The loop closes: the outline flashes and the building lights up |
| 12–20s | The logo arrives **slowly, part by part**. The wave, then each of the four bars, the Q ring and the building rise from below the frame with gold trails, and settle one after another in the sky above the dome, just left of the flag |
| 20–27s | Gold shine across the logo, then the camera glides in (2.2×) to centre the logo, with a second shine as it settles |

- **Building outline:** traced by hand in `src/gold/outline.ts`, in photo pixel coordinates. The base line is routed above the billboard so the light never crosses it.
- **Logo:** position and size (above the dome, left of the flag) are set by `LOGO_PHOTO` in `src/scenes/GoldenUnveil.tsx`.
- **Timing:** the countdown, light-up, the order each logo part rises in and their speed are all in `src/gold/timing.ts`.
- **Sound** (`src/audio/GoldSoundtrack.tsx`):
  - A shimmering trail that pans with the light around the building, and a beat on each number.
  - A riser, then a hit as the outline completes.
  - A whoosh and chime for each logo part, and a sparkle on the shine.

## Earlier concept: "Every Point Counts"

Renders are in `renders/every-point-counts/`. Re-render with `--only=EveryPointCounts,EveryPointCountsVertical`.

The whole video is made of **6,000 points of light**. Each one stands for a contribution: a person, an effort, a day of the two months of work.

| Time | What happens |
|------|--------------|
| 0–2s | Points drift scattered across a night sky. "60 days · countless contributions / ٦٠ يومًا من العمل… وإسهامات لا تُحصى" |
| 2–12s | The points swarm together to form each number, **10 → 1**, regrouping every second. 3-2-1 glow orange |
| 12–13s | The "1" bursts outward and dawn floods the screen |
| 13–15s | The points fly back and settle left to right into the **new logo**, each taking its real colour |
| 15–25s | The crisp logo resolves out of the points, then QUALITY DAY 2026, يوم الجودة, the university name and **"Quality is Everyone's Responsibility · الجودة مسؤولية الجميع"** |

Files in [`renders/every-point-counts/`](renders/every-point-counts/):
- `every-point-counts.mp4`: 1920×1080, 25s, with sound.
- `every-point-counts-vertical-9x16.mp4`: for Instagram Reels, Stories and WhatsApp status.

How it works: the digits are sampled from the real Montserrat glyphs and the logo from its image (`src/particles/targets.ts`), with a seeded random generator so every render is identical. Points are matched between shapes along a Hilbert curve, so each morph flows coherently instead of scrambling. Timing lives in `src/particles/timing.ts`.

Sound (`src/audio/ParticleSoundtrack.tsx`):
- A flutter each time the points regroup and a beat as each number locks in.
- A riser into the burst, then a cinematic hit as the music resolves.
- A crystalline cascade as the points become the logo, and a shimmer and sparkle on the reveal.

All of it is synthesised by `scripts/generate_audio.py` and mastered to -16 LUFS.

## Previous concept

The ring countdown with the logo building from its parts, plus standby and hold loops, is still available. It's in Studio under **Previous-concept**, and its renders are in `renders/previous/`. Re-render it with `node scripts/render-all.mjs --only=CountdownReveal,Standby,LogoLoop,CountdownRevealVertical`.

### Previous concept: what happens in the reveal

1. **Countdown (0–11s):** One number per second inside a ring that sweeps each second, with a pulse on every beat. **3 · 2 · 1** turn orange with a warm glow and a slow zoom.
2. **Flash (11–12s):** After "1" the ring rushes outward into a white flash.
3. **The logo builds itself (12–15s):** The Q ring draws itself, the four bars rise like a growth chart, the wave ribbon sweeps in, and the building rises into place. Then a particle burst and a shine.
4. **Titles (15–22s):** QUALITY DAY 2026, يوم الجودة, the university name and the tagline.

The build uses `public/images/logo-layers/`: the logo cut into parts by `scripts/split_logo.py`. Every pixel belongs to exactly one layer, so the assembled logo is identical to the original.

### Previous concept: audio

All sound is synthesised by `scripts/generate_audio.py`, so it's royalty-free:

- A beat on every number (heavier for 3-2-1) and soft half-second ticks.
- A riser into the flash, where a cinematic hit lands and the music resolves into a bright major chord.
- A swish as the ring draws, rising notes as each bar lands, a whoosh for the wave, a shimmer for the building, and a hit, shimmer and sparkle when the logo completes.
- Mastered to -16 LUFS with a -1.5 dBTP ceiling by `scripts/master.mjs`.

## Customise

- Text (kicker, intro line, title, year, university name, tagline, standby note): `src/schema.ts`. You can also edit it live in Remotion Studio's props panel.
- Countdown length: `COUNT_FROM` in `src/scenes/Countdown.tsx`. Then update `src/audio/timing.json` (Studio warns if it's stale) and re-run `python scripts/generate_audio.py`.
- Logo build timing: `BUILD` in `src/components/LogoBuild.tsx`. The sound cues follow automatically.
- `musicFile`: set a file in `public/` to replace the built-in music bed.

## Commands

```bash
npm install
npm run studio                    # live preview and editing
npm run render                    # render the current concept into renders/
node scripts/render-all.mjs --only=EveryPointCounts   # one composition only
pip install numpy scipy soundfile pillow
npm run generate:audio            # rebuild SFX and music
npm run split:logo                # rebuild logo layers after changing the logo
```
