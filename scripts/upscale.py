"""4x AI super-resolution (Real-ESRGAN x4plus) with the ncnn inference library, on the CPU.

Usage:
    pip install ncnn numpy pillow
    # realesrgan-x4plus.param/.bin from the Real-ESRGAN ncnn release (model files only)
    python scripts/upscale.py <model_dir> <input> <output> [--alpha]

The image is processed in overlapping tiles that are feathered together, so no seams show.
With --alpha, the alpha channel is upscaled with Lanczos and reattached.
"""
import sys
import time

import ncnn
import numpy as np
from PIL import Image

TILE = 192
PAD = 16
SCALE = 4


def load_net(model_dir: str) -> ncnn.Net:
    net = ncnn.Net()
    net.opt.use_vulkan_compute = False
    net.opt.num_threads = 4
    net.load_param(f"{model_dir}/realesrgan-x4plus.param")
    net.load_model(f"{model_dir}/realesrgan-x4plus.bin")
    return net


def run_tile(net: ncnn.Net, tile: np.ndarray, out_name: str) -> np.ndarray:
    # ncnn wants CHW float32 in 0..1. ncnn.Mat wraps the numpy buffer without copying, so keep
    # `chw` referenced until extraction is done, and copy the result out before the extractor goes.
    chw = np.ascontiguousarray(tile.transpose(2, 0, 1), dtype=np.float32)
    mat = ncnn.Mat(chw)
    ex = net.create_extractor()
    ex.input("data", mat)
    _, out = ex.extract(out_name)
    result = np.array(out, copy=True).transpose(1, 2, 0)
    del ex, mat, chw
    return result


def upscale(net: ncnn.Net, img: np.ndarray, out_name: str) -> np.ndarray:
    h, w, _ = img.shape
    out = np.zeros((h * SCALE, w * SCALE, 3), np.float32)
    weight = np.zeros((h * SCALE, w * SCALE, 1), np.float32)
    # Feathered blending window for one padded output tile.
    start = time.time()
    tiles = [(y, x) for y in range(0, h, TILE) for x in range(0, w, TILE)]
    for i, (y, x) in enumerate(tiles):
        y0, x0 = max(0, y - PAD), max(0, x - PAD)
        y1, x1 = min(h, y + TILE + PAD), min(w, x + TILE + PAD)
        res = run_tile(net, img[y0:y1, x0:x1], out_name)
        th, tw = res.shape[:2]
        ramp = PAD * SCALE
        wy = np.minimum(1, np.minimum(np.arange(th) + 1, th - np.arange(th)) / ramp)
        wx = np.minimum(1, np.minimum(np.arange(tw) + 1, tw - np.arange(tw)) / ramp)
        # Image borders get full weight (nothing to blend with there).
        if y0 == 0:
            wy[: th // 2] = np.maximum(wy[: th // 2], 1)
        if y1 == h:
            wy[th // 2 :] = np.maximum(wy[th // 2 :], 1)
        if x0 == 0:
            wx[: tw // 2] = np.maximum(wx[: tw // 2], 1)
        if x1 == w:
            wx[tw // 2 :] = np.maximum(wx[tw // 2 :], 1)
        wgt = (wy[:, None] * wx[None, :])[..., None]
        out[y0 * SCALE : y0 * SCALE + th, x0 * SCALE : x0 * SCALE + tw] += res * wgt
        weight[y0 * SCALE : y0 * SCALE + th, x0 * SCALE : x0 * SCALE + tw] += wgt
        if i % 10 == 0:
            print(f"  tile {i + 1}/{len(tiles)}  {time.time() - start:.0f}s", flush=True)
    return np.clip(out / np.maximum(weight, 1e-6), 0, 1)


def main() -> None:
    model_dir, src, dst = sys.argv[1:4]
    alpha = "--alpha" in sys.argv
    # The final layer's output blob: the 6th field of the last line of the .param file.
    out_name = open(f"{model_dir}/realesrgan-x4plus.param").read().strip().split("\n")[-1].split()[5]
    net = load_net(model_dir)
    im = Image.open(src)
    rgba = im.convert("RGBA")
    rgb = np.asarray(rgba.convert("RGB")).astype(np.float32) / 255
    if alpha:
        # Composite onto white first so transparent pixels carry sensible colour.
        a = np.asarray(rgba)[..., 3:4].astype(np.float32) / 255
        rgb = rgb * a + (1 - a)
    up = upscale(net, rgb, out_name)
    result = Image.fromarray((up * 255 + 0.5).astype(np.uint8), "RGB")
    if alpha:
        a_up = rgba.getchannel("A").resize(result.size, Image.LANCZOS)
        result = result.convert("RGBA")
        result.putalpha(a_up)
    if dst.lower().endswith((".jpg", ".jpeg")):
        result.save(dst, quality=95, subsampling=0)
    else:
        result.save(dst, optimize=True)
    print(f"{src} {im.size} -> {dst} {result.size}")


if __name__ == "__main__":
    main()
