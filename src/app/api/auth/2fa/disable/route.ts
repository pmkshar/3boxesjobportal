/**
 * 2FA Disable — Turn off 2FA for a user
 *
 * POST /api/auth/2fa/disable
 * Headers: Authorization: Bearer <access_token>
 * Body: { otp: string } (must provide current OTP to disable, security measure)
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
      return NextResponse.json({ error: 'Current OTP code is required to disable 2FA (security measure)' }, { status: 400 })
    }

    const userId = payload.userId

    // Get user data
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

    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 })
    }

    // Verify OTP before disabling (security measure — prevents unauthorized disable)
    const isValid = verifyTwoFactorToken(user.twoFactorSecret, otp)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid OTP code. Please enter a fresh code to confirm disabling 2FA.' }, { status: 400 })
    }

    // Disable 2FA
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      await memoryStore.updateUser(userId, { twoFactorEnabled: false, twoFactorVerified: false, twoFactorSecret: null })
    } catch {
      try {
        const { db } = await import('@/lib/db')
        await db.user.update({
          where: { id: userId },
          data: { twoFactorEnabled: false, twoFactorVerified: false, twoFactorSecret: null },
        })
      } catch (dbError) {
        console.error('Failed to disable 2FA:', dbError)
        return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: '2FA has been disabled. Your account now uses only email/password authentication.',
      enabled: false,
    })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
  }
}
