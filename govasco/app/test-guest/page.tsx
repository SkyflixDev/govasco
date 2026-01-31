'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { saveDraftTrip, getDraftTrips, clearAllDraftTrips } from '@/lib/draft-trips'
import { getGuestId, isGuestSession, getGuestSessionInfo } from '@/lib/guest-session'

export default function TestGuestSystemPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<any[]>([])
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  // Load client-only data after mount to avoid hydration mismatch
  useEffect(() => {
    setDrafts(getDraftTrips())
    setSessionInfo(getGuestSessionInfo())
    setMounted(true)
  }, [])

  const createTestDraft = () => {
    const draft = saveDraftTrip({
      destination: 'Tokyo Test',
      days: 7,
      budget: 'balanced',
      interests: ['culture', 'gastro'],
      pace: 'balanced',
      itinerary: {
        test: true,
        message: 'This is a test draft created before login',
      },
    })

    setDrafts(getDraftTrips())
    alert(`✅ Draft créé : ${draft.id}`)
  }

  const clearDrafts = () => {
    clearAllDraftTrips()
    setDrafts([])
    alert('✅ Drafts supprimés')
  }

  const goToLogin = () => {
    router.push('/login?redirect=/dashboard')
  }

  // Show loading state during SSR/hydration
  if (!mounted || !sessionInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🦊</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Test Guest System</h1>
          <p className="text-gray-600 mb-8">
            Test du système de guest session + auto-merge
          </p>

          {/* Session Info */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-bold mb-2">📊 Session Info</h2>
            <div className="text-sm space-y-1">
              <p><strong>Guest ID:</strong> {sessionInfo.id}</p>
              <p><strong>Is Guest:</strong> {sessionInfo.isGuest ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Created At:</strong> {sessionInfo.createdAt || 'N/A'}</p>
            </div>
          </div>

          {/* Draft Trips */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="font-bold mb-2">📝 Draft Trips ({drafts.length})</h2>
            {drafts.length === 0 ? (
              <p className="text-sm text-gray-600">Aucun draft</p>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <div key={draft.id} className="p-3 bg-white rounded border text-sm">
                    <p><strong>ID:</strong> {draft.id}</p>
                    <p><strong>Destination:</strong> {draft.destination}</p>
                    <p><strong>Days:</strong> {draft.days}</p>
                    <p><strong>Created:</strong> {new Date(draft.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={createTestDraft}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              1️⃣ Créer un draft voyage (guest mode)
            </button>

            <button
              onClick={goToLogin}
              disabled={drafts.length === 0}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              2️⃣ Se connecter (test merge) {drafts.length > 0 && `→ ${drafts.length} draft(s)`}
            </button>

            <button
              onClick={clearDrafts}
              className="w-full bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              🗑️ Nettoyer les drafts
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <h3 className="font-bold mb-2">📋 Instructions de test</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Clique sur "Créer un draft voyage" (simule un guest qui crée un voyage)</li>
              <li>Vérifie que le draft apparaît dans la liste</li>
              <li>Clique sur "Se connecter" (tu seras redirigé vers /login)</li>
              <li>Connecte-toi avec Google</li>
              <li>Tu devrais voir la page "/auth-callback" avec Vasco qui merge</li>
              <li>Tu seras redirigé vers /dashboard</li>
              <li>Vérifie dans Supabase que le voyage est bien en DB !</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}