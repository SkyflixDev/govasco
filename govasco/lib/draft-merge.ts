/**
 * Draft Merge System
 * 
 * Automatically merges guest draft trips to database when user authenticates
 * Called in the auth callback after successful login/signup
 */

import { createClient } from '@/lib/supabase/client'
import { getDraftTrips, clearAllDraftTrips } from './draft-trips'
import { clearGuestSession } from './guest-session'

export interface MergeResult {
  success: boolean
  mergedCount: number
  failedCount: number
  errors: string[]
}

/**
 * Merge all draft trips to database
 * Should be called after user authenticates
 */
export async function mergeDraftTripsToDatabase(): Promise<MergeResult> {
  const result: MergeResult = {
    success: false,
    mergedCount: 0,
    failedCount: 0,
    errors: [],
  }
  
  try {
    // Get current user
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      result.errors.push('No authenticated user found')
      return result
    }
    
    // Get all draft trips from localStorage
    const drafts = getDraftTrips()
    
    if (drafts.length === 0) {
      result.success = true
      return result
    }
    
    console.log(`🔄 Merging ${drafts.length} draft trip(s) to database...`)
    
    // Convert drafts to database format
    const tripsToInsert = drafts.map(draft => ({
      user_id: user.id,
      destination: draft.destination,
      days: draft.days,
      budget: draft.budget,
      interests: draft.interests,
      pace: draft.pace,
      itinerary: draft.itinerary,
      created_at: draft.createdAt,
      updated_at: draft.updatedAt,
    }))
    
    // Insert all trips to database
    const { data, error } = await supabase
      .from('trips')
      .insert(tripsToInsert)
      .select()
    
    if (error) {
      console.error('❌ Failed to merge drafts:', error)
      result.errors.push(error.message)
      result.failedCount = drafts.length
      return result
    }
    
    // Success! Clear drafts and guest session
    result.success = true
    result.mergedCount = data?.length || drafts.length
    
    clearAllDraftTrips()
    clearGuestSession()
    
    console.log(`✅ Successfully merged ${result.mergedCount} trip(s) to database`)
    
    return result
    
  } catch (error: any) {
    console.error('❌ Merge error:', error)
    result.errors.push(error.message || 'Unknown error')
    return result
  }
}

/**
 * Check if merge is needed (has pending drafts and user is authenticated)
 */
export async function shouldMergeDrafts(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  const drafts = getDraftTrips()
  if (drafts.length === 0) return false
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return !!user
}