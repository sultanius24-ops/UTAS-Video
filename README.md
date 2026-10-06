# UTAS Quality Day 2026 — Promo Video

A 40 second (1920×1080, 30 fps) promo video with a male voice-over, sound design and music, built with [Remotion](https://www.remotion.dev).
It's meant to open the Quality Day inauguration ceremony in front of the Event Sponsor.

The latest render is in [`renders/quality-day-promo.mp4`](renders/quality-day-promo.mp4).

## Storyboard

| # | Scene | Time | Voice-over |
|---|-------|------|------------|
| 1 | Opening: logo bars rise, university name | 0–6s | "The University of Technology and Applied Sciences... proudly presents." |
| 2 | Title: **QUALITY DAY** over the campus photo, wave ribbons | 5–11s | "Quality Day... twenty twenty-six." |
| 3 | The Journey: 60-day counter, 8-week timeline | 11–19s | "Two months in the making. Sixty days of planning, teamwork, and dedication... all leading to this moment." |
| 4 | Our Commitment: split-screen photo, values | 18–25s | "Building a culture of quality... through excellence, innovation, and continuous improvement." |
| 5 | Inauguration: Under the Patronage of the Event Sponsor | 24–32s | "Under the patronage of our distinguished event sponsor... we welcome you to the inauguration of Quality Day." |
| 6 | Logo finale: flash, swooshes, logo hit, shine | 31–40s | "Quality Day, twenty twenty-six. Because quality... is a journey of excellence." |

## Audio

Everything is generated locally, so there are no licensing issues:

- **Voice-over**: the male voice `am_michael` from [Kokoro](https://github.com/thewh1teagle/kokoro-onnx), an open neural TTS model. The lines live in `voiceover/script.json`. The generator writes `public/audio/vo/*.wav` and `src/audio/voiceover.json` (frame placement and length).
- **Sound effects**: whooshes on every transition, cinematic hits on the title and logo, pops on the bars and values, counter ticks, milestone blips, shimmers, and a riser into the logo reveal. They are synthesised by `scripts/generate_audio.py`. The cue sheet is in `src/audio/Soundtrack.tsx`.
- **Music bed**: a synthesised cinematic pad in D major, with a pulse under the Journey and Values scenes. It resolves on the logo hit and dips automatically under the voice-over.
- **Master**: `scripts/master.mjs` normalises the final mix to -16 LUFS with a -1.5 dBTP ceiling.

To change the narration (for example, to say the sponsor's name), edit `voiceover/script.json` and regenerate:

```bash
pip install kokoro-onnx soundfile numpy scipy
# model files: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
python scripts/generate_voiceover.py kokoro-v1.0.onnx voices-v1.0.bin
```

If a line ends up longer than its scene, lengthen the scene (`*_DURATION` in `src/scenes/`), move the line's `from`, and update `src/audio/timing.json`. Then re-run `python scripts/generate_audio.py` so the music bed follows. Studio logs a warning if `timing.json` is out of date.

## Customise

All text is in `src/schema.ts` (`defaultPromoProps`). You can also edit it live in Remotion Studio's props panel.

- `sponsorName` / `sponsorTitle`: **put the patron's real name and title here before the ceremony.**
- `monthsOfWork`: drives the days counter, the weeks stat and the "Two Months" headline.
- `musicFile`: leave empty for the built-in music bed, or set a file in `public/` (e.g. `music.mp3`) to replace it. Ducking under the voice-over still applies.

## Commands

```bash
npm install
npm run studio   # live preview and editing
npm run render   # renders and masters out/quality-day-promo.mp4
```

## Assets

- `public/images/quality-day-logo.png`: the new logo, with its white background converted to transparency
- `public/images/campus-*.jpg`: campus photos
- `public/fonts/`: Montserrat (Latin) and Cairo (Arabic), bundled locally so renders don't need the network
