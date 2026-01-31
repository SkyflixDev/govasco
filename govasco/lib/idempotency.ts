/**
 * Idempotency Key System
 * 
 * Prevents duplicate requests and saves API costs by:
 * - Caching successful responses for 24 hours
 * - Returning cached result if same key is used
 * - Preventing accidental double-clicks
 */

interface IdempotencyEntry {
  result: any
  createdAt: number
  expiresAt: number
}

// In-memory storage (simple MVP solution)
// For production: Use Redis or Supabase
const idempotencyStore = new Map<string, IdempotencyEntry>()

// Configuration
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Generate idempotency key from request data
 */
export function generateIdempotencyKey(data: any): string {
  // Create a deterministic key from the request data
  const normalized = JSON.stringify(data, Object.keys(data).sort())
  return hashString(normalized)
}

/**
 * Simple hash function (for MVP)
 * For production: Use crypto.subtle.digest or similar
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Check if idempotency key exists and is valid
 */
export function checkIdempotencyKey(key: string): {
  exists: boolean
  result?: any
} {
  const entry = idempotencyStore.get(key)
  
  if (!entry) {
    return { exists: false }
  }
  
  const now = Date.now()
  
  // Check if expired
  if (now > entry.expiresAt) {
    idempotencyStore.delete(key)
    return { exists: false }
  }
  
  // Return cached result
  return {
    exists: true,
    result: entry.result,
  }
}

/**
 * Store result with idempotency key
 */
export function storeIdempotencyResult(key: string, result: any): void {
  const now = Date.now()
  
  idempotencyStore.set(key, {
    result,
    createdAt: now,
    expiresAt: now + IDEMPOTENCY_TTL,
  })
}

/**
 * Clear expired entries (call periodically to prevent memory leak)
 */
export function cleanupIdempotencyStore() {
  const now = Date.now()
  for (const [key, entry] of idempotencyStore.entries()) {
    if (now > entry.expiresAt) {
      idempotencyStore.delete(key)
    }
  }
}

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupIdempotencyStore, 60 * 60 * 1000)
}