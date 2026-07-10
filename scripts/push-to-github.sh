#!/bin/bash
# 3 Boxes Jobs - Push to GitHub Script
# Run this from your LOCAL machine where you have GitHub access
#
# Prerequisites:
#   - Git installed and authenticated with GitHub
#   - This repository already exists at https://github.com/pmkshar/3boxesjobportal
#
# If you haven't authenticated Git with GitHub yet, run:
#   gh auth login
# OR set up SSH keys and use the SSH URL instead

set -e

REPO_URL="https://github.com/pmkshar/3boxesjobportal.git"
BRANCH="main"

echo "🚀 3 Boxes Jobs - Push to GitHub"
echo "================================"
echo ""

# Check current directory
if [ ! -f "package.json" ] || [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ Error: Run this script from the 3 Boxes Jobs project root"
  exit 1
fi

# Stage all changes
echo "📦 Staging all changes..."
git add -A

# Show what's staged
echo ""
echo "📋 Changes to be committed:"
git status --short

# Commit
echo ""
echo "💾 Committing..."
git commit -m "feat: 3 Boxes Jobs - AI-Powered Job Portal with comprehensive documentation" 2>/dev/null || echo "Already committed"

# Push
echo ""
echo "🔗 Pushing to GitHub..."
git push origin $BRANCH

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "🌐 Vercel will auto-deploy from the main branch."
echo "   Monitor at: https://vercel.com/dashboard"
echo "   Repo: https://github.com/pmkshar/3boxesjobportal"
echo ""
echo "🔑 Demo Accounts (auto-seeded on first visit):"
echo "   Job Seeker: seeker@3boxes.com / demo123"
echo "   Corporate:  corp@3boxes.com / demo123"  
echo "   Recruiter:  recruiter@3boxes.com / demo123"
echo "   Admin:      admin@3boxes.com / demo123"
