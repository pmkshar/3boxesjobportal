#!/bin/bash
# 3 Boxes Jobs - GitHub Push Script
# Run this script from your local machine to push the code to GitHub

set -e

REPO_URL="https://github.com/pmkshar/3boxesjobportal.git"
BRANCH="main"

echo "============================================"
echo "  3 Boxes Jobs - GitHub Push Script"
echo "============================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Run this script from the project root directory"
    exit 1
fi

# Check if remote is set up
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ "$CURRENT_REMOTE" != "$REPO_URL" ]; then
    echo "Setting up remote origin..."
    git remote remove origin 2>/dev/null || true
    git remote add origin "$REPO_URL"
fi

# Stage all changes
echo "Staging changes..."
git add -A

# Commit
echo "Creating commit..."
git commit -m "feat: Complete 3 Boxes Jobs AI Job Portal with all features" || echo "No changes to commit"

# Push
echo "Pushing to GitHub..."
echo "Note: You may be prompted for GitHub credentials."
echo "Use Personal Access Token (PAT) as password if 2FA is enabled."
echo ""
git push -u origin "$BRANCH"

echo ""
echo "============================================"
echo "  Push completed successfully!"
echo "  Repository: $REPO_URL"
echo "============================================"
