/**
 * API Protection Helper
 * 
 * Combines rate limiting and idempotency for easy use in API routes
 */

import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from './rate-limit'
import { checkIdempotencyKey, generateIdempotencyKey, storeIdempotencyResult } from './idempotency'

export interface ProtectionOptions {
  requireAuth?: boolean
  skipRateLimit?: boolean
  skipIdempotency?: boolean
}

export interface ProtectionResult {
  allowed: boolean
  response?: NextResponse
  idempotencyKey?: string
  cachedResult?: any
}

/**
 * Protect API route with rate limiting and idempotency
 */
export async function protectApiRoute(
  request: Request,
  userId: string | null,
  requestData: any,
  options: ProtectionOptions = {}
): Promise<ProtectionResult> {
  const { requireAuth = false, skipRateLimit = false, skipIdempotency = false } = options
  
  // Check authentication if required
  if (requireAuth && !userId) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    }
  }
  
  // Generate idempotency key
  const idempotencyKey = generateIdempotencyKey(requestData)
  
  // Check idempotency (return cached result if exists)
  if (!skipIdempotency) {
    const idempotencyCheck = checkIdempotencyKey(idempotencyKey)
    if (idempotencyCheck.exists) {
      return {
        allowed: false,
        cachedResult: idempotencyCheck.result,
        idempotencyKey,
      }
    }
  }
  
  // Check rate limit
  if (!skipRateLimit) {
    const identifier = userId || getClientIp(request)
    const rateLimit = checkRateLimit(identifier, !!userId)
    
    if (!rateLimit.allowed) {
      const retryAfterHeader = rateLimit.retryAfter
        ? { 'Retry-After': rateLimit.retryAfter.toString() }
        : {}
      
      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            remaining: rateLimit.remaining,
            resetAt: new Date(rateLimit.resetAt).toISOString(),
            retryAfter: rateLimit.retryAfter,
          },
          {
            status: 429,
            headers: {
              ...retryAfterHeader,
              'X-RateLimit-Remaining': rateLimit.remaining.toString(),
              'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
            },
          }
        ),
      }
    }
  }
  
  // All checks passed
  return {
    allowed: true,
    idempotencyKey,
  }
}

/**
 * Save result to idempotency cache
 */
export function cacheApiResult(idempotencyKey: string, result: any): void {
  storeIdempotencyResult(idempotencyKey, result)
}