/**
 * Guest Session Manager
 * 
 * Manages guest user sessions with stable identifiers
 * Allows guests to use the app without authentication
 * and preserve their data when they eventually sign up/login
 */

const GUEST_ID_KEY = 'govasco_guest_id'
const GUEST_CREATED_AT_KEY = 'govasco_guest_created_at'

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get or create guest ID
 * This ID persists across sessions in localStorage
 */
export function getGuestId(): string {
  // Only works in browser
  if (typeof window === 'undefined') {
    return 'ssr-guest-' + Date.now()
  }
  
  try {
    let guestId = localStorage.getItem(GUEST_ID_KEY)
    
    if (!guestId) {
      guestId = 'guest_' + generateUUID()
      localStorage.setItem(GUEST_ID_KEY, guestId)
      localStorage.setItem(GUEST_CREATED_AT_KEY, new Date().toISOString())
    }
    
    return guestId
  } catch (error) {
    // If localStorage is blocked (privacy mode, etc.)
    console.warn('localStorage not available, using session guest ID')
    return 'session-guest-' + Date.now()
  }
}

/**
 * Check if current session is a guest
 */
export function isGuestSession(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const guestId = localStorage.getItem(GUEST_ID_KEY)
    return !!guestId
  } catch {
    return false
  }
}

/**
 * Clear guest session (called after successful merge to DB)
 */
export function clearGuestSession(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(GUEST_ID_KEY)
    localStorage.removeItem(GUEST_CREATED_AT_KEY)
  } catch (error) {
    console.warn('Failed to clear guest session:', error)
  }
}

/**
 * Get guest session info
 * Creates a guest session if none exists
 */
export function getGuestSessionInfo(): {
  id: string
  createdAt: string | null
  isGuest: boolean
} {
  if (typeof window === 'undefined') {
    return { id: 'ssr', createdAt: null, isGuest: false }
  }
  
  try {
    // Get or create guest ID
    const id = getGuestId()
    const createdAt = localStorage.getItem(GUEST_CREATED_AT_KEY)
    
    return {
      id,
      createdAt,
      isGuest: true,
    }
  } catch {
    return { id: 'none', createdAt: null, isGuest: false }
  }
}