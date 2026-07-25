#!/usr/bin/env python3
"""
Batch replace all hardcoded old brand colors with new logo-derived brand colors.

Color mapping:
  #16a34a (old primary green) → #045a06 (logo brand green)
  #15803d (old green hover) → #034604 (logo green hover)
  #166534 (old green dark/nav) → #023303 (logo green dark)
  #059669 (old emerald) → #045a06 (logo brand green)
  #047857 (old green darker) → #034604 (logo green hover)
  #10B981 / #10b981 (old ring/active) → #fa7903 (logo accent orange)
  #ECFDF5 / #ecfdf5 (old primary light) → #f0faf2 (logo green light)
  #D1FAE5 / #d1fae5 (old primary medium) → #d1e8d5 (logo green medium)
  #065F46 (old sidebar hover) → #045a06 (logo brand green)
  #064E3B (old sidebar) → #030b03 (logo darkest)
  #14532d (old green 900) → #0d3320 (logo green 900)
  #0d3320 (old dark green) → #030b03 (logo darkest green)
  #05264E (dark text) → stays (it's neutral text, not brand)
"""

import os
import re
from pathlib import Path

SRC_DIR = Path('/home/z/my-project/src')

# Define the color mapping (case-insensitive handling needed)
COLOR_MAP = {
    '#16a34a': '#045a06',
    '#15803d': '#034604',
    '#166534': '#023303',
    '#059669': '#045a06',
    '#047857': '#034604',
    '#10B981': '#fa7903',
    '#10b981': '#fa7903',
    '#ECFDF5': '#f0faf2',
    '#ecfdf5': '#f0faf2',
    '#D1FAE5': '#d1e8d5',
    '#d1fae5': '#d1e8d5',
    '#065F46': '#045a06',
    '#064E3B': '#030b03',
    '#064e3b': '#030b03',
    '#14532d': '#0d3320',
    '#0d3320': '#030b03',
}

# Also update green-300, green-400, green-200, green-100 Tailwind colors
# These are used in various places for lighter accents
TAILWIND_MAP = {
    # Green-300 → brand lighter accent
    'text-green-300': 'text-[#3a9a48]',
    'text-green-200': 'text-[#a3d1aa]',
    'text-green-100': 'text-[#d1e8d5]',
    'bg-green-300': 'bg-[#3a9a48]',
    'bg-green-200': 'bg-[#a3d1aa]',
    'bg-green-100': 'bg-[#d1e8d5]',
    'bg-green-50': 'bg-[#f0faf2]',
    'text-green-50': 'text-[#f0faf2]',
    # Green-400 → accent orange
    'text-green-400': 'text-[#fa7903]',
    'bg-green-400': 'bg-[#fa7903]',
    'hover:bg-green-300': 'hover:bg-[#3a9a48]',
    'hover:bg-green-400': 'hover:bg-[#ea580c]',
    'border-green-300': 'border-[#3a9a48]',
    'border-green-200': 'border-[#d1e8d5]',
    'border-green-400': 'border-[#fa7903]',
    'from-green-400': 'from-[#3a9a48]',
    'to-green-300': 'to-[#3a9a48]',
    # Orange replacements for accent
    'text-green-200/70': 'text-[#a3d1aa]/70',
    'text-green-200/60': 'text-[#a3d1aa]/60',
    'text-green-400/60': 'text-[#fa7903]/60',
}

# Files to process
files_to_process = []
for ext in ['.tsx', '.ts']:
    for f in SRC_DIR.rglob(f'*{ext}'):
        files_to_process.append(f)

# Skip the globals.css (already manually updated) and theme.tsx (already manually updated)
# Also skip store.ts, auth.ts, db.ts, etc. that don't have color references

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
    
    # Apply hex color replacements
    for old_color, new_color in COLOR_MAP.items():
        # Match hex colors in various contexts:
        # - In Tailwind arbitrary values: bg-[#16a34a], text-[#16a34a], from-[#16a34a]
        # - In inline styles: color: '#16a34a', backgroundColor: '#16a34a'
        # - In SVG: fill="#16a34a", stroke="#16a34a"
        # - In object configs: '#16a34a'
        count = modified.count(old_color)
        if count > 0:
            modified = modified.replace(old_color, new_color)
            total_replacements += count
    
    # Apply Tailwind class replacements (only for specific patterns)
    for old_class, new_class in TAILWIND_MAP.items():
        count = modified.count(old_class)
        if count > 0:
            modified = modified.replace(old_class, new_class)
            total_replacements += count
    
    if modified != original:
        filepath.write_text(modified, encoding='utf-8')
        files_modified += 1
        # Count actual changes
        diff_count = 0
        for old_color, new_color in COLOR_MAP.items():
            diff_count += original.count(old_color)
        for old_class, new_class in TAILWIND_MAP.items():
            diff_count += original.count(old_class)
        print(f'  ✓ {rel_path}: {diff_count} replacements')

print(f'\n=== Summary ===')
print(f'Files modified: {files_modified}')
print(f'Total replacements: {total_replacements}')
