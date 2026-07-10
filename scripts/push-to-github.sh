#!/bin/bash
# Push 3 Boxes Jobs code to GitHub and trigger Vercel deployment
# Run this script from the project root directory

set -e

echo "🚀 3 Boxes Jobs - Push to GitHub & Vercel"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Please run this script from the project root directory"
  exit 1
fi

# Check git status
echo ""
echo "📋 Checking git status..."
git status --short

# Add all relevant files
echo ""
echo "📦 Staging files..."
git add docs/ src/ prisma/ public/ next.config.ts tailwind.config.ts tsconfig.json \
  package.json bun.lock components.json postcss.config.mjs eslint.config.mjs \
  Caddyfile vercel.json .gitignore .env.example

# Commit
echo ""
echo "💾 Committing changes..."
git commit -m "feat: Update 3 Boxes Jobs with comprehensive documentation and Vercel config" || echo "Nothing to commit"

# Push to GitHub
echo ""
echo "🔗 Pushing to GitHub (https://github.com/pmkshar/3boxesjobportal)..."
git push origin main

echo ""
echo "✅ Push complete! Vercel will auto-deploy from the GitHub main branch."
echo ""
echo "🌐 Monitor deployment at: https://vercel.com/dashboard"
echo "📚 Repository: https://github.com/pmkshar/3boxesjobportal"
echo ""
echo "Demo Accounts:"
echo "  Job Seeker: seeker@3boxes.com / demo123"
echo "  Corporate:  corp@3boxes.com / demo123"
echo "  Recruiter:  recruiter@3boxes.com / demo123"
