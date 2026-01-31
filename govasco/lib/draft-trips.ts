/**
 * Draft Trip Storage
 * 
 * Stores trip drafts in localStorage for guest users
 * Drafts are automatically merged to database when user authenticates
 */

import { getGuestId } from './guest-session'

const DRAFT_TRIPS_KEY = 'govasco_draft_trips'

/**
 * Draft Trip interface
 */
export interface DraftTrip {
  id: string
  guestId: string
  destination: string
  days: number
  budget: 'economic' | 'balanced' | 'comfort'
  interests: string[]
  pace: 'relaxed' | 'balanced' | 'intense'
  itinerary: any // Generated itinerary JSON
  createdAt: string
  updatedAt: string
}

/**
 * Generate a short ID for drafts
 */
function generateDraftId(): string {
  return 'draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * Get all draft trips from localStorage
 */
export function getDraftTrips(): DraftTrip[] {
  if (typeof window === 'undefined') return []
  
  try {
    const draftsJson = localStorage.getItem(DRAFT_TRIPS_KEY)
    if (!draftsJson) return []
    
    const drafts = JSON.parse(draftsJson)
    return Array.isArray(drafts) ? drafts : []
  } catch (error) {
    console.error('Error reading draft trips:', error)
    return []
  }
}

/**
 * Save draft trip to localStorage
 */
export function saveDraftTrip(
  trip: Omit<DraftTrip, 'id' | 'guestId' | 'createdAt' | 'updatedAt'>
): DraftTrip {
  if (typeof window === 'undefined') {
    throw new Error('Cannot save draft trip on server')
  }
  
  const guestId = getGuestId()
  const now = new Date().toISOString()
  
  const draft: DraftTrip = {
    ...trip,
    id: generateDraftId(),
    guestId,
    createdAt: now,
    updatedAt: now,
  }
  
  try {
    const drafts = getDraftTrips()
    drafts.push(draft)
    localStorage.setItem(DRAFT_TRIPS_KEY, JSON.stringify(drafts))
    
    console.log('✅ Draft trip saved to localStorage:', draft.id)
    return draft
  } catch (error) {
    console.error('Failed to save draft trip:', error)
    throw error
  }
}

/**
 * Update an existing draft trip
 */
export function updateDraftTrip(id: string, updates: Partial<Omit<DraftTrip, 'id' | 'guestId' | 'createdAt'>>): DraftTrip | null {
  if (typeof window === 'undefined') return null
  
  try {
    const drafts = getDraftTrips()
    const index = drafts.findIndex(d => d.id === id)
    
    if (index === -1) return null
    
    drafts[index] = {
      ...drafts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    localStorage.setItem(DRAFT_TRIPS_KEY, JSON.stringify(drafts))
    
    console.log('✅ Draft trip updated:', id)
    return drafts[index]
  } catch (error) {
    console.error('Failed to update draft trip:', error)
    return null
  }
}

/**
 * Get a specific draft trip by ID
 */
export function getDraftTrip(id: string): DraftTrip | null {
  const drafts = getDraftTrips()
  return drafts.find(draft => draft.id === id) || null
}

/**
 * Delete a draft trip
 */
export function deleteDraftTrip(id: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const drafts = getDraftTrips()
    const filtered = drafts.filter(draft => draft.id !== id)
    
    if (filtered.length === drafts.length) {
      return false // Draft not found
    }
    
    localStorage.setItem(DRAFT_TRIPS_KEY, JSON.stringify(filtered))
    console.log('✅ Draft trip deleted:', id)
    return true
  } catch (error) {
    console.error('Failed to delete draft trip:', error)
    return false
  }
}

/**
 * Clear all draft trips (called after merge to DB)
 */
export function clearAllDraftTrips(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(DRAFT_TRIPS_KEY)
    console.log('✅ All draft trips cleared')
  } catch (error) {
    console.error('Failed to clear draft trips:', error)
  }
}

/**
 * Check if there are any pending drafts
 */
export function hasPendingDrafts(): boolean {
  return getDraftTrips().length > 0
}

/**
 * Get number of pending drafts
 */
export function getPendingDraftsCount(): number {
  return getDraftTrips().length
}