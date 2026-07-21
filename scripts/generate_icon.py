#!/usr/bin/env python3
"""Generate the 3 Boxes Jobs Portal app icon with 3 boxes design."""

from PIL import Image, ImageDraw
import os

def create_3boxes_icon(size, output_path):
    """Create a 3 Boxes logo icon: green bg with 3 white boxes."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background: green rounded square
    margin = int(size * 0.06)
    corner_radius = int(size * 0.22)
    bg_color = (0, 200, 83, 255)  # #00C853
    
    # Draw rounded rectangle background
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=corner_radius,
        fill=bg_color
    )
    
    # Draw 3 boxes (cubes) in a cascading arrangement
    # The design: 3 overlapping/stacked rectangles representing 3 boxes
    box_color = (255, 255, 255, 255)  # White
    box_border = (255, 255, 255, 180)  # Semi-transparent white for depth
    
    center_x = size // 2
    center_y = size // 2
    
    # Box dimensions
    box_w = int(size * 0.28)
    box_h = int(size * 0.22)
    box_radius = int(size * 0.04)
    gap = int(size * 0.04)
    
    # Three boxes arranged in a stair-step pattern (bottom-left to top-right)
    # Box 1: bottom-left (largest shadow area)
    # Box 2: middle
    # Box 3: top-right
    
    total_width = box_w * 3 + gap * 2
    total_height = box_h * 3 + gap * 2
    start_x = (size - total_width) // 2
    start_y = (size - total_height) // 2
    
    # Draw 3 boxes in an L-shape / stair pattern
    # Box 1 (bottom-left)
    b1_x = start_x
    b1_y = start_y + (box_h + gap) * 2
    draw.rounded_rectangle(
        [b1_x, b1_y, b1_x + box_w, b1_y + box_h],
        radius=box_radius,
        fill=box_color,
        outline=(0, 150, 60, 120),
        width=max(1, size // 200)
    )
    
    # Box 2 (middle)
    b2_x = start_x + box_w + gap
    b2_y = start_y + box_h + gap
    draw.rounded_rectangle(
        [b2_x, b2_y, b2_x + box_w, b2_y + box_h],
        radius=box_radius,
        fill=box_color,
        outline=(0, 150, 60, 120),
        width=max(1, size // 200)
    )
    
    # Box 3 (top-right)
    b3_x = start_x + (box_w + gap) * 2
    b3_y = start_y
    draw.rounded_rectangle(
        [b3_x, b3_y, b3_x + box_w, b3_y + box_h],
        radius=box_radius,
        fill=box_color,
        outline=(0, 150, 60, 120),
        width=max(1, size // 200)
    )
    
    # Add subtle inner shadow/3D effect to each box
    inner_margin = max(2, size // 40)
    shadow_color = (0, 150, 60, 40)
    
    # Box 1 inner highlight
    draw.rounded_rectangle(
        [b1_x + inner_margin, b1_y + inner_margin, 
         b1_x + box_w - inner_margin, b1_y + box_h - inner_margin],
        radius=max(1, box_radius - inner_margin),
        fill=None,
        outline=shadow_color,
        width=max(1, size // 120)
    )
    # Box 2 inner highlight
    draw.rounded_rectangle(
        [b2_x + inner_margin, b2_y + inner_margin, 
         b2_x + box_w - inner_margin, b2_y + box_h - inner_margin],
        radius=max(1, box_radius - inner_margin),
        fill=None,
        outline=shadow_color,
        width=max(1, size // 120)
    )
    # Box 3 inner highlight
    draw.rounded_rectangle(
        [b3_x + inner_margin, b3_y + inner_margin, 
         b3_x + box_w - inner_margin, b3_y + box_h - inner_margin],
        radius=max(1, box_radius - inner_margin),
        fill=None,
        outline=shadow_color,
        width=max(1, size // 120)
    )
    
    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG')
    print(f'Created icon: {output_path} ({size}x{size})')


# Generate all required icon sizes
base = '/home/z/my-project/mobile-app/assets'
android_base = '/home/z/my-project/mobile-app/android/app/src/main/res'

# Main asset icon
create_3boxes_icon(1024, f'{base}/icon.png')

# Android mipmap icons
mipmap_sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

for folder, size in mipmap_sizes.items():
    output_dir = f'{android_base}/{folder}'
    os.makedirs(output_dir, exist_ok=True)
    create_3boxes_icon(size, f'{output_dir}/ic_launcher.png')
    create_3boxes_icon(size, f'{output_dir}/ic_launcher_round.png')

# Foreground (just the 3 boxes, no background) for adaptive icon
for folder, size in mipmap_sizes.items():
    output_dir = f'{android_base}/{folder}'
    os.makedirs(output_dir, exist_ok=True)
    
    fg_size = size
    fg_img = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
    fg_draw = ImageDraw.Draw(fg_img)
    
    # Just draw 3 white boxes on transparent background
    box_color = (255, 255, 255, 255)
    box_w = int(fg_size * 0.32)
    box_h = int(fg_size * 0.25)
    box_radius = int(fg_size * 0.05)
    gap = int(fg_size * 0.05)
    
    total_width = box_w * 3 + gap * 2
    total_height = box_h * 3 + gap * 2
    start_x = (fg_size - total_width) // 2
    start_y = (fg_size - total_height) // 2
    
    # Box 1 (bottom-left)
    b1_x = start_x
    b1_y = start_y + (box_h + gap) * 2
    fg_draw.rounded_rectangle([b1_x, b1_y, b1_x + box_w, b1_y + box_h], radius=box_radius, fill=box_color)
    
    # Box 2 (middle)
    b2_x = start_x + box_w + gap
    b2_y = start_y + box_h + gap
    fg_draw.rounded_rectangle([b2_x, b2_y, b2_x + box_w, b2_y + box_h], radius=box_radius, fill=box_color)
    
    # Box 3 (top-right)
    b3_x = start_x + (box_w + gap) * 2
    b3_y = start_y
    fg_draw.rounded_rectangle([b3_x, b3_y, b3_x + box_w, b3_y + box_h], radius=box_radius, fill=box_color)
    
    fg_img.save(f'{output_dir}/ic_launcher_foreground.png', 'PNG')
    print(f'Created foreground: {output_dir}/ic_launcher_foreground.png ({fg_size}x{fg_size})')

# Background color image for adaptive icon
for folder, size in mipmap_sizes.items():
    output_dir = f'{android_base}/{folder}'
    bg_img = Image.new('RGBA', (size, size), (0, 200, 83, 255))  # Green background
    bg_img.save(f'{output_dir}/ic_launcher_background.png', 'PNG')
    print(f'Created background: {output_dir}/ic_launcher_background.png ({size}x{size})')

# Also copy the main icon to the web public folder
create_3boxes_icon(192, '/home/z/my-project/public/icon-192.png')
create_3boxes_icon(512, '/home/z/my-project/public/icon-512.png')

# Also update the SVG logo
svg_content = '''<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
     viewBox="0 0 30 30" style="enable-background:new 0 0 30 30;" xml:space="preserve">
<defs>
  <style type="text/css">
    .bg{fill:#00C853;rx:5;ry:5;}
    .box{fill:#FFFFFF;rx:1.5;ry:1.5;}
  </style>
</defs>
<rect class="bg" x="1" y="1" width="28" height="28" rx="6" ry="6"/>
<rect class="box" x="4" y="19" width="7" height="6" rx="1.5" ry="1.5"/>
<rect class="box" x="12.5" y="13" width="7" height="6" rx="1.5" ry="1.5"/>
<rect class="box" x="20" y="7" width="7" height="6" rx="1.5" ry="1.5"/>
</svg>'''

with open('/home/z/my-project/public/logo.svg', 'w') as f:
    f.write(svg_content)
print('Updated logo.svg')

print('\nAll icons generated successfully!')
