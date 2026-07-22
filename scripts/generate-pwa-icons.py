#!/usr/bin/env python3
"""Generate PWA icons using Pillow (pure Python, no external deps)."""
from PIL import Image, ImageDraw, ImageFont
import os
import math

output_dir = '/home/z/my-project/public/icons'
os.makedirs(output_dir, exist_ok=True)

def draw_3boxes_icon(size):
    """Draw the 3 Boxes Jobs icon at the given size."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background - rounded rectangle (green gradient)
    # Main green: #059669
    # Darker green: #047857
    bg_color = (5, 150, 105)  # #059669
    bg_dark = (4, 120, 87)    # #047857
    
    # Draw rounded rectangle background
    radius = int(size * 0.21)
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=bg_color)
    
    # Calculate box dimensions
    cx, cy = size // 2, int(size * 0.42)  # Center point for boxes
    box_w = int(size * 0.14)
    box_h = int(size * 0.2)
    gap = int(size * 0.04)
    
    # Colors for the 3 boxes
    box_colors = [
        # Front face, Top face, Right face
        ((74, 222, 128), (34, 197, 94)),    # Box 1: lighter green
        ((52, 211, 153), (16, 185, 129)),    # Box 2: medium green  
        ((134, 239, 172), (74, 222, 128)),   # Box 3: lightest green
    ]
    side_color = (22, 163, 74)  # Dark green for side faces
    
    # Box positions (left, middle-elevated, right)
    offsets = [
        (-box_w - gap, int(size * 0.03)),      # Box 1: left, slightly down
        (0, -int(size * 0.04)),                  # Box 2: center, elevated
        (box_w + gap, int(size * 0.015)),        # Box 3: right
    ]
    
    for i, ((x_off, y_off), (front_c, top_c)) in enumerate(zip(offsets, box_colors)):
        bx = cx + x_off - box_w // 2
        by = cy + y_off
        
        # Draw front face
        draw.rectangle(
            [bx, by, bx + box_w, by + box_h],
            fill=front_c
        )
        # Draw right side (darker)
        side_w = max(int(box_w * 0.3), 2)
        draw.rectangle(
            [bx + box_w, by + 2, bx + box_w + side_w, by + box_h],
            fill=side_color
        )
        # Draw top face
        top_h = max(int(box_h * 0.15), 2)
        draw.rectangle(
            [bx, by - top_h, bx + box_w + side_w, by],
            fill=top_c
        )
    
    # Draw "3 Boxes" text at bottom
    text_y = int(size * 0.76)
    font_size = max(int(size * 0.09), 8)
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/english/Tinos-Bold.ttf', font_size)
    except:
        try:
            font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', font_size)
        except:
            font = ImageFont.load_default()
    
    text = "3 Boxes"
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    text_x = (size - tw) // 2
    draw.text((text_x, text_y), text, fill=(255, 255, 255, 230), font=font)
    
    return img

# Generate all icon sizes
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for size in sizes:
    img = draw_3boxes_icon(size)
    out = os.path.join(output_dir, f'icon-{size}x{size}.png')
    img.save(out, 'PNG')
    print(f'Generated {out}')

# Maskable icons (same icon with more padding)
for size in [192, 512]:
    img = draw_3boxes_icon(size)
    out = os.path.join(output_dir, f'maskable-icon-{size}x{size}.png')
    img.save(out, 'PNG')
    print(f'Generated {out}')

# Apple touch icon (180x180)
img = draw_3boxes_icon(180)
out = os.path.join(output_dir, 'apple-touch-icon.png')
img.save(out, 'PNG')
print(f'Generated {out}')

# Favicon 32x32
img = draw_3boxes_icon(32)
out_favicon = os.path.join(output_dir, 'favicon-32x32.png')
img.save(out_favicon, 'PNG')
print(f'Generated {out_favicon}')

# Copy to public root as favicon
out_ico = '/home/z/my-project/public/favicon.ico'
img_ico = draw_3boxes_icon(32)
img_ico.save(out_ico, 'ICO')
print(f'Generated {out_ico}')

# Also save a 192 icon as the main icon in public root
img_192 = draw_3boxes_icon(192)
out_192 = '/home/z/my-project/public/icon-192.png'
img_192.save(out_192, 'PNG')
print(f'Generated {out_192}')

img_512 = draw_3boxes_icon(512)
out_512 = '/home/z/my-project/public/icon-512.png'
img_512.save(out_512, 'PNG')
print(f'Generated {out_512}')

print('\nAll PWA icons generated successfully!')
