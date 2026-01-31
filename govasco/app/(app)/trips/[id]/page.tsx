'use client'

/**
 * Page /trips/[id] - Détail d'un voyage
 *
 * Affiche l'itinéraire complet d'un voyage sauvegardé
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import ItineraryDisplay from '@/components/trip/ItineraryDisplay'
import type { Trip, Itinerary } from '@/lib/types'

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadTrip()
  }, [tripId])

  async function loadTrip() {
    try {
      setLoading(true)
      setError(null)

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: dbError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single()

      if (dbError) {
        if (dbError.code === 'PGRST116') {
          setError('Voyage non trouvé')
        } else {
          throw dbError
        }
        return
      }

      setTrip(data as Trip)
    } catch (err) {
      console.error('Erreur chargement voyage:', err)
      setError('Impossible de charger le voyage')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce voyage ?')) {
      return
    }

    try {
      setDeleting(true)

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Soft delete
      const { error: dbError } = await supabase
        .from('trips')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', tripId)

      if (dbError) throw dbError

      router.push('/dashboard')
    } catch (err) {
      console.error('Erreur suppression:', err)
      setError('Impossible de supprimer le voyage')
    } finally {
      setDeleting(false)
    }
  }

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-4xl">🦊</span>
          </div>
          <p className="text-gray-600">Chargement du voyage...</p>
        </div>
      </div>
    )
  }

  // État d'erreur
  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <span className="text-6xl block mb-4">😢</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Voyage non trouvé'}
          </h1>
          <p className="text-gray-600 mb-6">
            Ce voyage n'existe pas ou vous n'y avez pas accès.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-bold text-xl text-gray-900">{trip.destination}</h1>
              <p className="text-sm text-gray-500">
                {trip.days} jour{trip.days > 1 ? 's' : ''} • Créé le{' '}
                {new Date(trip.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer"
          >
            {deleting ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {trip.itinerary ? (
          <ItineraryDisplay
            itinerary={trip.itinerary as Itinerary}
            onNewTrip={() => router.push('/create')}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <span className="text-5xl block mb-4">📝</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Itinéraire en cours de préparation
            </h2>
            <p className="text-gray-600 mb-6">
              Ce voyage n'a pas encore d'itinéraire généré.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              Générer un itinéraire
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
