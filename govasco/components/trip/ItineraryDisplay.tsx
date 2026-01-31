'use client'

/**
 * ItineraryDisplay - Affichage de l'itinéraire généré
 *
 * Affiche l'itinéraire jour par jour avec :
 * - Timeline des activités
 * - Recommandations repas
 * - Hébergement
 * - Budget total
 */

import { useState } from 'react'
import type { Itinerary, Day, Activity } from '@/lib/types'

interface ItineraryDisplayProps {
  itinerary: Itinerary
  onSave?: () => void
  onNewTrip?: () => void
  isSaving?: boolean
}

export default function ItineraryDisplay({
  itinerary,
  onSave,
  onNewTrip,
  isSaving = false,
}: ItineraryDisplayProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1)

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Votre itinéraire pour {itinerary.destination}
        </h1>
        <p className="text-gray-600">
          {itinerary.days.length} jour{itinerary.days.length > 1 ? 's' : ''} d'aventure
        </p>
      </div>

      {/* Budget Summary */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 mb-8 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>💰</span> Budget estimé
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <p className="text-orange-100 text-sm">Hébergement</p>
            <p className="font-bold">{itinerary.budgetSummary.accommodation}</p>
          </div>
          <div>
            <p className="text-orange-100 text-sm">Repas</p>
            <p className="font-bold">{itinerary.budgetSummary.food}</p>
          </div>
          <div>
            <p className="text-orange-100 text-sm">Activités</p>
            <p className="font-bold">{itinerary.budgetSummary.activities}</p>
          </div>
          <div>
            <p className="text-orange-100 text-sm">Transport</p>
            <p className="font-bold">{itinerary.budgetSummary.transport}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white/20 rounded-xl p-3 text-center">
            <p className="text-orange-100 text-sm">Total</p>
            <p className="font-bold text-xl">{itinerary.budgetSummary.total}</p>
          </div>
        </div>
      </div>

      {/* Days Timeline */}
      <div className="space-y-4 mb-8">
        {itinerary.days.map((day) => (
          <DayCard
            key={day.day}
            day={day}
            isExpanded={expandedDay === day.day}
            onToggle={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
          />
        ))}
      </div>

      {/* Tips */}
      {itinerary.tips && itinerary.tips.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <span>💡</span> Conseils de Vasco
          </h3>
          <ul className="space-y-2">
            {itinerary.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-blue-800">
                <span className="text-blue-500 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Best time to visit */}
      {itinerary.bestTimeToVisit && (
        <div className="bg-green-50 rounded-2xl p-6 mb-8 border border-green-100">
          <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center gap-2">
            <span>🌤️</span> Meilleure période
          </h3>
          <p className="text-green-800">{itinerary.bestTimeToVisit}</p>
        </div>
      )}

      {/* Packing essentials */}
      {itinerary.packingEssentials && itinerary.packingEssentials.length > 0 && (
        <div className="bg-purple-50 rounded-2xl p-6 mb-8 border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
            <span>🎒</span> À ne pas oublier
          </h3>
          <div className="flex flex-wrap gap-2">
            {itinerary.packingEssentials.map((item, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white rounded-full text-sm text-purple-700 border border-purple-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Sauvegarde...
              </>
            ) : (
              <>
                <span>💾</span> Sauvegarder ce voyage
              </>
            )}
          </button>
        )}
        {onNewTrip && (
          <button
            onClick={onNewTrip}
            className="flex-1 py-4 px-6 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <span>🔄</span> Nouveau voyage
          </button>
        )}
      </div>
    </div>
  )
}

// Day Card Component
function DayCard({
  day,
  isExpanded,
  onToggle,
}: {
  day: Day
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
            J{day.day}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{day.theme}</h3>
            <p className="text-sm text-gray-500">{day.activities.length} activités</p>
          </div>
        </div>
        <svg
          className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 animate-fadeIn">
          {/* Activities Timeline */}
          <div className="border-l-2 border-orange-200 ml-6 pl-6 space-y-6 mb-6">
            {day.activities.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>

          {/* Meals */}
          <div className="bg-amber-50 rounded-xl p-4 mb-4">
            <h4 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
              <span>🍽️</span> Repas recommandés
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {day.meals.breakfast && (
                <MealCard label="Petit-déjeuner" meal={day.meals.breakfast} />
              )}
              {day.meals.lunch && <MealCard label="Déjeuner" meal={day.meals.lunch} />}
              {day.meals.dinner && <MealCard label="Dîner" meal={day.meals.dinner} />}
            </div>
          </div>

          {/* Accommodation */}
          {day.accommodation && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <span>🏨</span> Hébergement
              </h4>
              <p className="font-medium text-blue-800">{day.accommodation.name}</p>
              <p className="text-sm text-blue-600">
                {day.accommodation.type}
                {day.accommodation.neighborhood && ` • ${day.accommodation.neighborhood}`}
              </p>
              <p className="text-sm font-medium text-blue-700 mt-1">
                {day.accommodation.priceRange}
              </p>
            </div>
          )}

          {/* Transport tip */}
          {day.transportTip && (
            <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl">🚗</span>
              <p className="text-gray-700 text-sm">{day.transportTip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Activity Item Component
function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className="absolute -left-9 w-4 h-4 rounded-full bg-orange-500 border-2 border-white" />

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-orange-600">{activity.time}</span>
              {activity.duration && (
                <span className="text-xs text-gray-400">({activity.duration})</span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900">{activity.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <span>📍</span> {activity.location}
            </p>
            {activity.tips && (
              <p className="text-xs text-blue-600 mt-2 bg-blue-50 rounded-lg px-2 py-1 inline-block">
                💡 {activity.tips}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-700">{activity.costEstimate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Meal Card Component
function MealCard({ label, meal }: { label: string; meal: { name: string; type: string; costEstimate: string } }) {
  return (
    <div className="bg-white rounded-lg p-3">
      <p className="text-xs text-amber-600 font-medium mb-1">{label}</p>
      <p className="font-medium text-gray-900 text-sm">{meal.name}</p>
      <p className="text-xs text-gray-500">{meal.type}</p>
      <p className="text-xs font-medium text-amber-700 mt-1">{meal.costEstimate}</p>
    </div>
  )
}
