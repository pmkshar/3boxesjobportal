#!/usr/bin/env python3
"""
Process the 3BOXESJOBS logo to:
1. Remove gradients - flatten to solid bold colors
2. Remove 3D effects (bevels, glossy finish, shadows)
3. Make colors vibrant and bold
4. Keep transparent background
"""
import os
import numpy as np
from PIL import Image

SOURCE = "/home/z/my-project/upload/ChatGPT Image Jul 27, 2026, 11_03_38 AM.png"
PUBLIC = "/home/z/my-project/public"
ICONS = os.path.join(PUBLIC, "icons")

# Brand colors - flat, bold, vibrant
GREEN_DARK = (2, 66, 23)      # #024217 - deep forest green (brand primary)
GREEN_BRIGHT = (5, 150, 34)   # #059662 - vibrant emerald green
ORANGE_DARK = (233, 116, 12)  # #e9740c - deep orange
ORANGE_BRIGHT = (252, 126, 11) # #fc7e0b - vibrant brand orange
TAGLINE_GREEN = (2, 66, 23)   # #024217 - same as primary green for tagline
SEPARATOR = (26, 86, 50)      # dark green for divider line

def flatten_logo(input_path, output_path):
    """
    Remove gradients from the logo by mapping pixel colors to flat brand colors.
    Strategy: For each non-transparent pixel, determine if it's in the "green family" or "orange family"
    and replace it with the corresponding flat brand color.
    """
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    
    # Convert to numpy array for efficient pixel processing
    pixels = np.array(img)
    r = pixels[:,:,0].astype(float)
    g = pixels[:,:,1].astype(float)
    b = pixels[:,:,2].astype(float)
    a = pixels[:,:,3].astype(float)
    
    # Calculate properties for each pixel
    brightness = (r + g + b) / 3.0
    # Saturation-like measure: how colorful vs gray
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    saturation = (max_c - min_c) / (max_c + 1)  # avoid div by zero
    
    # Determine green vs orange dominance
    # Green pixels: green channel > red channel AND green channel > blue channel
    green_dominant = (g > r) & (g > b)
    # Orange pixels: red channel > green channel AND red channel significantly > blue
    orange_dominant = (r > g) & (r > b * 0.5)
    
    # Determine if pixel is "dark" (shadow/shadow area) vs "light" (highlight/gradient area)
    # This helps us choose which shade of flat color to use
    
    # Output arrays
    out_r = np.copy(r)
    out_g = np.copy(g)
    out_b = np.copy(b)
    out_a = np.copy(a)
    
    # Process GREEN pixels - flatten to solid brand green
    # All green pixels become a single flat vibrant green
    green_mask = green_dominant & (a > 20) & (saturation > 0.1)
    
    # For the main body of green elements, use the bright brand green
    # For very dark shadow areas (brightness < 100), use the dark brand green
    green_bright_mask = green_mask & (brightness > 100)
    green_dark_mask = green_mask & (brightness <= 100)
    
    # Bright green -> vibrant emerald (#059662)
    out_r[green_bright_mask] = GREEN_BRIGHT[0]
    out_g[green_bright_mask] = GREEN_BRIGHT[1]
    out_b[green_bright_mask] = GREEN_BRIGHT[2]
    
    # Dark green shadows -> deep forest green (#024217)
    out_r[green_dark_mask] = GREEN_DARK[0]
    out_g[green_dark_mask] = GREEN_DARK[1]
    out_b[green_dark_mask] = GREEN_DARK[2]
    
    # Process ORANGE pixels - flatten to solid brand orange
    orange_mask = orange_dominant & (a > 20) & (saturation > 0.1)
    
    # Bright orange -> vibrant brand orange (#fc7e0b)
    orange_bright_mask = orange_mask & (brightness > 150)
    # Medium orange -> deep orange (#e9740c)
    orange_mid_mask = orange_mask & (brightness > 100) & (brightness <= 150)
    # Dark orange shadows -> darker orange but still vibrant
    orange_dark_mask = orange_mask & (brightness <= 100)
    
    out_r[orange_bright_mask] = ORANGE_BRIGHT[0]
    out_g[orange_bright_mask] = ORANGE_BRIGHT[1]
    out_b[orange_bright_mask] = ORANGE_BRIGHT[2]
    
    out_r[orange_mid_mask] = ORANGE_DARK[0]
    out_g[orange_mid_mask] = ORANGE_DARK[1]
    out_b[orange_mid_mask] = ORANGE_DARK[2]
    
    out_r[orange_dark_mask] = np.minimum(ORANGE_DARK[0], brightness[orange_dark_mask] * 1.5).astype(np.uint8)
    out_g[orange_dark_mask] = 50
    out_b[orange_dark_mask] = 20
    
    # Process NEUTRAL/dark pixels that are part of the logo body
    # (These are bevel shadows or shadow edges - make them the dark brand colors)
    neutral_mask = (~green_mask) & (~orange_mask) & (a > 20) & (saturation < 0.3) & (brightness < 150)
    # These are likely shadow/bevel edges - remove them (make transparent) or match surrounding color
    # Actually, we want to REMOVE these as they are the 3D effect artifacts
    # Make them transparent (alpha = 0) so the logo looks flat
    out_a[neutral_mask] = 0
    
    # Remove remaining drop shadows - any semi-transparent pixel with low saturation
    # These are the soft shadow pixels around the logo
    shadow_mask = (a > 0) & (a < 180) & (saturation < 0.15)
    out_a[shadow_mask] = 0
    
    # Ensure full opacity for all remaining visible pixels
    visible_mask = out_a > 20
    out_a[visible_mask] = 255
    
    # Remove any white/near-white background pixels (just to be safe)
    white_mask = (brightness > 240) & (a > 0)
    out_a[white_mask] = 0
    
    # Build output image
    out_pixels = np.stack([out_r, out_g, out_b, out_a], axis=2).astype(np.uint8)
    result = Image.fromarray(out_pixels, 'RGBA')
    
    # Save
    result.save(output_path, 'PNG')
    print(f"  Saved flat logo: {output_path} ({result.size[0]}x{result.size[1]})")
    
    # Print stats
    total_visible = np.sum(out_a > 0)
    green_count = np.sum(green_mask)
    orange_count = np.sum(orange_mask)
    removed_count = np.sum((a > 0) & (out_a == 0))
    print(f"  Green pixels: {green_count}")
    print(f"  Orange pixels: {orange_count}")
    print(f"  Removed (shadows/bevels): {removed_count}")
    print(f"  Total visible: {total_visible}")
    
    return result

def create_icon(size, output_path, source_img):
    """Resize to square icon, cropping to the logomark portion."""
    img = source_img.copy()
    width, height = img.size
    
    # Crop to the icon/logomark portion (left ~38% of the full logo)
    icon_width = int(width * 0.40)
    left = int(width * 0.01)
    right = left + icon_width
    top = int(height * 0.03)
    bottom = height - int(height * 0.03)
    
    # Make square
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
    """Maskable icon with 80% safe area padding on transparent canvas."""
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
    """Create favicon.ico from the logomark."""
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
    """Small version of the full logo."""
    img = source_img.copy()
    width, height = img.size
    new_width = 250
    new_height = int(height * (new_width / width))
    img = img.resize((new_width, new_height), Image.LANCZOS)
    img.save(output_path, 'PNG')
    print(f"  Created: {output_path} ({new_width}x{new_height})")

def create_logo_icon(output_path, source_img):
    """Square logomark icon."""
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
    print("3BOXESJOBS - Flatten Gradients, Remove 3D Effects")
    print("=" * 60)
    
    # Step 1: Flatten the logo
    print("\n🔧 Removing gradients and 3D effects...")
    flat_logo = flatten_logo(SOURCE, os.path.join(PUBLIC, "logo.png"))
    
    source = flat_logo
    print(f"\nSource: {source.size[0]}x{source.size[1]}")
    
    # Step 2: Regenerate all icons from flat logo
    print("\n📋 Regenerating icons from flat logo...")
    
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
    
    print("\n" + "=" * 60)
    print("✅ Done! Logo is now flat, vibrant, no gradients, no 3D effects.")
    print("=" * 60)

if __name__ == "__main__":
    main()
