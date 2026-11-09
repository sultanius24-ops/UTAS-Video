"""Build the transparent logo master from the original artwork (white background).

    python scripts/prepare_logo.py <original.webp> [<upscaled_x4.png>] <out.png> [--width 2656]

The white background is turned into true transparency ("colour to alpha"), and the image is
cropped to the artwork. The crop box is measured on the original so an AI-upscaled copy is
cropped to exactly the same framing (just more pixels), then resized to --width.
"""
import argparse

import numpy as np
from PIL import Image


def colour_to_alpha(rgb: np.ndarray) -> np.ndarray:
    inv = 1.0 - rgb
    alpha = inv.max(axis=2)
    alpha = np.where(alpha < 0.02, 0.0, alpha)
    out_rgb = np.clip(1.0 - inv / np.maximum(alpha, 1e-6)[..., None], 0, 1)
    return np.dstack([out_rgb, alpha])


def to_rgba(path: str) -> Image.Image:
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255
    return Image.fromarray((colour_to_alpha(rgb) * 255).round().astype(np.uint8), "RGBA")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("original")
    ap.add_argument("paths", nargs="+", help="[upscaled] out")
    ap.add_argument("--width", type=int, default=2656)
    a = ap.parse_args()
    upscaled, out = (a.paths[0], a.paths[1]) if len(a.paths) == 2 else (None, a.paths[0])

    base = to_rgba(a.original)
    bbox = base.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    src = base
    if upscaled:
        src = to_rgba(upscaled)
        k = src.width / base.width
        bbox = tuple(round(v * k) for v in bbox)
    logo = src.crop(bbox)
    aspect = (bbox[3] - bbox[1]) / (bbox[2] - bbox[0])
    logo = logo.resize((a.width, round(a.width * aspect)), Image.LANCZOS)
    logo.save(out, optimize=True)
    print(f"{out}: {logo.size}, crop {bbox}")


if __name__ == "__main__":
    main()
