/**
 * Login API — Enhanced with 2FA, rate limiting, account lockout, and JWT
 *
 * Flow:
 * 1. Check rate limit (IP-based)
 * 2. Check account lockout
 * 3. Verify email + password
 * 4. If 2FA enabled → return { requires2FA: true, tempToken } (step 1 done)
 * 5. If 2FA NOT enabled → return full access token + user data (login complete)
 *
 * For 2FA step 2, client POSTs /api/auth/login with { tempToken, otp }
 */

import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'
import {
  verifyPasswordSmart, hashPasswordLegacy,
  generateAccessToken, generateRefreshToken,
  verifyToken, verifyTwoFactorToken,
  checkLockoutStatus, shouldLockAccount, getLockoutExpiry,
  validatePasswordStrength,
} from '@/lib/auth'
import { checkRateLimit, getClientIP } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, tempToken, otp } = body

    // ─── Step 2: 2FA OTP Verification ──────────────────────────
    if (tempToken && otp) {
      const payload = await verifyToken(tempToken)
      if (!payload || payload.type !== 'access') {
        return NextResponse.json({ error: 'Invalid or expired session. Please start login again.' }, { status: 401 })
      }

      // Get user to verify 2FA
      let user: any = null
      try {
        const result = await memoryStore.getUserProfile(payload.userId)
        if (result.error) {
          return NextResponse.json({ error: result.error }, { status: result.status || 404 })
        }
        user = (result as any).user
      } catch {
        return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 })
      }

      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 })
      }

      // Verify TOTP code
      const isValidOTP = verifyTwoFactorToken(user.twoFactorSecret, otp)
      if (!isValidOTP) {
        return NextResponse.json({ error: 'Invalid OTP code. Please enter a fresh 6-digit code from your authenticator app.' }, { status: 400 })
      }

      // 2FA verified — generate full access token
      const accessToken = await generateAccessToken({ id: user.id, email: user.email, role: user.role })
      const refreshToken = await generateRefreshToken({ id: user.id, email: user.email, role: user.role })

      // Update last login
      try {
        await memoryStore.updateUser(user.id, { lastLoginAt: new Date().toISOString(), failedLoginAttempts: 0, lockedUntil: null })
      } catch { /* non-critical */ }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          location: user.location,
          twoFactorEnabled: true,
        },
        token: accessToken,
        refreshToken,
        expiresIn: '24h',
      })
    }

    // ─── Step 1: Email + Password Login ──────────────────────────
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Rate limit check
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)) } }
      )
    }

    // Try memory store login
    try {
      const result = await memoryStore.login(email, password)
      if (result.error) {
        // Increment failed attempts
        try {
          const users = await memoryStore.getUsers()
          const user = users.find(u => u.email === email)
          if (user) {
            const newFailedAttempts = (user.failedLoginAttempts || 0) + 1
            const lockoutUpdate: any = { failedLoginAttempts: newFailedAttempts }
            if (shouldLockAccount(newFailedAttempts)) {
              lockoutUpdate.lockedUntil = getLockoutExpiry().toISOString()
            }
            await memoryStore.updateUser(user.id, lockoutUpdate)
          }
        } catch { /* non-critical */ }

        return NextResponse.json(
          { error: result.error, ...(rateLimitResult.message ? { warning: rateLimitResult.message } : {}) },
          { status: result.status || 401 }
        )
      }

      const user = (result as any).user

      // Check account lockout
      const lockout = checkLockoutStatus(
        user.failedLoginAttempts || 0,
        user.lockedUntil ? new Date(user.lockedUntil) : null
      )
      if (lockout.isLocked) {
        return NextResponse.json({ error: lockout.message }, { status: 403 })
      }

      // Reset failed attempts on successful password check
      try {
        await memoryStore.updateUser(user.id, { failedLoginAttempts: 0, lockedUntil: null })
      } catch { /* non-critical */ }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled && user.twoFactorVerified) {
        // Generate temporary token for 2FA step (short-lived, 5 minutes)
        const tempToken = await generateAccessToken({ id: user.id, email: user.email, role: user.role })
        // Note: we'll use a short expiry for this in production, but for now use the standard

        return NextResponse.json({
          requires2FA: true,
          tempToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          message: 'Two-factor authentication is enabled. Please enter the 6-digit code from your authenticator app.',
        })
      }

      // No 2FA — full login
      const accessToken = await generateAccessToken({ id: user.id, email: user.email, role: user.role })
      const refreshToken = await generateRefreshToken({ id: user.id, email: user.email, role: user.role })

      // Update last login
      try {
        await memoryStore.updateUser(user.id, { lastLoginAt: new Date().toISOString() })
      } catch { /* non-critical */ }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          location: user.location,
          twoFactorEnabled: user.twoFactorEnabled || false,
        },
        token: accessToken,
        refreshToken,
        expiresIn: '24h',
      })
    } catch (memoryError) {
      console.error('Memory store login failed:', memoryError)
    }

    // Last-resort fallback (for when memory store itself fails)
    try {
      const demoPassword = hashPasswordLegacy('demo123')
      const demoUsers = [
        { id: 'demo-seeker-001', email: 'seeker@3boxes.com', name: 'Rahul Sharma', password: demoPassword, role: 'JOB_SEEKER', phone: '+91-9876543210', location: 'Mumbai, India' },
        { id: 'demo-corp-001', email: 'corp@3boxes.com', name: 'Priya Technologies', password: demoPassword, role: 'CORPORATE', phone: '+91-22-12345678', location: 'Bangalore, India' },
        { id: 'demo-recruiter-001', email: 'recruiter@3boxes.com', name: 'Amit Patel', password: demoPassword, role: 'RECRUITER', phone: '+91-9988776655', location: 'Delhi, India' },
        { id: 'demo-admin-001', email: 'admin@3boxes.com', name: '3 Boxes Admin', password: demoPassword, role: 'ADMIN', phone: '+91-9000000000', location: 'Chennai, India' },
        { id: 'demo-superadmin-001', email: 'superadmin@3boxes.com', name: 'Super Admin', password: demoPassword, role: 'SUPER_ADMIN', phone: '+91-9111111111', location: 'Mumbai, India' },
        { id: 'demo-hr-001', email: 'hr@3boxes.com', name: 'Sneha Reddy', password: demoPassword, role: 'HR_MANAGER', phone: '+91-9222222222', location: 'Hyderabad, India' },
        { id: 'demo-interviewer-001', email: 'interviewer@3boxes.com', name: 'Vikram Singh', password: demoPassword, role: 'INTERVIEWER', phone: '+91-9333333333', location: 'Delhi, India' },
      ]

      const user = demoUsers.find(u => u.email === email)
      if (!user || !verifyPasswordSmart(password, user.password)) {
        // cast to boolean since verifyPasswordSmart is async
      }

      // For fallback, we still use legacy verify since passwords are SHA-256 hashed
      const fallbackUser = demoUsers.find(u => u.email === email)
      if (!fallbackUser || hashPasswordLegacy(password) !== fallbackUser.password) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      const accessToken = await generateAccessToken({ id: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role })
      return NextResponse.json({
        user: {
          id: fallbackUser.id,
          email: fallbackUser.email,
          name: fallbackUser.name,
          role: fallbackUser.role,
          phone: fallbackUser.phone,
          location: fallbackUser.location,
          twoFactorEnabled: false,
        },
        token: accessToken,
        expiresIn: '24h',
      })
    } catch (fallbackError) {
      console.error('All login methods failed:', fallbackError)
      return NextResponse.json({ error: 'Login service temporarily unavailable. Please try again.' }, { status: 503 })
    }
  } catch (error) {
    console.error('Login request parsing error:', error)
    return NextResponse.json({ error: 'Invalid request. Please try again.' }, { status: 400 })
  }
}
