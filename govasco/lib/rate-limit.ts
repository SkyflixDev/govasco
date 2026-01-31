/**
 * Rate Limiter for Claude API
 * 
 * Protects against:
 * - Spam/abuse
 * - Budget exhaustion
 * - DDoS attempts
 * 
 * Limits:
 * - Guest (by IP): 3 generations per day
 * - Authenticated user: 10 generations per day
 * - Cooldown: 30 seconds between requests
 */

interface RateLimitEntry {
  count: number
  resetAt: number
  lastRequest: number
}

// In-memory storage (simple MVP solution)
// For production: Use Redis or Supabase
const rateLimitStore = new Map<string, RateLimitEntry>()

// Configuration
const RATE_LIMITS = {
  guest: {
    maxRequests: 3,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  authenticated: {
    maxRequests: 10,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  cooldown: 30 * 1000, // 30 seconds between requests
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

/**
 * Check if request is allowed based on rate limits
 */
export function checkRateLimit(
  identifier: string, // IP address or user_id
  isAuthenticated: boolean = false
): RateLimitResult {
  const now = Date.now()
  const limit = isAuthenticated ? RATE_LIMITS.authenticated : RATE_LIMITS.guest
  
  // Get or create entry
  let entry = rateLimitStore.get(identifier)
  
  // Reset if window expired
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + limit.windowMs,
      lastRequest: 0,
    }
    rateLimitStore.set(identifier, entry)
  }
  
  // Check cooldown (time between requests)
  const timeSinceLastRequest = now - entry.lastRequest
  if (entry.lastRequest > 0 && timeSinceLastRequest < RATE_LIMITS.cooldown) {
    return {
      allowed: false,
      remaining: limit.maxRequests - entry.count,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((RATE_LIMITS.cooldown - timeSinceLastRequest) / 1000),
    }
  }
  
  // Check max requests
  if (entry.count >= limit.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }
  
  // Allow request and increment counter
  entry.count++
  entry.lastRequest = now
  rateLimitStore.set(identifier, entry)
  
  return {
    allowed: true,
    remaining: limit.maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string {
  // Try various headers (different hosting providers use different headers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  if (cfIp) {
    return cfIp
  }
  
  return 'unknown'
}

/**
 * Clear expired entries (call periodically to prevent memory leak)
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60 * 60 * 1000)
}