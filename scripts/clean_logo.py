#!/usr/bin/env python3
"""
Clean approach: Take the ORIGINAL uploaded logo, remove ONLY the white background,
keep all gradients and 3D effects intact. This produces a clean, professional logo.
"""
import os
from PIL import Image

SOURCE = "/home/z/my-project/upload/ChatGPT Image Jul 27, 2026, 11_03_38 AM.png"
PUBLIC = "/home/z/my-project/public"
ICONS = os.path.join(PUBLIC, "icons")

def remove_white_background(input_path, output_path):
    """Remove white background cleanly - keep all gradients and effects intact."""
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    data = img.load()
    
    # Simple approach: any pixel close to pure white becomes transparent
    # Use a slightly aggressive threshold to catch anti-aliased edges too
    for y in range(height):
        for x in range(width):
            r, g, b, a = data[x, y]
            brightness = (r + g + b) / 3.0
            
            # Pure white and near-white -> fully transparent
            if brightness > 248:
                data[x, y] = (r, g, b, 0)
            # Very light pixels (anti-aliased edges on white) -> partially transparent
            elif brightness > 240:
                alpha_factor = (brightness - 240) / (248 - 240)
                new_alpha = int(a * (1 - alpha_factor))
                data[x, y] = (r, g, b, new_alpha)
    
    img.save(output_path, 'PNG')
    print(f"  Saved: {output_path} ({img.size[0]}x{img.size[1]})")
    return img

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
    print("3BOXESJOBS - Clean original logo with transparent background")
    print("=" * 60)
    
    # Step 1: Remove white background from ORIGINAL (keep all gradients/effects)
    print("\n🔧 Removing white background from original logo...")
    clean_logo = remove_white_background(SOURCE, os.path.join(PUBLIC, "logo.png"))
    
    source = clean_logo
    
    # Step 2: Regenerate all icons
    print("\n📋 Regenerating all icons from clean original logo...")
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
    
    print("\n✅ Done! Clean original logo with transparent background.")

if __name__ == "__main__":
    main()
