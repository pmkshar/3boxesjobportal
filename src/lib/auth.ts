/**
 * Security Module — Authentication Utilities
 *
 * Features:
 * - bcrypt password hashing (replaces SHA-256)
 * - JWT token generation with expiration (replaces random hex)
 * - TOTP 2FA secret generation and verification
 * - Password strength validation
 * - Account lockout utilities
 */

import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { TOTP, generateSecret, generateURI, verify, verifySync } from 'otplib'

// ─── JWT Configuration ────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || '3boxes-jobs-secret-key-change-in-production'
)

const JWT_EXPIRY = '24h' // 24 hours
const JWT_REFRESH_EXPIRY = '7d' // 7 days

// ─── bcrypt Password Hashing ──────────────────────────────────────

const SALT_ROUNDS = 12 // Secure bcrypt salt rounds

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Legacy SHA-256 support for backward compatibility with existing demo data
export function hashPasswordLegacy(password: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(password).digest('hex')
}

export function verifyPasswordLegacy(password: string, hash: string): boolean {
  return hashPasswordLegacy(password) === hash
}

// Smart verify: tries bcrypt first, falls back to SHA-256 for legacy passwords
export async function verifyPasswordSmart(password: string, hash: string): Promise<boolean> {
  // bcrypt hashes always start with $2a$ or $2b$
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return bcrypt.compare(password, hash)
  }
  // Legacy SHA-256 hash — verify and return true if match
  // (the user should be prompted to change password on next login)
  return hashPasswordLegacy(password) === hash
}

// ─── JWT Token Management ──────────────────────────────────────────

export interface TokenPayload {
  userId: string
  email: string
  role: string
  type: 'access' | 'refresh'
}

export async function generateAccessToken(user: { id: string; email: string; role: string }): Promise<string> {
  return new SignJWT({ userId: user.id, email: user.email, role: user.role, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .setIssuer('3boxes-jobs')
    .sign(JWT_SECRET)
}

export async function generateRefreshToken(user: { id: string; email: string; role: string }): Promise<string> {
  return new SignJWT({ userId: user.id, email: user.email, role: user.role, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_REFRESH_EXPIRY)
    .setIssuer('3boxes-jobs')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: '3boxes-jobs',
    })
    return payload as unknown as TokenPayload
  } catch {
    return null // Token expired or invalid
  }
}

// ─── TOTP 2FA ──────────────────────────────────────────────────────

const TOTP_STEP = 30 // 30-second time step

export function generateTwoFactorSecret(): string {
  return generateSecret()
}

export function verifyTwoFactorToken(secret: string, token: string): boolean {
  try {
    return verifySync({ secret, token, step: TOTP_STEP })
  } catch {
    return false
  }
}

export function generateTwoFactorQRCodeURI(email: string, secret: string): string {
  return generateURI({ type: 'totp', secret, label: email, issuer: '3 Boxes Jobs', step: TOTP_STEP })
}

export async function generateTwoFactorQRCodeDataURL(uri: string): Promise<string> {
  const QRCode = require('qrcode')
  return QRCode.toDataURL(uri, { width: 256, margin: 2 })
}

// ─── Password Strength Validation ──────────────────────────────────

export interface PasswordValidationResult {
  isValid: boolean
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  score: number // 0-5
  errors: string[]
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  if (password.length >= 8) score++
  else errors.push('Password must be at least 8 characters long')

  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  else errors.push('Password must contain at least one uppercase letter')

  if (/[a-z]/.test(password)) score++
  else errors.push('Password must contain at least one lowercase letter')

  if (/[0-9]/.test(password)) score++
  else errors.push('Password must contain at least one number')

  if (/[^A-Za-z0-9]/.test(password)) score++
  else errors.push('Password must contain at least one special character (!@#$%^&*)')

  const strengthMap: Record<number, PasswordValidationResult['strength']> = {
    0: 'weak', 1: 'weak', 2: 'fair', 3: 'good', 4: 'strong', 5: 'very-strong',
  }

  return {
    isValid: score >= 4 && password.length >= 8, // Requires at least 4 of 5 criteria
    strength: strengthMap[score] || 'weak',
    score,
    errors,
  }
}

// ─── Account Lockout ───────────────────────────────────────────────

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

export interface LockoutStatus {
  isLocked: boolean
  remainingAttempts: number
  lockoutExpiresAt: Date | null
  message: string
}

export function checkLockoutStatus(failedAttempts: number, lockedUntil: Date | null): LockoutStatus {
  if (lockedUntil && new Date(lockedUntil) > new Date()) {
    const remainingMs = new Date(lockedUntil).getTime() - Date.now()
    const remainingMin = Math.ceil(remainingMs / 60000)
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutExpiresAt: new Date(lockedUntil),
      message: `Account is locked due to too many failed login attempts. Please try again in ${remainingMin} minutes.`,
    }
  }

  const remaining = MAX_FAILED_ATTEMPTS - failedAttempts
  return {
    isLocked: false,
    remainingAttempts: Math.max(0, remaining),
    lockoutExpiresAt: null,
    message: remaining <= 2 ? `Warning: ${remaining} login attempts remaining before account lockout.` : '',
  }
}

export function shouldLockAccount(failedAttempts: number): boolean {
  return failedAttempts >= MAX_FAILED_ATTEMPTS
}

export function getLockoutExpiry(): Date {
  return new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
}

// ─── Legacy token generation for backward compatibility ─────────────

// Keep the old generateToken for memory-store fallback
export function generateTokenLegacy(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}
