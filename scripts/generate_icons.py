#!/usr/bin/env python3
"""
Generate all PWA icons, favicons, and logo variants from the new 3BOXESJOBS logo.
"""
import os
from PIL import Image

# Source logo
SOURCE = "/home/z/my-project/upload/ChatGPT Image Jul 27, 2026, 11_03_38 AM.png"
PUBLIC = "/home/z/my-project/public"
ICONS = os.path.join(PUBLIC, "icons")

# Ensure icons directory exists
os.makedirs(ICONS, exist_ok=True)

def create_icon(size, output_path, source_img=None, crop_to_square=True):
    """Resize the logo to the given size, optionally cropping to square first."""
    if source_img is None:
        source_img = Image.open(SOURCE)
    
    img = source_img.copy()
    
    if crop_to_square:
        # Crop to square from center, focusing on the icon part (left side of the logo)
        width, height = img.size
        # The logo is wider than tall; for icons, we want just the icon/logomark part
        # The icon is roughly in the left 40% of the image
        # Let's crop to a square that captures the icon mark
        icon_width = int(width * 0.38)  # Icon portion is roughly 38% of the width
        left = int(width * 0.02)  # Small margin from left
        right = left + icon_width
        top = int(height * 0.05)
        bottom = height - int(height * 0.05)
        
        # Make it square by adjusting
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
    
    # Convert to RGBA if needed for PNG
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    img.save(output_path, 'PNG')
    print(f"  Created: {output_path} ({size}x{size})")

def create_favicon(output_path, source_img=None):
    """Create a multi-size favicon.ico from the logo."""
    if source_img is None:
        source_img = Image.open(SOURCE)
    
    # Create icon-sized versions (16, 32, 48)
    sizes = [16, 32, 48]
    images = []
    
    for size in sizes:
        img = source_img.copy()
        
        # Crop to square - focus on the icon mark
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
        img = img.convert('RGBA')
        images.append(img)
    
    # Save as ICO
    images[0].save(
        output_path,
        format='ICO',
        sizes=[(s, s) for s in sizes],
        append_images=images[1:]
    )
    print(f"  Created: {output_path} (favicon with sizes {sizes})")

def create_logo_small(output_path, source_img=None):
    """Create a smaller version of the full logo (for small displays)."""
    if source_img is None:
        source_img = Image.open(SOURCE)
    
    img = source_img.copy()
    # Make it 200px wide, maintaining aspect ratio
    width, height = img.size
    new_width = 200
    new_height = int(height * (new_width / width))
    img = img.resize((new_width, new_height), Image.LANCZOS)
    img = img.convert('RGBA')
    img.save(output_path, 'PNG')
    print(f"  Created: {output_path} ({new_width}x{new_height})")

def create_logo_icon(output_path, source_img=None):
    """Create a square icon version (just the logomark, no text)."""
    if source_img is None:
        source_img = Image.open(SOURCE)
    
    img = source_img.copy()
    # Crop to the icon mark only (left portion)
    width, height = img.size
    icon_width = int(width * 0.38)
    left = int(width * 0.02)
    right = left + icon_width
    top = int(height * 0.05)
    bottom = height - int(height * 0.05)
    
    # Make it square
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
    img = img.convert('RGBA')
    img.save(output_path, 'PNG')
    print(f"  Created: {output_path} (512x512)")

def main():
    print("=" * 60)
    print("3BOXESJOBS Logo Icon Generator")
    print("=" * 60)
    
    # Load source image once
    source = Image.open(SOURCE)
    print(f"\nSource image: {source.size[0]}x{source.size[1]}")
    
    # 1. PWA Icons (all sizes)
    print("\n📋 Generating PWA icons...")
    pwa_sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    for size in pwa_sizes:
        create_icon(size, os.path.join(ICONS, f"icon-{size}x{size}.png"), source)
    
    # 2. Maskable icons (need safe area padding)
    print("\n📋 Generating maskable icons...")
    for size in [192, 512]:
        # Maskable icons need safe area: the important content should be in the inner 80%
        # So we create a larger canvas and place the icon in the center
        canvas_size = size
        icon_safe_size = int(size * 0.8)
        
        img = source.copy()
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
        img = img.convert('RGBA')
        
        # Create canvas with white background
        canvas = Image.new('RGBA', (canvas_size, canvas_size), (255, 255, 255, 255))
        offset = (canvas_size - icon_safe_size) // 2
        canvas.paste(img, (offset, offset), img)
        canvas.save(os.path.join(ICONS, f"maskable-icon-{size}x{size}.png"), 'PNG')
        print(f"  Created: {os.path.join(ICONS, f'maskable-icon-{size}x{size}.png')} ({size}x{size})")
    
    # 3. Apple touch icon
    print("\n📋 Generating Apple touch icon...")
    create_icon(180, os.path.join(ICONS, "apple-touch-icon.png"), source)
    
    # 4. Favicon 32x32
    print("\n📋 Generating favicon-32x32.png...")
    create_icon(32, os.path.join(ICONS, "favicon-32x32.png"), source)
    
    # 5. Favicon ICO
    print("\n📋 Generating favicon.ico...")
    create_favicon(os.path.join(PUBLIC, "favicon.ico"), source)
    
    # 6. Legacy PWA icons in public root
    print("\n📋 Generating legacy PWA icons...")
    create_icon(192, os.path.join(PUBLIC, "icon-192.png"), source)
    create_icon(512, os.path.join(PUBLIC, "icon-512.png"), source)
    
    # 7. Logo icon (square logomark only)
    print("\n📋 Generating logo-icon.png...")
    create_logo_icon(os.path.join(PUBLIC, "logo-icon.png"), source)
    
    # 8. Logo small
    print("\n📋 Generating logo-small.png...")
    create_logo_small(os.path.join(PUBLIC, "logo-small.png"), source)
    
    print("\n" + "=" * 60)
    print("✅ All icons generated successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
