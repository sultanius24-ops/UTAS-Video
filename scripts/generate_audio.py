"""Synthesise the sound design for the countdown: SFX one-shots and a music bed.

Everything is generated from scratch with numpy/scipy (seeded, so output is
reproducible and royalty-free). Usage:

    pip install numpy scipy soundfile
    python scripts/generate_audio.py

Writes public/audio/sfx/*.wav and public/audio/music-bed.wav.
"""
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
FPS = 30
rng = np.random.default_rng(2026)


# ---------------------------------------------------------------- helpers
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "lowpass", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "highpass", fs=SR, output="sos"), x, axis=0)


def noise(n):
    return rng.standard_normal(n)


def pink(n):
    # Voss-style approximation: sum of octave-filtered noise.
    w = noise(n)
    return lp(w, 4000) * 0.6 + lp(w, 900) * 1.2 + lp(w, 200) * 1.6


def svf_bandpass(x, fc, q=2.0):
    """Chamberlin state-variable band-pass with a per-sample cutoff (for sweeps)."""
    out = np.zeros_like(x)
    low = band = 0.0
    damp = 1.0 / q
    f = 2 * np.sin(np.pi * np.clip(fc, 20, SR / 6) / SR)
    for i in range(len(x)):
        high = x[i] - low - damp * band
        band += f[i] * high
        low += f[i] * band
        out[i] = band
    return out


def fit(x, n):
    """Trim or zero-pad a mono signal to exactly n samples."""
    return x[:n] if len(x) >= n else np.pad(x, (0, n - len(x)))


def stereo(mono, pan=0.0):
    """Equal-power pan; pan may be a scalar or per-sample array in [-1, 1]."""
    a = (np.asarray(pan) + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1)


def reverb(x, seconds=2.4, wet=0.3, tone=5000, predelay=0.012):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = np.stack([noise(n), noise(n)], axis=1) * np.exp(-t / (seconds / 6.9))[:, None]
    ir = lp(ir, tone)
    ir = np.vstack([np.zeros((int(predelay * SR), 2)), ir])
    ir /= np.sqrt(np.sum(ir**2, axis=0, keepdims=True))
    if x.ndim == 1:
        x = stereo(x)
    pad = np.vstack([x, np.zeros((len(ir), 2))])
    wet_sig = np.stack([fftconvolve(pad[:, c], ir[:, c])[: len(pad)] for c in range(2)], axis=1)
    return pad * (1 - wet) + wet_sig * wet * 1.6


def finish(x, peak=0.9, tail_fade=0.05):
    if x.ndim == 1:
        x = stereo(x)
    # trim trailing silence
    mag = np.max(np.abs(x), axis=1)
    idx = np.where(mag > 1e-4 * np.max(mag))[0]
    x = x[: idx[-1] + 1] if len(idx) else x
    f = min(int(tail_fade * SR), len(x))
    x[-f:] *= np.linspace(1, 0, f)[:, None]
    return (x / (np.max(np.abs(x)) or 1) * peak).astype(np.float32)


def write(name, x):
    path = ROOT / "public/audio/sfx" / f"{name}.wav"
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(path, finish(x), SR, subtype="PCM_16")
    print(f"sfx/{name}.wav  {len(x) / SR:.2f}s")


# ---------------------------------------------------------------- SFX
def whoosh(dur=1.1, peak=0.45, f_lo=250, f_hi=4200, pan_from=-0.8, pan_to=0.8, body=1.0):
    t = t_axis(dur)
    p = t / dur
    k = peak
    env = np.where(p < k, (p / k) ** 2.2, np.exp(-(p - k) / (1 - k) * 4.5))
    fc = np.where(p < k, f_lo + (f_hi - f_lo) * (p / k) ** 1.5, f_hi * np.exp(-(p - k) * 3.2))
    n = pink(len(t))
    air = svf_bandpass(n, fc, q=1.4) * env
    sub = np.sin(2 * np.pi * (60 + 40 * p) * t) * env**1.5 * 0.35 * body
    pan = pan_from + (pan_to - pan_from) * p
    return reverb(stereo(air + sub, pan), seconds=1.4, wet=0.22)


def impact(dur=3.2, big=True):
    t = t_axis(dur)
    f = 38 + 70 * np.exp(-t * 7)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.9 if big else 0.5))
    body = lp(noise(len(t)), 260) * np.exp(-t / 0.18) * 1.2
    click = hp(noise(len(t)), 2500) * np.exp(-t / 0.012) * 0.5
    x = np.tanh(1.8 * (sub * 1.1 + body + click))
    x *= np.clip((dur - t) / 0.6, 0, 1)  # let the sub die out instead of cutting off
    if not big:
        x *= 0.85
    return reverb(x, seconds=3.0 if big else 1.8, wet=0.35, tone=3000)


def bell(freq, dur=1.6, decay=0.7, bright=1.0):
    t = t_axis(dur)
    partials = [(1, 1.0, 1.0), (2.0, 0.45, 0.7), (2.76, 0.35 * bright, 0.5), (5.4, 0.18 * bright, 0.3), (8.93, 0.08 * bright, 0.2)]
    x = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / (decay * d)) for r, a, d in partials)
    attack = np.minimum(1, t / 0.003)
    return x * attack


def shimmer(dur=2.6, count=22, spread=0.7, base=74):
    n = int(dur * SR)
    out = np.zeros((n, 2))
    scale = [0, 2, 4, 7, 9]  # major pentatonic
    for i in range(count):
        note = base + 12 * rng.integers(0, 3) + scale[rng.integers(0, 5)]
        onset = int(rng.uniform(0, spread) * SR)
        tone = fit(bell(midi(note), dur=dur - onset / SR, decay=rng.uniform(0.4, 0.9), bright=0.6), n - onset)
        out[onset:] += stereo(tone, rng.uniform(-0.9, 0.9)) * rng.uniform(0.3, 1.0)
    return reverb(hp(out, 900), seconds=3.2, wet=0.55, tone=9000)


def sparkle(dur=1.8, notes=(86, 90, 93, 98, 102)):
    n = int(dur * SR)
    out = np.zeros((n, 2))
    for i, note in enumerate(notes):
        onset = int(i * 0.06 * SR)
        out[onset:] += stereo(fit(bell(midi(note), dur=dur - onset / SR, decay=0.35, bright=0.8), n - onset), -0.6 + i * 0.3)
    return reverb(hp(out, 1500), seconds=2.5, wet=0.5, tone=10000)


def pop(note, dur=0.5):
    t = t_axis(dur)
    f = midi(note) * (1 + 0.6 * np.exp(-t / 0.012))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.085)
    x += 0.25 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR) * np.exp(-t / 0.04)
    x += hp(noise(len(t)), 3000) * np.exp(-t / 0.004) * 0.15
    return reverb(x, seconds=1.0, wet=0.25)


def swarm(dur=0.8):
    """Airy flutter of many tiny points moving together."""
    t = t_axis(dur)
    p = t / dur
    env = np.sin(np.pi * p) ** 1.5
    air = svf_bandpass(pink(len(t)), 2200 + 3500 * np.sin(np.pi * p), q=1.8) * env * 0.6
    out = stereo(air, 0.5 * np.sin(2 * np.pi * p))
    for _ in range(14):
        onset = int(rng.uniform(0.05, 0.6) * dur * SR)
        g = fit(bell(midi(rng.choice([86, 88, 90, 93, 95, 98])), dur=0.25, decay=0.05, bright=0.3), len(t) - onset)
        out[onset:] += stereo(g * 0.25, rng.uniform(-0.8, 0.8))
    return reverb(hp(out, 600), seconds=1.2, wet=0.3, tone=9000)


def assemble(dur=2.8, grains=90):
    """Crystalline cascade that rises and thickens as the points settle into the logo."""
    n = int(dur * SR)
    out = np.zeros((n, 2))
    scale = [0, 2, 4, 7, 9]
    for i in range(grains):
        p = (i / grains) ** 0.7
        onset = int(p * (dur - 0.6) * SR)
        note = 74 + 12 * int(p * 2.4) + scale[rng.integers(0, 5)]
        g = fit(bell(midi(note), dur=0.6, decay=0.09, bright=0.5), n - onset)
        out[onset:] += stereo(g * (0.2 + 0.5 * p), rng.uniform(-0.9, 0.9))
    t = t_axis(dur)
    swell = svf_bandpass(pink(len(t)), 1500 + 5000 * (t / dur), q=1.5) * (t / dur) ** 2 * np.clip((dur - t) / 0.4, 0, 1)
    out += stereo(swell * 0.35)
    return reverb(hp(out, 500), seconds=2.6, wet=0.4, tone=10000)


def gold_trail(dur=10.6):
    """Shimmering trail for the light circling the building; pans left -> right -> left with it."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    p = t / dur
    pan = -0.75 * np.cos(2 * np.pi * p)
    env = np.clip(t / 0.8, 0, 1) * np.clip((dur - t) / 0.6, 0, 1)
    air = svf_bandpass(pink(n), 4200 + 1800 * np.sin(2 * np.pi * 0.35 * t), q=2.5) * 0.35
    out = stereo(air * env, pan)
    for _ in range(int(dur * 7)):
        onset = int(rng.uniform(0, dur - 0.3) * SR)
        g = fit(bell(midi(rng.choice([86, 88, 90, 93, 95, 98, 100])), dur=0.5, decay=0.08, bright=0.4), n - onset)
        out[onset:] += stereo(g * rng.uniform(0.08, 0.22) * env[onset], pan[onset])
    return reverb(hp(out, 900), seconds=2.0, wet=0.4, tone=10000)


def riser(dur=2.5, f_lo=300, f_hi=7000, tone=True):
    t = t_axis(dur)
    p = t / dur
    env = p**2.4
    fc = f_lo * (f_hi / f_lo) ** (p**1.3)
    air = svf_bandpass(pink(len(t)), fc, q=2.2) * env
    x = air
    if tone:
        sweep = 110 * (8 ** (p**1.6))
        vib = 1 + 0.01 * np.sin(2 * np.pi * (4 + 10 * p) * t)
        x = x + 0.35 * np.sin(2 * np.pi * np.cumsum(sweep * vib) / SR) * env
        x = x + 0.25 * np.sin(2 * np.pi * np.cumsum(sweep * 1.5 * vib) / SR) * env
    x = stereo(x, 0.4 * np.sin(2 * np.pi * 1.5 * t * p))
    x[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))[:, None]
    return x


def count_hit(final=False, dur=1.6):
    """Countdown beat: sub thump + clock click + short tonal ping (brighter for the final numbers)."""
    t = t_axis(dur)
    f = 42 + 60 * np.exp(-t * 18)
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.32 if final else 0.22))
    click = hp(noise(len(t)), 3000) * np.exp(-t / 0.006) * 0.45
    ping = bell(midi(81 if final else 74), dur=dur, decay=0.25, bright=0.4) * (0.35 if final else 0.22)
    body = lp(noise(len(t)), 400) * np.exp(-t / 0.05) * 0.4
    x = np.tanh(1.5 * (thump + click + ping + body))
    x *= np.clip((dur - t) / 0.3, 0, 1)
    return reverb(x, seconds=2.2 if final else 1.4, wet=0.3 if final else 0.22, tone=4000)


def tock(dur=0.5):
    t = t_axis(dur)
    x = np.sin(2 * np.pi * 1250 * t) * np.exp(-t / 0.01) + hp(noise(len(t)), 2500) * np.exp(-t / 0.004) * 0.4
    return reverb(stereo(x, 0.15), seconds=0.7, wet=0.2)


# ---------------------------------------------------------------- music bed
def saw(freq, t, harmonics=14):
    return sum(np.sin(2 * np.pi * freq * k * t) / k for k in range(1, harmonics + 1))


def music_bed(out_name, total_frames, countdown_end, logo_hit, **_):
    """Suspense drone that tightens through the countdown, a breath of silence, then a bright resolve."""
    dur = total_frames / FPS + 0.5
    n = int(dur * SR)
    t = np.arange(n) / SR
    mix = np.zeros((n, 2))
    end_s, hit_s = countdown_end / FPS, logo_hit / FPS

    # 1) Countdown drone: D sus2 with a filter that slowly opens, plus a rising high tension tone.
    seg = t < hit_s
    tt = t[seg]
    p = tt / hit_s
    drone = np.zeros((seg.sum(), 2))
    for i, note in enumerate([38, 45, 50, 52, 57]):
        for d, pan in ((-0.08, -0.7), (0.0, 0.0), (0.08, 0.7)):
            drone += stereo(saw(midi(note + d), tt, 8) * (0.8 if i == 0 else 0.45), pan)
    # Block-wise low-pass sweep 500 Hz -> 3 kHz
    blocks = 40
    out = np.zeros_like(drone)
    edges = np.linspace(0, len(tt), blocks + 1).astype(int)
    for k in range(blocks):
        fc = 500 * (6 ** (k / blocks))
        lo, hi = max(0, edges[k] - 2400), edges[k + 1]
        filt = lp(drone[lo:hi], fc)
        out[edges[k]:hi] = filt[edges[k] - lo:]
    env = (0.35 + 0.65 * p**1.5) * np.minimum(1, tt / 1.5)
    # Breath of silence right before the hit
    env *= np.clip((hit_s - 0.28 - tt) / 0.12, 0, 1)
    mix[seg] += out * env[:, None] * 0.10
    tension = np.sin(2 * np.pi * midi(81) * tt * (1 + 0.003 * np.sin(2 * np.pi * 6 * tt)))
    tension_env = np.clip((tt - (end_s - 4)) / 4, 0, 1) ** 2 * np.clip((hit_s - 0.28 - tt) / 0.12, 0, 1)
    mix[seg] += stereo(tension * tension_env * 0.05)

    # 2) Resolve: big bright D major chord, sub, and a gentle celebratory arpeggio.
    seg = t >= hit_s
    tt = t[seg] - hit_s
    fade = np.clip((dur - 0.3 - t[seg]) / 3.5, 0, 1)
    env = np.minimum(1, tt / 0.04) * (0.6 + 0.4 * np.exp(-tt / 1.5)) * fade
    chord = np.zeros((seg.sum(), 2))
    for i, note in enumerate([50, 57, 62, 66, 69, 76]):
        for d, pan in ((-0.07, -0.6), (0.0, 0.0), (0.07, 0.6)):
            chord += stereo(saw(midi(note + d), tt, 10) * (0.7 if i == 0 else 0.42), pan)
    mix[seg] += lp(chord, 3200) * env[:, None] * 0.10
    mix[seg] += stereo(np.sin(2 * np.pi * midi(38) * tt) * env * 0.16)
    tt_pl = t_axis(1.2)
    arp = [74, 78, 81, 86, 81, 78]
    s_time, k = hit_s + 1.0, 0
    while s_time < dur - 2.5:
        note = arp[k % len(arp)]
        pluck = (np.sin(2 * np.pi * midi(note) * tt_pl) + 0.3 * np.sin(4 * np.pi * midi(note) * tt_pl)) * np.exp(-tt_pl / 0.4)
        pluck *= np.minimum(1, tt_pl / 0.004)
        i0 = int(s_time * SR)
        piece = stereo(lp(pluck, 4000), 0.5 * np.sin(k * 0.9)) * 0.07 * min(1, (s_time - hit_s - 1.0) / 1.5 + 0.3)
        mix[i0 : i0 + len(piece)] += piece[: n - i0]
        s_time += 0.3
        k += 1

    mix = reverb(mix, seconds=3.5, wet=0.33, tone=5000)[:n]
    mix[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]
    mix = np.tanh(mix / (np.max(np.abs(mix)) or 1) * 1.2)
    mix = (mix / np.max(np.abs(mix)) * 0.85).astype(np.float32)
    path = ROOT / "public/audio" / out_name
    sf.write(path, mix, SR, subtype="PCM_16")
    print(f"{out_name}  {len(mix) / SR:.2f}s")


if __name__ == "__main__":
    import json

    timing = json.loads((ROOT / "src/audio/timing.json").read_text())
    write("count-hit", count_hit())
    write("count-hit-final", count_hit(final=True))
    write("tock", tock())
    write("whoosh-soft", whoosh(0.9, 0.45, 600, 6000, -0.4, 0.4, body=0.3))
    write("whoosh-reverse", whoosh(1.0, 0.45, 400, 5200, 0.8, -0.8))
    write("impact-big", impact(3.4, big=True))
    write("impact-soft", impact(2.2, big=False))
    for i, note in enumerate([74, 78, 81, 86]):
        write(f"pop-{i + 1}", pop(note))
    write("shimmer", shimmer())
    write("shimmer-soft", shimmer(2.0, count=10, spread=0.4, base=79))
    write("sparkle", sparkle())
    write("riser-long", riser(2.6))
    write("whoosh-big", whoosh(1.2, 0.5, 220, 4800))
    write("swarm", swarm())
    write("assemble", assemble())
    write("gold-trail", gold_trail())
    # One music bed per video, each timed by its entry in timing.json.
    for out_name, bed in timing.items():
        music_bed(out_name, **bed)
