'use client'

import { useRouter } from 'next/navigation'
import { APP_NAME } from '@/lib/config/constants'

interface RequireAuthModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
  redirectAfterLogin?: string
}

export function RequireAuthModal({
  isOpen,
  onClose,
  message = 'Connectez-vous pour sauvegarder votre voyage',
  redirectAfterLogin = '/dashboard',
}: RequireAuthModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleLogin = () => {
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectAfterLogin)}`
    router.push(loginUrl)
  }

  const handleSignup = () => {
    const signupUrl = `/signup?redirect=${encodeURIComponent(redirectAfterLogin)}`
    router.push(signupUrl)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-md w-full pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec accent */}
          <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />

          <div className="p-8 text-center">
            {/* Vasco */}
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl mb-6">
              <span className="text-5xl">🦊</span>
            </div>

            {/* Titre */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Sauvegardez votre voyage
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleSignup}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Créer un compte
              </button>

              <button
                onClick={handleLogin}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                J'ai déjà un compte
              </button>

              <button
                onClick={onClose}
                className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors py-2"
              >
                Continuer sans sauvegarder
              </button>
            </div>
          </div>

          {/* Footer avec accent */}
          <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
        </div>
      </div>
    </>
  )
}