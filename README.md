# UTAS Quality Day 2026 — Promo Video

A ~36 second (1920×1080, 30 fps) promo video built with [Remotion](https://www.remotion.dev).
It's meant to open the Quality Day inauguration ceremony in front of the Event Sponsor.

The latest render is in [`renders/quality-day-promo.mp4`](renders/quality-day-promo.mp4).

## Storyboard

| # | Scene | Time | What happens |
|---|-------|------|--------------|
| 1 | Opening | 0–5s | The logo's four bars rise, then the university name appears in Arabic and English. "Proudly Presents" |
| 2 | Title | 4–10s | Campus photo with a slow push-in. **QUALITY DAY** drops in letter by letter with يوم الجودة, and satin wave ribbons |
| 3 | The Journey | 10–16s | A **60 days** counter ring, "Two Months in the Making", key stats and an animated 8-week timeline |
| 4 | Our Commitment | 16–22s | A diagonal split reveals the second campus photo, with the values Excellence, Innovation and Continuous Improvement |
| 5 | Inauguration | 21–28s | Golden light rays and "Under the Patronage of / تحت رعاية" with the Event Sponsor's name in an animated frame |
| 6 | Logo finale | 27–36s | Light flash, swoosh arcs that draw the new logo in, a particle burst, a shine sweep, then the title, university name and tagline |

## Customise

All text is in `src/schema.ts` (`defaultPromoProps`). You can also edit it live in Remotion Studio's props panel.

- `sponsorName` / `sponsorTitle`: **put the patron's real name and title here before the ceremony.**
- `monthsOfWork`: drives the days counter, the weeks stat and the "Two Months" headline.
- `musicFile`: put an audio file in `public/` (e.g. `music.mp3`) and set `musicFile: 'music.mp3'`. It fades in and out automatically.

## Commands

```bash
npm install
npm run studio   # live preview and editing
npm run render   # writes out/quality-day-promo.mp4
```

## Assets

- `public/images/quality-day-logo.png`: the new logo, with its white background converted to transparency
- `public/images/campus-*.jpg`: campus photos
- `public/fonts/`: Montserrat (Latin) and Cairo (Arabic), bundled locally so renders don't need the network
