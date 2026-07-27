#!/usr/bin/env python3
"""
Batch replace all old brand colors with NEW logo-derived brand colors.

New logo colors:
  Green Primary: #056022 (from new logo)
  Green Hover: #044d1a
  Green Dark: #024217
  Orange Accent: #fc7e0b (from new logo, more yellow-orange)
  Orange Hover: #ea5703
  Orange Dark: #c2410c
  Primary Light: #f0f8f0
  Primary Medium: #d8ecd8
  Ring: #1e7d1e
  Dark: #021303
  900: #013b0b
  Accent Light: #fff8eb
  Accent Ring: #fdba64
  Lighter Green: #3a9a3a
  Medium Light: #b0d9b5
  Medium: #7ec07e
"""

import os
from pathlib import Path

SRC_DIR = Path('/home/z/my-project/src')

# Full color mapping from old to new
COLOR_MAP = {
    # Primary green
    '#045a06': '#056022',
    '#045A06': '#056022',
    # Green hover
    '#034604': '#044d1a',
    '#034604': '#044d1a',
    # Green dark
    '#023303': '#024217',
    # Orange accent  
    '#fa7903': '#fc7e0b',
    '#FA7903': '#fc7e0b',
    # Orange hover
    '#ea580c': '#ea5703',
    '#EA580C': '#ea5703',
    # Primary light
    '#f0faf2': '#f0f8f0',
    # Primary medium
    '#d1e8d5': '#d8ecd8',
    # Ring green
    '#1a7c25': '#1e7d1e',
    # Darkest
    '#030b03': '#021303',
    # 900
    '#0d3320': '#013b0b',
    # Accent light
    '#fff7ed': '#fff8eb',
    # Accent ring
    '#fb923c': '#fdba64',
    # Lighter greens
    '#3a9a48': '#3a9a3a',
    '#a3d1aa': '#b0d9b5',
    '#6db879': '#7ec07e',
    # Additional mappings for old colors that might still exist
    '#16a34a': '#056022',
    '#15803d': '#044d1a',
    '#166534': '#024217',
    '#059669': '#056022',
    '#047857': '#044d1a',
    '#10B981': '#fc7e0b',
    '#10b981': '#fc7e0b',
    '#ECFDF5': '#f0f8f0',
    '#ecfdf5': '#f0f8f0',
    '#D1FAE5': '#d8ecd8',
    '#d1fae5': '#d8ecd8',
    '#065F46': '#056022',
    '#064E3B': '#021303',
    '#064e3b': '#021303',
    '#14532d': '#013b0b',
    '#047857': '#044d1a',
    '#05264E': '#021303',  # old dark text → new dark
}

files_to_process = []
for ext in ['.tsx', '.ts', '.css']:
    for f in SRC_DIR.rglob(f'*{ext}'):
        files_to_process.append(f)

total_replacements = 0
files_modified = 0

for filepath in sorted(files_to_process):
    rel_path = filepath.relative_to(SRC_DIR)
    
    try:
        content = filepath.read_text(encoding='utf-8')
    except:
        continue
    
    original = content
    modified = content
    
    for old_color, new_color in COLOR_MAP.items():
        count = modified.count(old_color)
        if count > 0:
            modified = modified.replace(old_color, new_color)
            total_replacements += count
    
    if modified != original:
        filepath.write_text(modified, encoding='utf-8')
        files_modified += 1
        diff_count = sum(original.count(old) for old in COLOR_MAP if original.count(old) > 0)
        print(f'  ✓ {rel_path}: {diff_count} replacements')

print(f'\n=== Summary ===')
print(f'Files modified: {files_modified}')
print(f'Total replacements: {total_replacements}')
