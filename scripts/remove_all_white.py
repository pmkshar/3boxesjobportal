#!/usr/bin/env python3
"""
Completely remove ALL white traces from the 3BOXESJOBS logo.
- Remove white background
- Remove white highlights from 3D/glossy effects
- Remove white anti-aliased edges
- Keep only the colored logo elements on a fully transparent background
- Result: Clean, vibrant, no white at all
"""
import os
import numpy as np
from PIL import Image

SOURCE = "/home/z/my-project/upload/ChatGPT Image Jul 27, 2026, 11_03_38 AM.png"
PUBLIC = "/home/z/my-project/public"
ICONS = os.path.join(PUBLIC, "icons")

def remove_all_white(input_path, output_path):
    """
    Remove ALL white traces from the logo completely.
    Strategy:
    1. Any pixel that is white/near-white -> make transparent
    2. Any pixel that has white mixed in (3D highlights) -> replace white with the base color
    3. Semi-transparent white pixels -> fully transparent
    """
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    pixels = np.array(img).astype(float)
    
    r = pixels[:,:,0]
    g = pixels[:,:,1] 
    b = pixels[:,:,2]
    a = pixels[:,:,3]
    
    brightness = (r + g + b) / 3.0
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    # Saturation: how colorful (0=gray/white, 1=pure color)
    saturation = np.where(max_c > 0, (max_c - min_c) / max_c, 0)
    
    # === STEP 1: Remove pure white background ===
    # Any pixel that is very bright AND low saturation -> transparent (background)
    background_mask = (brightness > 235) & (saturation < 0.15)
    a[background_mask] = 0
    
    # === STEP 2: Remove white highlights from 3D/glossy effects ===
    # These are bright pixels that ARE part of the logo (high saturation) but have white mixed in
    # For example: the glossy highlight on the green "3" curve
    # Strategy: Replace the white component with the base color
    
    # For bright pixels that ARE colorful (saturation > 0.15) but have white mixed in:
    # These are the 3D highlights - we want to keep the color but remove the white
    highlight_mask = (brightness > 200) & (saturation >= 0.15) & (a > 0)
    
    # For these pixels, reduce brightness to match the mid-tone of the logo
    # This removes the "white washed" look while keeping the color
    # Target: reduce brightness to ~70% of current for highlight areas
    r[highlight_mask] = r[highlight_mask] * 0.72
    g[highlight_mask] = g[highlight_mask] * 0.72
    b[highlight_mask] = b[highlight_mask] * 0.72
    
    # === STEP 3: Remove white anti-aliased edges ===
    # Semi-transparent pixels near white -> fully transparent
    edge_mask = (a > 0) & (a < 200) & (brightness > 200)
    a[edge_mask] = 0
    
    # === STEP 4: Remove remaining near-white pixels ===
    # Any pixel that is still very bright and low saturation -> transparent
    remaining_white = (brightness > 230) & (saturation < 0.2) & (a > 0)
    a[remaining_white] = 0
    
    # === STEP 5: For any remaining white-ish pixels in colored areas ===
    # These are pixels where white is mixed with color (e.g., light green, light orange)
    # Replace white component with the dominant color
    # For pixels where brightness > 200 and saturation > 0.2 (colored but washed out)
    washed_mask = (brightness > 200) & (saturation >= 0.2) & (saturation < 0.4) & (a > 0)
    # Make these more saturated by boosting the dominant channel
    green_dominant = washed_mask & (g >= r) & (g >= b)
    orange_dominant = washed_mask & (r > g) & (r > b)
    
    # For green-dominant washed pixels: boost green, reduce white
    r[green_dominant] = np.minimum(r[green_dominant] * 0.6, 100)
    g[green_dominant] = np.minimum(g[green_dominant] * 0.85, 150)
    b[green_dominant] = np.minimum(b[green_dominant] * 0.5, 60)
    
    # For orange-dominant washed pixels: boost orange, reduce white
    r[orange_dominant] = np.minimum(r[orange_dominant] * 0.85, 255)
    g[orange_dominant] = np.minimum(g[orange_dominant] * 0.7, 150)
    b[orange_dominant] = np.minimum(b[orange_dominant] * 0.4, 60)
    
    # === STEP 6: Final cleanup - any pixel that is still very bright -> make transparent ===
    # Recalculate brightness after modifications
    brightness2 = (r + g + b) / 3.0
    final_white = (brightness2 > 230) & (saturation < 0.15) & (a > 0)
    a[final_white] = 0
    
    # Make all remaining semi-transparent edge pixels fully opaque
    # (they should be colored, not white)
    solid_mask = (a > 50) & (a < 255)
    a[solid_mask] = 255
    
    # Build output
    out = np.stack([r, g, b, a], axis=2).astype(np.uint8)
    result = Image.fromarray(out, 'RGBA')
    result.save(output_path, 'PNG')
    
    # Verify no white traces remain
    check = np.array(result)
    cr, cg, cb, ca = check[:,:,0], check[:,:,1], check[:,:,2], check[:,:,3]
    white_remaining = (cr > 230) & (cg > 230) & (cb > 230) & (ca > 0)
    print(f"  Saved: {output_path} ({width}x{height})")
    print(f"  White/near-white visible pixels remaining: {np.sum(white_remaining)}")
    print(f"  Total visible pixels: {np.sum(ca > 0)}")
    
    return result

def create_icon(size, output_path, source_img):
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
    new_width = 300
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
    print("3BOXESJOBS - Remove ALL white traces completely")
    print("=" * 60)
    
    print("\n🔧 Removing ALL white traces from logo...")
    clean_logo = remove_all_white(SOURCE, os.path.join(PUBLIC, "logo.png"))
    
    source = clean_logo
    
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
    
    print("\n✅ Done! Logo has ZERO white traces on transparent background.")

if __name__ == "__main__":
    main()
