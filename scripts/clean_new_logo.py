#!/usr/bin/env python3
"""
Aggressively remove white/near-white background from the new logo PNG.
- Any pixel where R>220 AND G>220 AND B>220 is made fully transparent
- Also uses brightness-based detection: brightness > 230 -> transparent
- Edge feathering for smooth anti-aliased edges
- Generates all PWA icons from the cleaned logo
"""

from PIL import Image
import os

# Paths
SRC = '/home/z/my-project/upload/57989c34-cdd2-453e-97e4-0361a7987ec8.png'
OUT_LOGO = '/home/z/my-project/public/logo.png'
ICONS_DIR = '/home/z/my-project/public/icons'

# Open the source image
img = Image.open(SRC).convert('RGBA')
w, h = img.size
print(f"Source image: {w}x{h}, mode={img.mode}")

# Load pixels
pixels = img.load()

# Phase 1: Aggressive white removal
# Remove any pixel that is "white-ish" - use both color-based and brightness-based detection
white_removed = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        brightness = (r + g + b) / 3.0
        
        # Color-based: if all channels are very high (near-white)
        is_color_white = (r > 220 and g > 220 and b > 220)
        # Brightness-based: if overall brightness is very high
        is_bright_white = brightness > 230
        # Also catch very light tints: if max channel > 240 and min channel > 200
        is_light_tint = (max(r, g, b) > 240 and min(r, g, b) > 200 and brightness > 220)
        
        if is_color_white or is_bright_white or is_light_tint:
            pixels[x, y] = (r, g, b, 0)  # Fully transparent
            white_removed += 1

print(f"Phase 1: Removed {white_removed} white/near-white pixels")

# Phase 2: Edge feathering - for semi-transparent pixels near the boundary
# Smooth the alpha channel at edges
for y in range(1, h - 1):
    for x in range(1, w - 1):
        r, g, b, a = pixels[x, y]
        if a > 0 and a < 255:
            # Check if this is a transition pixel (neighbors are transparent)
            neighbors_transparent = 0
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr, ng, nb, na = pixels[x + dx, y + dy]
                if na == 0:
                    neighbors_transparent += 1
            # If surrounded by transparent, reduce alpha more
            if neighbors_transparent >= 3:
                pixels[x, y] = (r, g, b, max(0, a - 80))

# Phase 3: Remove any remaining very light pixels that might look white on dark backgrounds
# Second pass with slightly lower threshold to catch remaining near-white fringes
second_pass = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if a > 0:  # Only check non-fully-transparent pixels
            brightness = (r + g + b) / 3.0
            # If still very bright and not part of the logo's intentional colors
            if brightness > 215 and (r > 210 and g > 210 and b > 210):
                pixels[x, y] = (r, g, b, 0)
                second_pass += 1

print(f"Phase 3: Second pass removed {second_pass} more light pixels")

# Save the cleaned logo
img.save(OUT_LOGO, 'PNG')
print(f"Saved cleaned logo to {OUT_LOGO}")

# Verify: count remaining non-transparent pixels
non_transparent = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if a > 0:
            non_transparent += 1
print(f"Remaining non-transparent pixels: {non_transparent}")

# Generate PWA icons
os.makedirs(ICONS_DIR, exist_ok=True)

icon_sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for size in icon_sizes:
    # Regular icon - resize with high quality
    icon = img.resize((size, size), Image.LANCZOS)
    icon_path = os.path.join(ICONS_DIR, f'icon-{size}x{size}.png')
    icon.save(icon_path, 'PNG')
    print(f"Generated {icon_path}")

# Maskable icons (with padding for safe zone)
for size in [192, 512]:
    # Create a canvas with transparent background
    canvas_size = size
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    
    # The logo should fit in the center safe area (40% of the canvas for maskable)
    # Original logo aspect ratio is 572:180 ≈ 3.18:1
    logo_aspect = w / h  # ~3.18
    
    # Calculate size to fit within safe zone
    safe_zone = int(canvas_size * 0.8)  # 80% of canvas for content
    if logo_aspect > 1:
        new_w = safe_zone
        new_h = int(safe_zone / logo_aspect)
    else:
        new_h = safe_zone
        new_w = int(safe_zone * logo_aspect)
    
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    
    # Center on canvas
    x_offset = (canvas_size - new_w) // 2
    y_offset = (canvas_size - new_h) // 2
    canvas.paste(resized, (x_offset, y_offset), resized)
    
    maskable_path = os.path.join(ICONS_DIR, f'maskable-icon-{size}x{size}.png')
    canvas.save(maskable_path, 'PNG')
    print(f"Generated {maskable_path}")

# Apple touch icon (180x180)
apple_size = 180
apple_canvas = Image.new('RGBA', (apple_size, apple_size), (0, 0, 0, 0))
logo_aspect = w / h
safe_zone = int(apple_size * 0.85)
if logo_aspect > 1:
    new_w = safe_zone
    new_h = int(safe_zone / logo_aspect)
else:
    new_h = safe_zone
    new_w = int(safe_zone * logo_aspect)
resized = img.resize((new_w, new_h), Image.LANCZOS)
x_offset = (apple_size - new_w) // 2
y_offset = (apple_size - new_h) // 2
apple_canvas.paste(resized, (x_offset, y_offset), resized)
apple_path = os.path.join(ICONS_DIR, 'apple-touch-icon.png')
apple_canvas.save(apple_path, 'PNG')
print(f"Generated {apple_path}")

# Favicon 32x32
favicon = img.resize((32, 32), Image.LANCZOS)
favicon_path = os.path.join(ICONS_DIR, 'favicon-32x32.png')
favicon.save(favicon_path, 'PNG')
print(f"Generated {favicon_path}")

# Also create favicon.ico
favicon_ico = img.resize((32, 32), Image.LANCZOS)
favicon_ico_path = '/home/z/my-project/public/favicon.ico'
favicon_ico.save(favicon_ico_path, 'ICO')
print(f"Generated {favicon_ico_path}")

print("\n✅ All done! Logo and icons generated successfully.")
