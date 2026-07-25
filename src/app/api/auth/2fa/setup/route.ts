/**
 * 2FA Setup Endpoint — Generate TOTP secret + QR code for the user
 *
 * POST /api/auth/2fa/setup
 * Headers: Authorization: Bearer <access_token>
 *
 * Returns: { secret, qrCodeDataURL, uri }
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateTwoFactorSecret, generateTwoFactorQRCodeURI, generateTwoFactorQRCodeDataURL } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { verifyToken } = await import('@/lib/auth')
    const payload = await verifyToken(token)
    if (!payload || payload.type !== 'access') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const userId = payload.userId
    const email = payload.email

    // Generate TOTP secret
    const secret = generateTwoFactorSecret()
    const uri = generateTwoFactorQRCodeURI(email, secret)
    const qrCodeDataURL = await generateTwoFactorQRCodeDataURL(uri)

    // Store secret temporarily (not yet verified/enabled)
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      await memoryStore.updateUser(userId, { twoFactorSecret: secret, twoFactorVerified: false })
    } catch {
      try {
        const { db } = await import('@/lib/db')
        await db.user.update({
          where: { id: userId },
          data: { twoFactorSecret: secret, twoFactorVerified: false },
        })
      } catch (dbError) {
        console.error('Failed to store 2FA secret:', dbError)
      }
    }

    return NextResponse.json({
      secret,
      qrCodeDataURL,
      uri,
      message: 'Scan the QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.), then verify by entering the 6-digit code.',
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 })
  }
}
