'use client'

/**
 * TripForm - Formulaire de création de voyage en 3 étapes
 *
 * Étape 1: Infos (destination, durée, voyageurs, budget)
 * Étape 2: Préférences (intérêts, rythme)
 * Étape 3: Résumé + Génération
 */

import { useState } from 'react'
import { INTERESTS, INTEREST_LABELS, COMFORT_LABELS, TRAVEL_PACE_LABELS } from '@/lib/config/constants'
import type { TripInput, Budget, Pace, Interest } from '@/lib/types'

interface TripFormProps {
  onSubmit: (data: TripInput) => void
  isLoading?: boolean
}

export default function TripForm({ onSubmit, isLoading = false }: TripFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<TripInput>>({
    destination: '',
    days: 3,
    travelers: 1,
    budget: 'balanced',
    interests: [],
    pace: 'balanced',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validation par étape
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.destination || formData.destination.trim().length < 2) {
        newErrors.destination = 'Entrez une destination valide'
      }
      if (!formData.days || formData.days < 1 || formData.days > 30) {
        newErrors.days = 'Entre 1 et 30 jours'
      }
      if (!formData.travelers || formData.travelers < 1 || formData.travelers > 20) {
        newErrors.travelers = 'Entre 1 et 20 voyageurs'
      }
    }

    if (currentStep === 2) {
      if (!formData.interests || formData.interests.length === 0) {
        newErrors.interests = 'Sélectionnez au moins 1 intérêt'
      }
      if (formData.interests && formData.interests.length > 5) {
        newErrors.interests = 'Maximum 5 intérêts'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = () => {
    if (validateStep(step)) {
      onSubmit(formData as TripInput)
    }
  }

  const toggleInterest = (interest: Interest) => {
    const current = formData.interests || []
    if (current.includes(interest)) {
      setFormData({ ...formData, interests: current.filter((i) => i !== interest) })
    } else if (current.length < 5) {
      setFormData({ ...formData, interests: [...current, interest] })
    }
    setErrors({ ...errors, interests: '' })
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  i === step
                    ? 'bg-orange-500 text-white scale-110'
                    : i < step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < step ? '✓' : i}
              </div>
              {i < 3 && (
                <div
                  className={`w-16 sm:w-24 h-1 mx-2 ${
                    i < step ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span className={step === 1 ? 'text-orange-600 font-medium' : ''}>Infos</span>
          <span className={step === 2 ? 'text-orange-600 font-medium' : ''}>Préférences</span>
          <span className={step === 3 ? 'text-orange-600 font-medium' : ''}>Confirmation</span>
        </div>
      </div>

      {/* Step 1: Infos */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-2xl font-bold text-gray-900">Où voulez-vous partir ?</h2>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => {
                setFormData({ ...formData, destination: e.target.value })
                setErrors({ ...errors, destination: '' })
              }}
              placeholder="Ex: Marrakech, Tokyo, Barcelone..."
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                errors.destination ? 'border-red-400' : 'border-gray-200 focus:border-orange-500'
              }`}
            />
            {errors.destination && (
              <p className="mt-1 text-sm text-red-500">{errors.destination}</p>
            )}
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée du voyage
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, days: Math.max(1, (formData.days || 1) - 1) })
                }
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-2xl font-bold transition-colors"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <span className="text-4xl font-bold text-orange-600">{formData.days}</span>
                <span className="text-gray-600 ml-2">jour{(formData.days || 1) > 1 ? 's' : ''}</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, days: Math.min(30, (formData.days || 1) + 1) })
                }
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-2xl font-bold transition-colors"
              >
                +
              </button>
            </div>
            {errors.days && <p className="mt-1 text-sm text-red-500">{errors.days}</p>}
          </div>

          {/* Voyageurs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de voyageurs
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    travelers: Math.max(1, (formData.travelers || 1) - 1),
                  })
                }
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-2xl font-bold transition-colors"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <span className="text-4xl font-bold text-orange-600">{formData.travelers}</span>
                <span className="text-gray-600 ml-2">
                  personne{(formData.travelers || 1) > 1 ? 's' : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    travelers: Math.min(20, (formData.travelers || 1) + 1),
                  })
                }
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-2xl font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
            <div className="grid grid-cols-3 gap-3">
              {(['economic', 'balanced', 'comfort'] as Budget[]).map((budget) => (
                <button
                  key={budget}
                  type="button"
                  onClick={() => setFormData({ ...formData, budget })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    formData.budget === budget
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">
                    {budget === 'economic' ? '💰' : budget === 'balanced' ? '⚖️' : '✨'}
                  </span>
                  <span className="text-sm font-medium">
                    {budget === 'economic'
                      ? 'Économique'
                      : budget === 'balanced'
                      ? 'Équilibré'
                      : 'Confort'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Préférences */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-2xl font-bold text-gray-900">Vos préférences</h2>

          {/* Intérêts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Centres d'intérêt{' '}
              <span className="text-gray-400">(1 à 5 maximum)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INTERESTS.map((interest) => {
                const isSelected = formData.interests?.includes(interest)
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {INTEREST_LABELS[interest]}
                  </button>
                )
              })}
            </div>
            {errors.interests && (
              <p className="mt-2 text-sm text-red-500">{errors.interests}</p>
            )}
          </div>

          {/* Rythme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rythme de voyage
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['relaxed', 'balanced', 'intense'] as Pace[]).map((pace) => (
                <button
                  key={pace}
                  type="button"
                  onClick={() => setFormData({ ...formData, pace })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    formData.pace === pace
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">
                    {pace === 'relaxed' ? '🐌' : pace === 'balanced' ? '🚶' : '🏃'}
                  </span>
                  <span className="text-sm font-medium">
                    {pace === 'relaxed'
                      ? 'Tranquille'
                      : pace === 'balanced'
                      ? 'Équilibré'
                      : 'Intense'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Résumé */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-2xl font-bold text-gray-900">Votre voyage</h2>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="text-lg font-semibold text-gray-900">{formData.destination}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm text-gray-500">Durée</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.days} jour{(formData.days || 1) > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-sm text-gray-500">Voyageurs</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.travelers} personne{(formData.travelers || 1) > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {COMFORT_LABELS[formData.budget as Budget]}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">❤️</span>
                <div>
                  <p className="text-sm text-gray-500">Intérêts</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.interests?.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-white rounded-full text-sm font-medium text-orange-700 border border-orange-200"
                      >
                        {INTEREST_LABELS[interest]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🏃</span>
                <div>
                  <p className="text-sm text-gray-500">Rythme</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {TRAVEL_PACE_LABELS[formData.pace as Pace]}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mascotte Vasco */}
          <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 text-center">
            <span className="text-5xl block mb-3">🦊</span>
            <p className="text-gray-700">
              <span className="font-semibold text-orange-600">Vasco</span> est prêt à créer
              votre itinéraire personnalisé !
            </p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex gap-4">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            disabled={isLoading}
            className="flex-1 py-4 px-6 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Retour
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
          >
            Suivant
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Vasco génère...</span>
              </>
            ) : (
              <>
                <span>Générer mon itinéraire</span>
                <span className="text-xl">🦊</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
