#!/usr/bin/env python3
"""
Aggressively flatten the 3BOXESJOBS logo to ONLY 2 solid flat colors:
- Forest green #024217 (for all green elements)
- Vibrant orange #fc7e0b (for all orange elements)
No gradients, no 3D effects, no shadows, no bevels, no gray artifacts.
"""
import os
import numpy as np
from PIL import Image

SOURCE = "/home/z/my-project/upload/ChatGPT Image Jul 27, 2026, 11_03_38 AM.png"
PUBLIC = "/home/z/my-project/public"
ICONS = os.path.join(PUBLIC, "icons")

# Only 2 flat brand colors - bold and vibrant
GREEN = np.array([2, 66, 23])       # #024217
ORANGE = np.array([252, 126, 11])   # #fc7e0b

def flatten_to_two_colors(input_path, output_path):
    """
    Aggressively flatten logo to only 2 solid colors + transparent background.
    Any pixel that is more green-ish -> flat green
    Any pixel that is more orange-ish -> flat orange
    Everything else -> transparent (removes shadows, bevels, 3D effects)
    """
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    
    pixels = np.array(img)
    r = pixels[:,:,0].astype(float)
    g = pixels[:,:,1].astype(float)
    b = pixels[:,:,2].astype(float)
    a = pixels[:,:,3].astype(float)
    
    # Calculate brightness
    brightness = (r + g + b) / 3.0
    
    # Calculate saturation (colorfulness)
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    saturation = np.where(max_c > 0, (max_c - min_c) / max_c, 0)
    
    # Determine green vs orange dominance
    # Green: green channel is the highest OR (green > red and the pixel is dark with some green)
    green_dominant = ((g >= r) & (g >= b)) | ((g > 50) & (brightness < 200) & (g > r * 0.8))
    # Orange/Red: red channel is highest AND pixel is colorful enough
    orange_dominant = ((r > g) & (r > b) & (r > 80)) | ((brightness > 200) & (r > 200) & (g > 80) & (b < 80))
    
    # Is the pixel part of the logo body (colored, not background/shadow)?
    is_colored = (saturation > 0.05) & (a > 30) & (brightness > 30)
    
    # Green logo pixels -> flat GREEN
    green_mask = green_dominant & is_colored
    
    # Orange logo pixels -> flat ORANGE
    orange_mask = orange_dominant & is_colored & (~green_mask)
    
    # Everything else that's not green or orange logo -> transparent
    # This removes shadows, bevels, 3D effects, gray artifacts
    other_mask = is_colored & (~green_mask) & (~orange_mask)
    
    # Build output
    out = np.zeros_like(pixels)
    
    # Green pixels
    out[green_mask, 0] = GREEN[0]
    out[green_mask, 1] = GREEN[1]
    out[green_mask, 2] = GREEN[2]
    out[green_mask, 3] = 255
    
    # Orange pixels  
    out[orange_mask, 0] = ORANGE[0]
    out[orange_mask, 1] = ORANGE[1]
    out[orange_mask, 2] = ORANGE[2]
    out[orange_mask, 3] = 255
    
    # Remove anti-aliasing edge pixels - if a pixel is semi-transparent and colorful,
    # make it the nearest flat color (this cleans up AA edges)
    edge_mask = (a > 0) & (a < 255) & (saturation > 0.2)
    edge_green = edge_mask & green_dominant
    edge_orange = edge_mask & orange_dominant
    
    out[edge_green, 0] = GREEN[0]
    out[edge_green, 1] = GREEN[1]
    out[edge_green, 2] = GREEN[2]
    out[edge_green, 3] = 255
    
    out[edge_orange, 0] = ORANGE[0]
    out[edge_orange, 1] = ORANGE[1]
    out[edge_orange, 2] = ORANGE[2]
    out[edge_orange, 3] = 255
    
    result = Image.fromarray(out.astype(np.uint8), 'RGBA')
    
    # Post-process: clean up isolated transparent holes inside the logo body
    # This can happen when shadow/bevel pixels inside solid areas were removed
    # We'll do a simple morphological fill
    alpha_data = np.array(result)[:,:,3]
    
    # Fill small transparent holes: any transparent pixel surrounded by colored pixels
    # should get the color of its neighbors
    for y in range(1, height-1):
        for x in range(1, width-1):
            if alpha_data[y, x] == 0:
                # Check if surrounded by colored pixels (4-connected)
                neighbors = [
                    out[y-1, x, :3], out[y+1, x, :3],
                    out[y, x-1, :3], out[y, x+1, :3]
                ]
                neighbor_alphas = [
                    alpha_data[y-1, x], alpha_data[y+1, x],
                    alpha_data[y, x-1], alpha_data[y, x+1]
                ]
                colored_neighbors = sum(1 for na in neighbor_alphas if na > 0)
                if colored_neighbors >= 3:
                    # Fill with average neighbor color
                    avg = np.mean([n for n, na in zip(neighbors, neighbor_alphas) if na > 0], axis=0)
                    # Determine if green-ish or orange-ish
                    if avg[1] >= avg[0]:  # green dominant
                        out[y, x, 0] = GREEN[0]
                        out[y, x, 1] = GREEN[1]
                        out[y, x, 2] = GREEN[2]
                        out[y, x, 3] = 255
                    else:  # orange dominant
                        out[y, x, 0] = ORANGE[0]
                        out[y, x, 1] = ORANGE[1]
                        out[y, x, 2] = ORANGE[2]
                        out[y, x, 3] = 255
    
    result = Image.fromarray(out.astype(np.uint8), 'RGBA')
    result.save(output_path, 'PNG')
    
    # Stats
    unique_colors = set()
    for y in range(height):
        for x in range(width):
            r_val, g_val, b_val, a_val = out[y, x]
            if a_val > 0:
                unique_colors.add((int(r_val), int(g_val), int(b_val)))
    
    print(f"  Saved: {output_path} ({width}x{height})")
    print(f"  Unique colors: {len(unique_colors)}")
    for c in sorted(unique_colors):
        print(f"    RGB({c[0]}, {c[1]}, {c[2]})")
    print(f"  Green pixels: {np.sum(green_mask)}")
    print(f"  Orange pixels: {np.sum(orange_mask)}")
    
    return result

def create_icon(size, output_path, source_img):
    """Resize to square icon, cropping to logomark portion."""
    img = source_img.copy()
    width, height = img.size
    icon_width = int(width * 0.40)
    left = int(width * 0.01)
    right = left + icon_width
    top = int(height * 0.03)
    bottom = height - int(height * 0.03)
    crop_height = bottom - top
    crop_width = right - left
    if crop_width > crop_height:
        diff = crop_width - crop_height
        top += diff // 2
        bottom = top + crop_height
    elif crop_height > crop_width:
        diff = crop_height - crop_width
        left += diff // 2
        right = left + crop_width
    img = img.crop((left, top, right, bottom))
    img = img.resize((size, size), Image.LANCZOS)
    img.save(output_path, 'PNG')
    print(f"  Created: {output_path} ({size}x{size})")

def create_maskable_icon(size, output_path, source_img):
    canvas_size = size
    icon_safe_size = int(size * 0.8)
    img = source_img.copy()
    width, height = img.size
    icon_width = int(width * 0.40)
    left = int(width * 0.01)
    right = left + icon_width
    top = int(height * 0.03)
    bottom = height - int(height * 0.03)
    crop_height = bottom - top
    crop_width = right - left
    if crop_width > crop_height:
        diff = crop_width - crop_height
        top += diff // 2
        bottom = top + crop_height
    elif crop_height > crop_width:
        diff = crop_height - crop_width
        left += diff // 2
        right = left + crop_width
    img = img.crop((left, top, right, bottom))
    img = img.resize((icon_safe_size, icon_safe_size), Image.LANCZOS)
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    offset = (canvas_size - icon_safe_size) // 2
    canvas.paste(img, (offset, offset), img)
    canvas.save(output_path, 'PNG')
    print(f"  Created: {output_path} ({size}x{size} maskable)")

def create_favicon(output_path, source_img):
    sizes = [16, 32, 48]
    images = []
    for size in sizes:
        img = source_img.copy()
        width, height = img.size
        icon_width = int(width * 0.40)
        left = int(width * 0.01)
        right = left + icon_width
        top = int(height * 0.03)
        bottom = height - int(height * 0.03)
        crop_height = bottom - top
        crop_width = right - left
        if crop_width > crop_height:
            diff = crop_width - crop_height
            top += diff // 2
            bottom = top + crop_height
        elif crop_height > crop_width:
            diff = crop_height - crop_width
            left += diff // 2
            right = left + crop_width
        img = img.crop((left, top, right, bottom))
        img = img.resize((size, size), Image.LANCZOS)
        images.append(img)
    images[0].save(output_path, format='ICO', sizes=[(s, s) for s in sizes], append_images=images[1:])
    print(f"  Created: {output_path} (favicon)")

def create_logo_small(output_path, source_img):
    img = source_img.copy()
    width, height = img.size
    new_width = 250
    new_height = int(height * (new_width / width))
    img = img.resize((new_width, new_height), Image.LANCZOS)
    img.save(output_path, 'PNG')
    print(f"  Created: {output_path} ({new_width}x{new_height})")

def create_logo_icon(output_path, source_img):
    img = source_img.copy()
    width, height = img.size
    icon_width = int(width * 0.40)
    left = int(width * 0.01)
    right = left + icon_width
    top = int(height * 0.03)
    bottom = height - int(height * 0.03)
    crop_height = bottom - top
    crop_width = right - left
    if crop_width > crop_height:
        diff = crop_width - crop_height
        top += diff // 2
        bottom = top + crop_height
    elif crop_height > crop_width:
        diff = crop_height - crop_width
        left += diff // 2
        right = left + crop_width
    img = img.crop((left, top, right, bottom))
    img = img.resize((512, 512), Image.LANCZOS)
    img.save(output_path, 'PNG')
    print(f"  Created: {output_path} (512x512)")

def main():
    print("=" * 60)
    print("3BOXESJOBS - AGGRESSIVE FLATTEN: Only 2 solid colors")
    print("=" * 60)
    
    print("\n🔧 Flattening to 2 solid flat colors...")
    flat_logo = flatten_to_two_colors(SOURCE, os.path.join(PUBLIC, "logo.png"))
    
    source = flat_logo
    
    print("\n📋 Regenerating all icons...")
    for size in [72, 96, 128, 144, 152, 192, 384, 512]:
        create_icon(size, os.path.join(ICONS, f"icon-{size}x{size}.png"), source)
    for size in [192, 512]:
        create_maskable_icon(size, os.path.join(ICONS, f"maskable-icon-{size}x{size}.png"), source)
    create_icon(180, os.path.join(ICONS, "apple-touch-icon.png"), source)
    create_icon(32, os.path.join(ICONS, "favicon-32x32.png"), source)
    create_favicon(os.path.join(PUBLIC, "favicon.ico"), source)
    create_icon(192, os.path.join(PUBLIC, "icon-192.png"), source)
    create_icon(512, os.path.join(PUBLIC, "icon-512.png"), source)
    create_logo_icon(os.path.join(PUBLIC, "logo-icon.png"), source)
    create_logo_small(os.path.join(PUBLIC, "logo-small.png"), source)
    
    print("\n✅ Done! Logo now has ONLY 2 flat solid colors: green #024217 + orange #fc7e0b")
    print("   No gradients, no 3D effects, no shadows, no bevels.")

if __name__ == "__main__":
    main()
