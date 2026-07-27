/**
 * Rate Limiter — Prevent brute-force attacks on login endpoint
 *
 * In-memory rate limiting for Vercel serverless environment.
 * Each serverless invocation gets its own instance, but the per-request
 * limiting still prevents rapid automated attacks within a single invocation.
 */

interface RateLimitEntry {
  count: number
  firstAttempt: number
  lastAttempt: number
}

// Global rate limit store (persists across invocations in the same cold start)
const rateLimitStore: Map<string, RateLimitEntry> = new Map()

// Configuration
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes window
const RATE_LIMIT_MAX_ATTEMPTS = 10 // Max 10 login attempts per IP per window

export interface RateLimitResult {
  allowed: boolean
  remainingAttempts: number
  retryAfterMs: number
  message: string
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  // Clean expired entries periodically
  if (entry && now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.delete(ip)
  }

  const current = rateLimitStore.get(ip)

  if (!current) {
    // First attempt from this IP
    rateLimitStore.set(ip, { count: 1, firstAttempt: now, lastAttempt: now })
    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_MAX_ATTEMPTS - 1,
      retryAfterMs: 0,
      message: '',
    }
  }

  if (current.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - current.firstAttempt)
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
      message: `Too many login attempts from this IP. Please try again in ${Math.ceil(retryAfterMs / 60000)} minutes.`,
    }
  }

  // Increment attempt count
  current.count++
  current.lastAttempt = now

  return {
    allowed: true,
    remainingAttempts: RATE_LIMIT_MAX_ATTEMPTS - current.count,
    retryAfterMs: 0,
    message: current.count >= RATE_LIMIT_MAX_ATTEMPTS - 2
      ? `Warning: Only ${RATE_LIMIT_MAX_ATTEMPTS - current.count} login attempts remaining.`
      : '',
  }
}

export function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip)
}

// Extract IP from request headers (Vercel provides x-forwarded-for)
export function getClientIP(request: { headers: { get: (name: string) => string | null } }): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs; the first is the client
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}
