'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  getDraftTrips, 
  saveDraftTrip, 
  deleteDraftTrip, 
  hasPendingDrafts,
  type DraftTrip 
} from '@/lib/draft-trips'
import { mergeDraftTripsToDatabase } from '@/lib/draft-merge'

/**
 * Hook to manage trips (both drafts and database)
 * Automatically handles guest vs authenticated user
 */
export function useTrips() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load trips (from DB if authenticated, from localStorage if guest)
  useEffect(() => {
    loadTrips()
  }, [])

  async function loadTrips() {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      setIsAuthenticated(!!user)

      if (user) {
        // Load from database
        const { data, error: dbError } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (dbError) {
          throw dbError
        }

        setTrips(data || [])
      } else {
        // Load from localStorage (guest mode)
        const drafts = getDraftTrips()
        setTrips(drafts)
      }
    } catch (err: any) {
      console.error('Error loading trips:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    trips,
    loading,
    error,
    isAuthenticated,
    reload: loadTrips,
  }
}

/**
 * Hook to save a trip (draft or database)
 */
export function useSaveTrip() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveTrip(tripData: Omit<DraftTrip, 'id' | 'guestId' | 'createdAt' | 'updatedAt'>) {
    try {
      setSaving(true)
      setError(null)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Save to database
        const { data, error: dbError } = await supabase
          .from('trips')
          .insert({
            user_id: user.id,
            destination: tripData.destination,
            days: tripData.days,
            budget: tripData.budget,
            interests: tripData.interests,
            pace: tripData.pace,
            itinerary: tripData.itinerary,
          })
          .select()
          .single()

        if (dbError) {
          throw dbError
        }

        return { success: true, trip: data }
      } else {
        // Save as draft in localStorage
        const draft = saveDraftTrip(tripData)
        return { success: true, trip: draft, isDraft: true }
      }
    } catch (err: any) {
      console.error('Error saving trip:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  return {
    saveTrip,
    saving,
    error,
  }
}

/**
 * Hook to handle draft merge after login
 */
export function useDraftMerge() {
  const [merging, setMerging] = useState(false)
  const [mergeResult, setMergeResult] = useState<any>(null)

  async function checkAndMerge() {
    if (!hasPendingDrafts()) {
      return { success: true, mergedCount: 0 }
    }

    setMerging(true)

    try {
      const result = await mergeDraftTripsToDatabase()
      setMergeResult(result)
      return result
    } catch (error: any) {
      console.error('Merge error:', error)
      return { success: false, error: error.message }
    } finally {
      setMerging(false)
    }
  }

  return {
    checkAndMerge,
    merging,
    mergeResult,
    hasPendingDrafts: hasPendingDrafts(),
  }
}