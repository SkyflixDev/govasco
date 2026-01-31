'use client'

/**
 * Page /create - Création d'itinéraire (accessible aux guests)
 *
 * Flow :
 * 1. Formulaire 3 étapes
 * 2. Génération via API Claude
 * 3. Affichage résultat
 * 4. Sauvegarde (local pour guest, DB pour auth)
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TripForm from '@/components/trip/TripForm'
import ItineraryDisplay from '@/components/trip/ItineraryDisplay'
import { useAuthModal } from '@/components/providers/AuthModalProvider'
import { saveDraftTrip } from '@/lib/draft-trips'
import { createBrowserClient } from '@supabase/ssr'
import type { TripInput, Itinerary, GenerateItineraryResponse } from '@/lib/types'

type PageState = 'form' | 'generating' | 'result' | 'error'

export default function CreatePage() {
  const router = useRouter()
  const { showAuthModal } = useAuthModal()

  const [pageState, setPageState] = useState<PageState>('form')
  const [tripInput, setTripInput] = useState<TripInput | null>(null)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generatingMessage, setGeneratingMessage] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Vérifier l'auth au montage
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

  // Messages de génération animés
  useEffect(() => {
    if (pageState !== 'generating') return

    const messages = [
      'Vasco explore les meilleures adresses...',
      'Recherche des activités incontournables...',
      'Calcul des meilleurs itinéraires...',
      'Vasco peaufine les recommandations...',
      'Préparation de votre aventure...',
    ]

    let index = 0
    setGeneratingMessage(messages[0])

    const interval = setInterval(() => {
      index = (index + 1) % messages.length
      setGeneratingMessage(messages[index])
    }, 3000)

    return () => clearInterval(interval)
  }, [pageState])

  // Générer l'itinéraire
  const handleGenerate = async (input: TripInput) => {
    setTripInput(input)
    setPageState('generating')
    setError(null)

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      const data: GenerateItineraryResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la génération')
      }

      setItinerary(data.itinerary!)
      setPageState('result')

      // Auto-save en local pour les guests
      if (!isAuthenticated && data.itinerary) {
        try {
          saveDraftTrip({
            destination: input.destination,
            days: input.days,
            budget: input.budget,
            interests: input.interests,
            pace: input.pace,
            itinerary: data.itinerary,
          })
          console.log('Draft sauvegardé localement')
        } catch (e) {
          console.warn('Impossible de sauvegarder le draft:', e)
        }
      }
    } catch (err) {
      console.error('Erreur génération:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setPageState('error')
    }
  }

  // Sauvegarder en base de données
  const handleSave = async () => {
    if (!isAuthenticated) {
      // Afficher le modal d'auth
      showAuthModal({
        message: 'Connectez-vous pour sauvegarder votre voyage et y accéder depuis n\'importe où',
        redirectAfterLogin: '/dashboard',
      })
      return
    }

    if (!tripInput || !itinerary) return

    setIsSaving(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          destination: tripInput.destination,
          days: tripInput.days,
          budget: tripInput.budget,
          interests: tripInput.interests,
          pace: tripInput.pace,
          itinerary: itinerary,
        })
        .select('id')
        .single()

      if (error) throw error

      // Rediriger vers la page du voyage
      router.push(`/trips/${data.id}`)
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      setError('Impossible de sauvegarder. Réessayez.')
    } finally {
      setIsSaving(false)
    }
  }

  // Nouveau voyage
  const handleNewTrip = () => {
    setPageState('form')
    setTripInput(null)
    setItinerary(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header simplifié */}
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🦊</span>
            <span className="font-bold text-xl text-gray-900">GoVasco</span>
          </Link>

          {!isAuthenticated && (
            <Link
              href="/login"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Se connecter
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Mon dashboard
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* État: Formulaire */}
        {pageState === 'form' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-5xl block mb-4">🦊</span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Créez votre itinéraire
              </h1>
              <p className="text-gray-600">
                Vasco vous prépare un voyage sur mesure en quelques clics
              </p>
            </div>

            <TripForm onSubmit={handleGenerate} />
          </div>
        )}

        {/* État: Génération en cours */}
        {pageState === 'generating' && (
          <div className="max-w-md mx-auto text-center py-20">
            {/* Animation Vasco */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <span className="text-6xl animate-bounce">🦊</span>
              </div>
            </div>

            {/* Message animé */}
            <p className="text-xl font-medium text-gray-900 mb-2">
              {generatingMessage}
            </p>
            <p className="text-gray-500 text-sm">
              Cela peut prendre jusqu'à 30 secondes
            </p>

            {/* Progress bar */}
            <div className="mt-8 h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto">
              <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 animate-progress" />
            </div>
          </div>
        )}

        {/* État: Résultat */}
        {pageState === 'result' && itinerary && (
          <ItineraryDisplay
            itinerary={itinerary}
            onSave={handleSave}
            onNewTrip={handleNewTrip}
            isSaving={isSaving}
          />
        )}

        {/* État: Erreur */}
        {pageState === 'error' && (
          <div className="max-w-md mx-auto text-center py-20">
            <span className="text-6xl block mb-4">😢</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Oups, quelque chose s'est mal passé
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => tripInput && handleGenerate(tripInput)}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                Réessayer
              </button>
              <button
                onClick={handleNewTrip}
                className="py-3 px-6 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Modifier les paramètres
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Styles pour l'animation de progress */}
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 30s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
