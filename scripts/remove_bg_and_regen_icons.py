#!/usr/bin/env python3
"""
Step 1: Remove white background from the logo PNG and make it transparent.
Step 2: Re-generate all icon variants from the transparent logo.
"""
import os
from PIL import Image

SOURCE = "/home/z/my-project/upload/ChatGPT Image Jul 27, 2026, 11_03_38 AM.png"
PUBLIC = "/home/z/my-project/public"
ICONS = os.path.join(PUBLIC, "icons")
DOWNLOAD = "/home/z/my-project/download"

os.makedirs(ICONS, exist_ok=True)

def remove_white_background(input_path, output_path):
    """Remove white background from image, making it transparent."""
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    data = img.load()
    
    # Remove white/near-white pixels (with tolerance for anti-aliasing)
    # Also remove very light gray pixels that are part of the background
    for y in range(height):
        for x in range(width):
            r, g, b, a = data[x, y]
            # If pixel is close to white (tolerance for anti-aliasing edges)
            # Threshold: anything with brightness > 240 and low saturation
            brightness = (r + g + b) / 3
            if brightness > 240:
                # Make it fully transparent
                data[x, y] = (r, g, b, 0)
            elif brightness > 230:
                # Partially transparent for smooth anti-aliasing edges
                alpha_factor = (brightness - 230) / (240 - 230)
                new_alpha = int(a * (1 - alpha_factor))
                data[x, y] = (r, g, b, new_alpha)
    
    img.save(output_path, 'PNG')
    print(f"  Created transparent logo: {output_path} ({img.size[0]}x{img.size[1]})")
    return img

def create_icon(size, output_path, source_img, crop_to_square=True):
    """Resize the logo to the given size, optionally cropping to square first."""
    img = source_img.copy()
    
    if crop_to_square:
        width, height = img.size
        # Focus on the icon/logomark portion (left ~38% of the logo)
        icon_width = int(width * 0.38)
        left = int(width * 0.02)
        right = left + icon_width
        top = int(height * 0.05)
        bottom = height - int(height * 0.05)
        
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
    """Create maskable icon with safe area padding (80% inner content)."""
    canvas_size = size
    icon_safe_size = int(size * 0.8)
    
    img = source_img.copy()
    width, height = img.size
    icon_width = int(width * 0.38)
    left = int(width * 0.02)
    right = left + icon_width
    top = int(height * 0.05)
    bottom = height - int(height * 0.05)
    
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
    
    # Transparent canvas (maskable icons need padding area)
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    offset = (canvas_size - icon_safe_size) // 2
    canvas.paste(img, (offset, offset), img)
    canvas.save(output_path, 'PNG')
    print(f"  Created: {output_path} ({size}x{size} maskable)")

def create_favicon(output_path, source_img):
    """Create favicon.ico from the icon portion of the logo."""
    sizes = [16, 32, 48]
    images = []
    
    for size in sizes:
        img = source_img.copy()
        width, height = img.size
        icon_width = int(width * 0.38)
        left = int(width * 0.02)
        right = left + icon_width
        top = int(height * 0.05)
        bottom = height - int(height * 0.05)
        
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
    """Create a smaller version of the full logo."""
    img = source_img.copy()
    width, height = img.size
    new_width = 200
    new_height = int(height * (new_width / width))
    img = img.resize((new_width, new_height), Image.LANCZOS)
    img.save(output_path, 'PNG')
    print(f"  Created: {output_path} ({new_width}x{new_height})")

def create_logo_icon(output_path, source_img):
    """Create a square icon version (just the logomark)."""
    img = source_img.copy()
    width, height = img.size
    icon_width = int(width * 0.38)
    left = int(width * 0.02)
    right = left + icon_width
    top = int(height * 0.05)
    bottom = height - int(height * 0.05)
    
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
    print("3BOXESJOBS Logo - Remove Background & Regenerate Icons")
    print("=" * 60)
    
    # Step 1: Remove white background
    print("\n🔧 Step 1: Removing white background from logo...")
    transparent_logo = remove_white_background(SOURCE, os.path.join(PUBLIC, "logo.png"))
    
    # Step 2: Generate all icon variants from transparent logo
    source = transparent_logo
    print(f"\n📋 Step 2: Regenerating all icons from transparent logo ({source.size[0]}x{source.size[1]})...")
    
    # PWA Icons
    print("\n  PWA icons...")
    for size in [72, 96, 128, 144, 152, 192, 384, 512]:
        create_icon(size, os.path.join(ICONS, f"icon-{size}x{size}.png"), source)
    
    # Maskable icons
    print("\n  Maskable icons...")
    for size in [192, 512]:
        create_maskable_icon(size, os.path.join(ICONS, f"maskable-icon-{size}x{size}.png"), source)
    
    # Apple touch icon
    print("\n  Apple touch icon...")
    create_icon(180, os.path.join(ICONS, "apple-touch-icon.png"), source)
    
    # Favicon 32x32
    print("\n  favicon-32x32.png...")
    create_icon(32, os.path.join(ICONS, "favicon-32x32.png"), source)
    
    # Favicon ICO
    print("\n  favicon.ico...")
    create_favicon(os.path.join(PUBLIC, "favicon.ico"), source)
    
    # Legacy PWA icons
    print("\n  Legacy PWA icons...")
    create_icon(192, os.path.join(PUBLIC, "icon-192.png"), source)
    create_icon(512, os.path.join(PUBLIC, "icon-512.png"), source)
    
    # Logo icon (square logomark)
    print("\n  logo-icon.png...")
    create_logo_icon(os.path.join(PUBLIC, "logo-icon.png"), source)
    
    # Logo small
    print("\n  logo-small.png...")
    create_logo_small(os.path.join(PUBLIC, "logo-small.png"), source)
    
    print("\n" + "=" * 60)
    print("✅ All done! Logo now has transparent background.")
    print("=" * 60)

if __name__ == "__main__":
    main()
