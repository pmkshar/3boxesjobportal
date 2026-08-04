#!/usr/bin/env python3
"""
Remove white background from the new logo (ChatGPT Image Jul 27, 2026).
- RGB image with white background
- Aggressive white removal: any pixel where R>220 AND G>220 AND B>220 → transparent
- Also brightness-based: brightness > 230 → transparent
- Generate all PWA icons
"""

from PIL import Image
import os

SRC = '/home/z/my-project/upload/ChatGPT Image Jul 27, 2026, 11_03_38 AM.png'
OUT_LOGO = '/home/z/my-project/public/logo.png'
ICONS_DIR = '/home/z/my-project/public/icons'

# Open source and convert to RGBA
img = Image.open(SRC).convert('RGBA')
w, h = img.size
print(f"Source: {w}x{h}, mode={img.mode}")

pixels = img.load()

# Phase 1: Aggressive white removal
removed = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        brightness = (r + g + b) / 3.0
        
        is_color_white = (r > 220 and g > 220 and b > 220)
        is_bright_white = brightness > 230
        is_light_tint = (max(r, g, b) > 240 and min(r, g, b) > 200 and brightness > 220)
        
        if is_color_white or is_bright_white or is_light_tint:
            pixels[x, y] = (r, g, b, 0)
            removed += 1

print(f"Phase 1: Removed {removed} white pixels")

# Phase 2: Edge feathering
for y in range(1, h - 1):
    for x in range(1, w - 1):
        r, g, b, a = pixels[x, y]
        if a > 0 and a < 255:
            neighbors_trans = 0
            for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
                if pixels[x+dx, y+dy][3] == 0:
                    neighbors_trans += 1
            if neighbors_trans >= 3:
                pixels[x, y] = (r, g, b, max(0, a - 80))

# Phase 3: Second pass for remaining light pixels
second_pass = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if a > 0:
            brightness = (r + g + b) / 3.0
            if brightness > 215 and (r > 210 and g > 210 and b > 210):
                pixels[x, y] = (r, g, b, 0)
                second_pass += 1

print(f"Phase 3: Removed {second_pass} more light pixels")

# Save logo
img.save(OUT_LOGO, 'PNG')
print(f"Saved logo to {OUT_LOGO}")

# Verify no white traces
white_remaining = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if a > 0 and r > 230 and g > 230 and b > 230:
            white_remaining += 1
print(f"Remaining near-white visible pixels: {white_remaining}")

# Generate PWA icons
os.makedirs(ICONS_DIR, exist_ok=True)
icon_sizes = [72, 96, 128, 144, 152, 192, 384, 512]

logo_aspect = w / h  # ~1.78

for size in icon_sizes:
    icon = img.resize((size, size), Image.LANCZOS)
    icon_path = os.path.join(ICONS_DIR, f'icon-{size}x{size}.png')
    icon.save(icon_path, 'PNG')
    print(f"Generated {icon_path}")

# Maskable icons
for size in [192, 512]:
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    safe_zone = int(size * 0.8)
    new_w = safe_zone
    new_h = int(safe_zone / logo_aspect)
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    x_off = (size - new_w) // 2
    y_off = (size - new_h) // 2
    canvas.paste(resized, (x_off, y_off), resized)
    canvas.save(os.path.join(ICONS_DIR, f'maskable-icon-{size}x{size}.png'), 'PNG')
    print(f"Generated maskable-icon-{size}x{size}.png")

# Apple touch icon
apple_size = 180
apple_canvas = Image.new('RGBA', (apple_size, apple_size), (0, 0, 0, 0))
safe_zone = int(apple_size * 0.85)
new_w = safe_zone
new_h = int(safe_zone / logo_aspect)
resized = img.resize((new_w, new_h), Image.LANCZOS)
x_off = (apple_size - new_w) // 2
y_off = (apple_size - new_h) // 2
apple_canvas.paste(resized, (x_off, y_off), resized)
apple_canvas.save(os.path.join(ICONS_DIR, 'apple-touch-icon.png'), 'PNG')
print(f"Generated apple-touch-icon.png")

# Favicon
favicon = img.resize((32, 32), Image.LANCZOS)
favicon.save(os.path.join(ICONS_DIR, 'favicon-32x32.png'), 'PNG')
favicon.save('/home/z/my-project/public/favicon.ico', 'ICO')
print(f"Generated favicon.ico")

print("\n✅ Done! Logo and all icons updated.")
