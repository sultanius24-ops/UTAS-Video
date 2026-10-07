"""Split the transparent logo into animation layers (bars, ring, building, waves).

Each layer is a full-size PNG, and every pixel belongs to exactly one layer, so
stacking the layers reproduces the original logo exactly. Usage:

    pip install numpy scipy pillow
    python scripts/split_logo.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/images/quality-day-logo.png"
OUT = ROOT / "public/images/logo-layers"

# Each big connected shape is identified by a point inside it (in logo pixel coordinates).
SEEDS = {
    "bar-1": [(155, 500)],
    "bar-2": [(248, 450)],
    "bar-3": [(352, 259)],
    "bar-4": [(462, 400)],
    "ring": [(889, 146), (1098, 341)],  # Q ring and its orange accent
    "building": [(531, 581), (563, 654)],  # line-art building and its blue base
    "wave": [(400, 700), (1150, 760)],  # blue wave and right-hand ribbon
}

# Unseeded detail pixels inside these boxes (x0, y0, x1, y1) belong to the named layer.
REGIONS = {
    "building": (512, 282, 938, 598),  # windows, flag and plants of the line-art building
    "ring": (528, 0, 570, 160),  # light tip where the Q ring starts
    "wave": (780, 575, 940, 600),  # ribbon highlight just under the building (applied last)
}


def main() -> None:
    rgba = np.asarray(Image.open(SRC).convert("RGBA"))
    alpha = rgba[..., 3] / 255.0
    labels, _ = ndimage.label(alpha > 0.5)

    # Mark every big component with its layer index.
    layer_of_component = {}
    names = list(SEEDS)
    for li, name in enumerate(names):
        for x, y in SEEDS[name]:
            comp = labels[y, x]
            if comp == 0:
                raise SystemExit(f"seed {name} {(x, y)} is not inside a shape")
            layer_of_component[comp] = li
    seeded = np.full(alpha.shape, -1)
    for comp, li in layer_of_component.items():
        seeded[labels == comp] = li

    # Every other visible pixel (edges, small details) joins the nearest seeded shape,
    # except inside regions whose owner is unambiguous.
    _, (iy, ix) = ndimage.distance_transform_edt(seeded < 0, return_indices=True)
    assignment = seeded[iy, ix]
    ys, xs = np.mgrid[0 : alpha.shape[0], 0 : alpha.shape[1]]
    free = seeded < 0
    for name, (x0, y0, x1, y1) in REGIONS.items():
        inside = free & (xs >= x0) & (xs <= x1) & (ys >= y0) & (ys <= y1)
        assignment[inside] = names.index(name)

    OUT.mkdir(parents=True, exist_ok=True)
    total = np.zeros(alpha.shape)
    for li, name in enumerate(names):
        layer = rgba.copy()
        layer[..., 3] = np.where(assignment == li, rgba[..., 3], 0)
        total += layer[..., 3]
        Image.fromarray(layer, "RGBA").save(OUT / f"{name}.png", optimize=True)
        print(f"{name}: {(layer[..., 3] > 0).sum()} px")
    assert np.array_equal(total, rgba[..., 3].astype(float)), "layers must partition the logo"


if __name__ == "__main__":
    main()
