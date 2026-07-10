#!/bin/bash
# 3 Boxes Jobs - Vercel Deployment Script
# Run this script from your local machine to deploy to Vercel

set -e

echo "============================================"
echo "  3 Boxes Jobs - Vercel Deployment"
echo "============================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Run this script from the project root directory"
    exit 1
fi

# Login check
echo "Step 1: Ensure you're logged into Vercel"
echo "Running 'vercel login' if needed..."
vercel whoami 2>/dev/null || vercel login

# Deploy to preview
echo ""
echo "Step 2: Deploying to Vercel preview..."
vercel

echo ""
echo "Step 3: Deploying to production..."
echo "This will make the app live on your Vercel domain."
read -p "Deploy to production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
    echo ""
    echo "============================================"
    echo "  Deployment complete!"
    echo "  Your app is now live on Vercel."
    echo ""
    echo "  Don't forget to set environment variables"
    echo "  in Vercel Dashboard > Settings > Environment Variables:"
    echo "  - DATABASE_URL"
    echo "  - NEXTAUTH_SECRET"
    echo "  - NEXTAUTH_URL"
    echo "============================================"
else
    echo "Production deployment cancelled. Preview deployment is still available."
fi
