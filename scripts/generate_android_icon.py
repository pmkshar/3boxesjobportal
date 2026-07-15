#!/usr/bin/env python3
"""Generate Android mipmap icons from the 3 Boxes Jobs logo."""
from PIL import Image
import os

ICON_PATH = "/home/z/my-project/mobile-app/assets/icon.png"
OUTPUT_BASE = "/home/z/my-project/mobile-app/android/app/src/main/res"

# Android mipmap sizes
MIPMAP_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

def create_icon(size):
    """Create a round icon with green background and centered logo."""
    # Create green background circle
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    
    # Draw green circle background
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    draw.ellipse([0, 0, size-1, size-1], fill=(0, 200, 83, 255))  # #00C853
    
    # Load and resize the logo
    logo = Image.open(ICON_PATH).convert("RGBA")
    logo_size = int(size * 0.65)  # Logo takes 65% of icon
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
    
    # Center the logo on the green circle
    offset = ((size - logo_size) // 2, (size - logo_size) // 2)
    img.paste(logo, offset, logo)
    
    return img

def main():
    for folder, size in MIPMAP_SIZES.items():
        output_dir = os.path.join(OUTPUT_BASE, folder)
        os.makedirs(output_dir, exist_ok=True)
        
        icon = create_icon(size)
        output_path = os.path.join(output_dir, "ic_launcher.png")
        icon.save(output_path, "PNG")
        print(f"Created {output_path} ({size}x{size})")
        
        # Also create round icon
        round_path = os.path.join(output_dir, "ic_launcher_round.png")
        icon.save(round_path, "PNG")
        print(f"Created {round_path} ({size}x{size})")

if __name__ == "__main__":
    main()
    print("\nAll mipmap icons generated!")
