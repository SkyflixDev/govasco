'use client'

/**
 * TripCard - Card d'affichage d'un voyage
 *
 * Utilisé dans le dashboard pour lister les voyages
 */

import Link from 'next/link'
import type { Trip } from '@/lib/types'
import { INTEREST_LABELS } from '@/lib/config/constants'

interface TripCardProps {
  trip: Trip
  onDelete?: (id: string) => void
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const hasItinerary = !!trip.itinerary
  const daysCount = trip.itinerary?.days.length || trip.days

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
      {/* Header avec destination */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">{trip.destination}</h3>
            <p className="text-orange-100 text-sm">
              {daysCount} jour{daysCount > 1 ? 's' : ''}
              {trip.travelers && trip.travelers > 1 && ` • ${trip.travelers} voyageurs`}
            </p>
          </div>
          {hasItinerary && (
            <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
              Itinéraire prêt
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Intérêts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {trip.interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium"
            >
              {INTEREST_LABELS[interest] || interest}
            </span>
          ))}
          {trip.interests.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{trip.interests.length - 3}
            </span>
          )}
        </div>

        {/* Budget summary */}
        {trip.itinerary?.budgetSummary && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">Budget estimé</p>
            <p className="font-bold text-gray-900">{trip.itinerary.budgetSummary.total}</p>
          </div>
        )}

        {/* Infos */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <span>
              {trip.budget === 'economic' ? '💰' : trip.budget === 'balanced' ? '⚖️' : '✨'}
            </span>
            {trip.budget === 'economic'
              ? 'Économique'
              : trip.budget === 'balanced'
              ? 'Équilibré'
              : 'Confort'}
          </span>
          <span className="flex items-center gap-1">
            <span>{trip.pace === 'relaxed' ? '🐌' : trip.pace === 'balanced' ? '🚶' : '🏃'}</span>
            {trip.pace === 'relaxed' ? 'Tranquille' : trip.pace === 'balanced' ? 'Équilibré' : 'Intense'}
          </span>
        </div>

        {/* Date de création */}
        <p className="text-xs text-gray-400">
          Créé le {new Date(trip.createdAt).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 p-4 flex gap-3">
        <Link
          href={`/trips/${trip.id}`}
          className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-center hover:from-orange-600 hover:to-amber-600 transition-all text-sm"
        >
          Voir l'itinéraire
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(trip.id)}
            className="py-2 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors text-sm"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  )
}

// Skeleton pour le chargement
export function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-24" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-16 bg-gray-100 rounded-xl" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      <div className="border-t border-gray-100 p-4">
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}
