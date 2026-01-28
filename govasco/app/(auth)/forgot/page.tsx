'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/config/constants'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError('')
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
            
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Email envoyé !
              </h2>
              <p className="text-gray-600 mb-6">
                Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
                Cliquez sur le lien dans l'email pour créer un nouveau mot de passe.
              </p>
              <Link
                href="/login"
                className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Retour à la connexion
              </Link>
            </div>

            <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-6xl">🦊</span>
            <span className="text-4xl font-bold text-gray-900">{APP_NAME}</span>
          </div>
          <p className="text-gray-600">Réinitialiser votre mot de passe</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
          
          <div className="p-8">
            {/* Erreur */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <p className="text-gray-600 mb-6">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            {/* Form */}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="votre@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </form>

            {/* Back to login */}
            <p className="mt-6 text-center text-sm text-gray-600">
              <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                ← Retour à la connexion
              </Link>
            </p>
          </div>

          <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
        </div>
      </div>
    </div>
  )
}