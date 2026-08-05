#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  3 Boxes Jobs — Set VERCEL_TOKEN in Vercel Environment Variables
# ═══════════════════════════════════════════════════════════════════
#
#  This script adds the VERCEL_TOKEN to your Vercel project's
#  environment variables, enabling secure API access for:
#    - Daily data refresh (POST /api/data-refresh)
#    - Full production seed (POST /api/seed-production)
#    - Cron job scheduling
#
#  Prerequisites:
#    1. Install Vercel CLI: npm i -g vercel
#    2. Login: vercel login
#    3. Link project: vercel link (in project root)
#
#  Usage:
#    bash scripts/set-vercel-token.sh
#
# ═══════════════════════════════════════════════════════════════════

set -e

echo "============================================"
echo "  3 Boxes Jobs — Set VERCEL_TOKEN"
echo "============================================"
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Check login
echo "Checking Vercel authentication..."
vercel whoami 2>/dev/null || {
    echo "Please login to Vercel:"
    vercel login
}

# Generate secure token
VERCEL_TOKEN_VALUE=$(openssl rand -hex 32)
echo ""
echo "Generated VERCEL_TOKEN: $VERCEL_TOKEN_VALUE"
echo ""

# Add to Vercel environment variables
echo "Adding VERCEL_TOKEN to Vercel environment variables..."
echo ""

# For Production
echo "$VERCEL_TOKEN_VALUE" | vercel env add VERCEL_TOKEN production
echo "✅ Added to Production"

# For Preview
echo "$VERCEL_TOKEN_VALUE" | vercel env add VERCEL_TOKEN preview
echo "✅ Added to Preview"

# For Development
echo "$VERCEL_TOKEN_VALUE" | vercel env add VERCEL_TOKEN development
echo "✅ Added to Development"

echo ""
echo "============================================"
echo "  VERCEL_TOKEN set successfully!"
echo ""
echo "  Token: $VERCEL_TOKEN_VALUE"
echo ""
echo "  You can now use these API calls:"
echo "  ────────────────────────────────────────"
echo "  # Daily data refresh:"
echo "  curl -X POST https://3boxesjobs.com/api/data-refresh \\"
echo "    -H 'Authorization: Bearer $VERCEL_TOKEN_VALUE'"
echo ""
echo "  # Full production seed:"
echo "  curl -X POST https://3boxesjobs.com/api/seed-production \\"
echo "    -H 'Authorization: Bearer $VERCEL_TOKEN_VALUE' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"mode\":\"full\"}'"
echo "============================================"
