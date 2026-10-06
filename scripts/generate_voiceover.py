"""Generate the male voice-over with Kokoro (open neural TTS, runs offline).

Usage:
    pip install kokoro-onnx soundfile numpy
    # model files: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
    python scripts/generate_voiceover.py /path/to/kokoro-v1.0.onnx /path/to/voices-v1.0.bin

Reads voiceover/script.json, writes public/audio/vo/<id>.wav and
src/audio/voiceover.json (frame placement + duration for Remotion).
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
OUT_SR = 48000


def trim(audio: np.ndarray, threshold: float = 0.004, pad: int = 1200) -> np.ndarray:
    idx = np.where(np.abs(audio) > threshold)[0]
    if len(idx) == 0:
        return audio
    return audio[max(0, idx[0] - pad): idx[-1] + pad]


def resample(audio: np.ndarray, sr: int, target: int) -> np.ndarray:
    if sr == target:
        return audio
    from scipy.signal import resample_poly

    g = math.gcd(sr, target)
    return resample_poly(audio, target // g, sr // g)


def polish(audio: np.ndarray, sr: int) -> np.ndarray:
    """Broadcast-style finishing: high-pass, gentle presence lift, soft compression, peak normalise."""
    from scipy.signal import butter, sosfilt

    audio = sosfilt(butter(2, 70, "highpass", fs=sr, output="sos"), audio)
    # Add a little chest warmth (low shelf ~150 Hz) and presence (~3 kHz) by parallel band boosts.
    warmth = sosfilt(butter(2, [110, 240], "bandpass", fs=sr, output="sos"), audio)
    presence = sosfilt(butter(2, [2500, 4500], "bandpass", fs=sr, output="sos"), audio)
    audio = audio + 0.35 * warmth + 0.25 * presence
    # Soft-knee compression via tanh saturation on a pre-gained signal.
    peak = np.max(np.abs(audio)) or 1.0
    audio = np.tanh(1.6 * audio / peak) / np.tanh(1.6)
    # Short fades so clips never click.
    fade = int(0.012 * sr)
    audio[:fade] *= np.linspace(0, 1, fade)
    audio[-fade:] *= np.linspace(1, 0, fade)
    return (audio / np.max(np.abs(audio)) * 0.89).astype(np.float32)


def main() -> None:
    model, voices = sys.argv[1], sys.argv[2]
    script = json.loads((ROOT / "voiceover/script.json").read_text())
    kokoro = Kokoro(model, voices)
    voice = script["voice"]
    out_dir = ROOT / "public/audio/vo"
    out_dir.mkdir(parents=True, exist_ok=True)

    manifest = []
    for line in script["lines"]:
        samples, sr = kokoro.create(line["text"], voice=voice, speed=script["speed"], lang="en-us")
        audio = resample(trim(np.asarray(samples, dtype=np.float64)), sr, OUT_SR)
        audio = polish(audio, OUT_SR)
        path = out_dir / f"{line['id']}.wav"
        sf.write(path, audio, OUT_SR, subtype="PCM_16")
        frames = math.ceil(len(audio) / OUT_SR * FPS)
        manifest.append({"id": line["id"], "src": f"audio/vo/{line['id']}.wav", "from": line["from"], "durationInFrames": frames, "text": line["text"]})
        print(f"{line['id']}: frames {line['from']}–{line['from'] + frames} ({len(audio) / OUT_SR:.2f}s)")

    (ROOT / "src/audio/voiceover.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
