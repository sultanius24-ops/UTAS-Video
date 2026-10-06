"""Synthesise the sound design for the promo: SFX one-shots and a cinematic music bed.

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
        tone = bell(midi(note), dur=dur - onset / SR, decay=rng.uniform(0.4, 0.9), bright=0.6)
        out[onset:] += stereo(tone, rng.uniform(-0.9, 0.9)) * rng.uniform(0.3, 1.0)
    return reverb(hp(out, 900), seconds=3.2, wet=0.55, tone=9000)


def sparkle(dur=1.8, notes=(86, 90, 93, 98, 102)):
    n = int(dur * SR)
    out = np.zeros((n, 2))
    for i, note in enumerate(notes):
        onset = int(i * 0.06 * SR)
        out[onset:] += stereo(bell(midi(note), dur=dur - onset / SR, decay=0.35, bright=0.8), -0.6 + i * 0.3)
    return reverb(hp(out, 1500), seconds=2.5, wet=0.5, tone=10000)


def pop(note, dur=0.5):
    t = t_axis(dur)
    f = midi(note) * (1 + 0.6 * np.exp(-t / 0.012))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.085)
    x += 0.25 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR) * np.exp(-t / 0.04)
    x += hp(noise(len(t)), 3000) * np.exp(-t / 0.004) * 0.15
    return reverb(x, seconds=1.0, wet=0.25)


def blip(note, dur=0.9):
    t = t_axis(dur)
    x = bell(midi(note), dur=dur, decay=0.22, bright=0.5)
    x += np.sin(2 * np.pi * midi(note - 12) * t) * np.exp(-t / 0.06) * 0.4
    return reverb(x, seconds=1.4, wet=0.3)


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


def reverse_swell(dur=1.4):
    t = t_axis(dur)
    hit = hp(noise(len(t)), 800) * np.exp(-t / 0.25)
    hit += bell(midi(74), dur=dur, decay=0.5, bright=0.4) * 0.6
    wet = reverb(hit, seconds=dur, wet=0.85, tone=8000)[: len(t)]
    return wet[::-1].copy()


def counter_ticks(scene_frames=(18, 120), days=60, dur=3.6):
    """One soft tick each time the on-screen counter advances two days (follows its easing)."""
    n = int(dur * SR)
    out = np.zeros((n, 2))
    start, end = scene_frames
    last = -1
    for frame in range(start, end + 1):
        p = (frame - start) / (end - start)
        eased = 1 - (1 - p) ** 4  # close to the on-screen bezier(0.22, 1, 0.36, 1)
        step = int(days * eased) // 2
        if step != last:
            last = step
            onset = int((frame - start) / FPS * SR)
            t = t_axis(0.06)
            tick = np.sin(2 * np.pi * (2200 + 8 * step) * t) * np.exp(-t / 0.008)
            tick += hp(noise(len(t)), 4000) * np.exp(-t / 0.003) * 0.3
            seg = stereo(tick, rng.uniform(-0.3, 0.3))
            out[onset : onset + len(seg)] += seg[: n - onset]
    return reverb(out, seconds=0.8, wet=0.2)


# ---------------------------------------------------------------- music bed
def saw(freq, t, harmonics=14):
    return sum(np.sin(2 * np.pi * freq * k * t) / k for k in range(1, harmonics + 1))


def music_bed(total_frames, logo_hit, journey_start, patronage_start, finale_start):
    dur = total_frames / FPS + 0.5
    n = int(dur * SR)
    t = np.arange(n) / SR
    mix = np.zeros((n, 2))

    D, Bm7, G, A, Asus = [50, 57, 62, 64, 66], [47, 54, 59, 62, 66], [43, 55, 59, 62, 66], [45, 52, 57, 61, 64], [45, 52, 57, 62, 64]
    hit_s = logo_hit / FPS
    j_s, p_s, f_s = journey_start / FPS, patronage_start / FPS, finale_start / FPS
    chords = [
        (0.0, D), (5.3, Bm7), (j_s, G), (j_s + 3.6, A), (j_s + 7.2, D), (p_s, Bm7),
        (p_s + 3.5, G), (f_s - 1.6, Asus), (f_s + 0.2, A), (hit_s, D),
    ]
    ends = [c[0] for c in chords[1:]] + [dur]

    # Warm detuned pad with slow swells, crossfading between chords.
    for (start, notes), end in zip(chords, ends):
        rel = 1.6 if end < dur else 0.0
        seg = (t >= start) & (t < end + rel)
        tt = t[seg] - start
        att = 1.4 if start > 0 else 2.5
        env = np.minimum(1, tt / att)
        env *= np.where(t[seg] > end, np.maximum(0, 1 - (t[seg] - end) / max(rel, 1e-3)), 1)
        if end >= dur:
            env *= np.clip((dur - 0.3 - t[seg]) / 5.5, 0, 1)  # final chord fades to the end
        voice = np.zeros((seg.sum(), 2))
        for i, note in enumerate(notes):
            for d, pan in ((-0.07, -0.6), (0.0, 0.0), (0.07, 0.6)):
                f = midi(note + d)
                voice += stereo(saw(f, tt, 10) * (0.7 if i == 0 else 0.45), pan)
        voice = lp(voice, 2200 if start < hit_s else 3200)
        mix[seg] += voice * env[:, None] * 0.12
        # Sub on the root
        sub = np.sin(2 * np.pi * midi(notes[0] - 12 if notes[0] > 45 else notes[0]) * tt)
        mix[seg] += stereo(sub * env * 0.12)

    # Pulse section (journey -> values): plucked arpeggio + soft heartbeat kick at 100 bpm.
    beat = 60 / 100
    eighth = beat / 2
    arp_end = p_s - 0.2
    k = 0
    tt_pl = t_axis(0.9)
    pattern = [0, 2, 3, 4, 3, 2, 1, 2]
    s = j_s
    while s < arp_end:
        current = [c for c in chords if c[0] <= s][-1][1]
        note = current[pattern[k % len(pattern)]] + 12
        pluck = (np.sin(2 * np.pi * midi(note) * tt_pl) + 0.3 * np.sin(4 * np.pi * midi(note) * tt_pl)) * np.exp(-tt_pl / 0.28)
        pluck *= np.minimum(1, tt_pl / 0.004)
        fade_in = min(1, (s - j_s) / 2.5)
        i0 = int(s * SR)
        seg = stereo(lp(pluck, 3500), 0.5 * np.sin(k * 0.9)) * 0.10 * fade_in
        mix[i0 : i0 + len(seg)] += seg[: n - i0]
        if k % 4 == 0:
            tk = t_axis(0.45)
            kick = np.sin(2 * np.pi * np.cumsum(45 + 70 * np.exp(-tk * 30)) / SR) * np.exp(-tk / 0.18)
            seg = stereo(kick) * 0.22 * fade_in
            mix[i0 : i0 + len(seg)] += seg[: n - i0]
        s += eighth
        k += 1

    mix = reverb(mix, seconds=3.5, wet=0.35, tone=4500)[:n]
    mix[: int(0.5 * SR)] *= np.linspace(0, 1, int(0.5 * SR))[:, None]
    mix = np.tanh(mix / (np.max(np.abs(mix)) or 1) * 1.2)
    mix = (mix / np.max(np.abs(mix)) * 0.85).astype(np.float32)
    path = ROOT / "public/audio/music-bed.wav"
    sf.write(path, mix, SR, subtype="PCM_16")
    print(f"music-bed.wav  {len(mix) / SR:.2f}s")


if __name__ == "__main__":
    import json

    timing = json.loads((ROOT / "src/audio/timing.json").read_text())
    write("whoosh-big", whoosh(1.2, 0.5, 220, 4800))
    write("whoosh-soft", whoosh(0.9, 0.45, 600, 6000, -0.4, 0.4, body=0.3))
    write("whoosh-reverse", whoosh(1.0, 0.45, 400, 5200, 0.8, -0.8))
    write("impact-big", impact(3.4, big=True))
    write("impact-soft", impact(2.2, big=False))
    write("shimmer", shimmer())
    write("shimmer-soft", shimmer(2.0, count=10, spread=0.4, base=79))
    write("sparkle", sparkle())
    write("ding", reverb(bell(midi(86), 2.4, 0.9, 0.7) + 0.5 * bell(midi(93), 2.4, 0.7, 0.5), seconds=2.6, wet=0.4))
    for i, note in enumerate([74, 76, 78, 81]):
        write(f"pop-{i + 1}", pop(note))
    for i, note in enumerate([74, 76, 78, 81, 86]):
        write(f"blip-{i + 1}", blip(note))
    write("riser-long", riser(2.6))
    write("swell", reverse_swell(1.4))
    write("counter-ticks", counter_ticks())
    music_bed(**timing)
