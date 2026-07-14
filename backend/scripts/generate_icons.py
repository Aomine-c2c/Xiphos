# generate_icons.py
# ─────────────────────────────────────────────────────────────────────────────
# Generates all required Tauri icon sizes from a source PNG.
# Requires: pip install Pillow
#
# Usage:
#   python scripts/generate_icons.py [source_image.png]
#
# If no source is provided, a default Xiphos icon is drawn programmatically.
# ─────────────────────────────────────────────────────────────────────────────

import sys
import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Installing Pillow...")
    os.system(f"{sys.executable} -m pip install Pillow")
    from PIL import Image, ImageDraw, ImageFont

ICONS_DIR = Path(__file__).parent.parent / "src-tauri" / "icons"
ICONS_DIR.mkdir(parents=True, exist_ok=True)


def draw_xiphos_icon(size: int) -> Image.Image:
    """Draw a programmatic Xiphos icon if no source PNG is supplied."""
    img = Image.new("RGBA", (size, size), (10, 15, 30, 255))
    draw = ImageDraw.Draw(img)

    cx, cy = size // 2, size // 2
    scale = size / 256

    # Background glow circle
    glow_r = int(90 * scale)
    for i in range(glow_r, 0, -1):
        alpha = int(40 * (i / glow_r))
        draw.ellipse(
            [cx - i, cy - i, cx + i, cy + i],
            fill=(0, 212, 255, alpha),
        )

    # Sword blade (upward triangle)
    tip = (cx, int(cy - 90 * scale))
    bl = (int(cx - 18 * scale), int(cy + 60 * scale))
    br = (int(cx + 18 * scale), int(cy + 60 * scale))
    draw.polygon([tip, bl, br], fill=(255, 185, 0, 220))

    # Center line (shine)
    draw.line(
        [(cx, int(cy - 85 * scale)), (cx, int(cy + 55 * scale))],
        fill=(255, 240, 180, 180),
        width=max(1, int(2 * scale)),
    )

    # Cross guard
    guard_y = int(cy + 40 * scale)
    guard_w = int(40 * scale)
    draw.rectangle(
        [cx - guard_w, guard_y - int(4 * scale), cx + guard_w, guard_y + int(4 * scale)],
        fill=(255, 185, 0, 200),
    )

    # Trend chart line (bottom)
    points = []
    steps = 8
    chart_y_base = int(cy + 80 * scale)
    for i in range(steps + 1):
        x = int((cx - 60 * scale) + i * (120 * scale / steps))
        y = chart_y_base - int([0, 5, 3, 8, 6, 12, 10, 16, 20][i % 9] * scale)
        points.append((x, y))
    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=(0, 212, 255, 200), width=max(1, int(2 * scale)))

    return img


def make_icons(source_path: str | None = None):
    if source_path and Path(source_path).exists():
        base = Image.open(source_path).convert("RGBA")
        print(f"Using source: {source_path}")
    else:
        print("No source image provided — drawing default Xiphos icon.")
        base = draw_xiphos_icon(1024)
        base.save(ICONS_DIR / "source_1024.png")

    sizes = {
        "32x32.png": 32,
        "128x128.png": 128,
        "128x128@2x.png": 256,
        "icon.png": 512,
        "tray.png": 32,
    }

    for filename, px in sizes.items():
        resized = base.resize((px, px), Image.LANCZOS)
        out_path = ICONS_DIR / filename
        resized.save(out_path)
        print(f"  -> {out_path} ({px}x{px})")

    # ICO (multi-size)
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    ico_frames = [base.resize(s, Image.LANCZOS) for s in ico_sizes]
    ico_path = ICONS_DIR / "icon.ico"
    ico_frames[0].save(ico_path, format="ICO", sizes=ico_sizes, append_images=ico_frames[1:])
    print(f"  -> {ico_path} (multi-size ICO)")

    print(f"\nAll icons written to: {ICONS_DIR}")


if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else None
    make_icons(src)
