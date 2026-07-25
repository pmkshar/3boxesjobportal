/**
 * 2FA Verify Setup — Confirm the TOTP secret by verifying first OTP
 *
 * POST /api/auth/2fa/verify-setup
 * Headers: Authorization: Bearer <access_token>
 * Body: { otp: string }
 *
 * After successful verification, 2FA is ENABLED for the user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, verifyTwoFactorToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.type !== 'access') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const body = await request.json()
    const { otp } = body

    if (!otp) {
      return NextResponse.json({ error: 'OTP code is required' }, { status: 400 })
    }

    const userId = payload.userId

    // Get the user's stored 2FA secret
    let user: any = null
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      const users = await memoryStore.getUsers()
      user = users.find(u => u.id === userId)
    } catch {
      try {
        const { db } = await import('@/lib/db')
        user = await db.user.findUnique({ where: { id: userId } })
      } catch {
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA setup not initiated. Call /api/auth/2fa/setup first.' }, { status: 400 })
    }

    // Verify the OTP against the stored secret
    const isValid = verifyTwoFactorToken(user.twoFactorSecret, otp)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid OTP code. Please try again with a fresh code from your authenticator app.' }, { status: 400 })
    }

    // Enable 2FA for the user
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      await memoryStore.updateUser(userId, { twoFactorEnabled: true, twoFactorVerified: true })
    } catch {
      try {
        const { db } = await import('@/lib/db')
        await db.user.update({
          where: { id: userId },
          data: { twoFactorEnabled: true, twoFactorVerified: true },
        })
      } catch (dbError) {
        console.error('Failed to enable 2FA:', dbError)
        return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: '2FA has been successfully enabled! You will now need to enter an OTP code from your authenticator app every time you log in.',
      enabled: true,
    })
  } catch (error) {
    console.error('2FA verify-setup error:', error)
    return NextResponse.json({ error: 'Failed to verify 2FA setup' }, { status: 500 })
  }
}
