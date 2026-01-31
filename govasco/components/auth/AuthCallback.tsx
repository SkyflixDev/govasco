'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDraftMerge } from '@/hooks/useTrips'

/**
 * AuthCallback Component
 * 
 * Handles post-authentication actions:
 * 1. Merge draft trips to database
 * 2. Show merge status to user
 * 3. Redirect to appropriate page
 */
export function AuthCallback() {
  const router = useRouter()
  const { checkAndMerge, merging, hasPendingDrafts } = useDraftMerge()
  const [status, setStatus] = useState<'checking' | 'merging' | 'done' | 'error'>('checking')
  const [message, setMessage] = useState('')

  useEffect(() => {
    handleAuthCallback()
  }, [])

  async function handleAuthCallback() {
    try {
      if (hasPendingDrafts) {
        setStatus('merging')
        setMessage('Sauvegarde de vos voyages en cours...')
        
        const result = await checkAndMerge()
        
        if (result.success && (result.mergedCount ?? 0) > 0) {
          setMessage(`✅ ${result.mergedCount} voyage(s) sauvegardé(s) !`)
          setStatus('done')
        } else if (result.success) {
          setStatus('done')
        } else {
          setStatus('error')
          setMessage('Erreur lors de la sauvegarde')
        }
      } else {
        setStatus('done')
      }
      
      // Redirect after 2 seconds
      setTimeout(() => {
        const redirect = new URLSearchParams(window.location.search).get('redirect')
        router.push(redirect || '/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Auth callback error:', error)
      setStatus('error')
      setMessage('Une erreur est survenue')
      
      // Redirect anyway after 3 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-md w-full">
        <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
        
        <div className="p-8 text-center">
          {/* Vasco */}
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl mb-6">
            {status === 'checking' || status === 'merging' ? (
              <span className="text-5xl animate-bounce">🦊</span>
            ) : status === 'done' ? (
              <span className="text-5xl">✅</span>
            ) : (
              <span className="text-5xl">⚠️</span>
            )}
          </div>

          {/* Status */}
          {status === 'checking' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Connexion en cours...
              </h2>
              <p className="text-gray-600">
                Vérification de votre compte
              </p>
            </>
          )}

          {status === 'merging' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Sauvegarde en cours...
              </h2>
              <p className="text-gray-600">
                {message}
              </p>
            </>
          )}

          {status === 'done' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Bienvenue ! 🎉
              </h2>
              <p className="text-gray-600">
                {message || 'Redirection en cours...'}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Oups !
              </h2>
              <p className="text-gray-600">
                {message}
              </p>
            </>
          )}

          {/* Loading indicator */}
          {(status === 'checking' || status === 'merging') && (
            <div className="mt-6">
              <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}
        </div>

        <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
      </div>
    </div>
  )
}