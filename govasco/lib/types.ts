/**
 * Types TypeScript pour GoVasco
 *
 * Interfaces centralisées pour les voyages et itinéraires
 */

// ============================================
// TYPES DE BASE (Budget, Pace, Interests)
// ============================================

export type Budget = 'economic' | 'balanced' | 'comfort'
export type Pace = 'relaxed' | 'balanced' | 'intense'

export type Interest =
  | 'culture'
  | 'nature'
  | 'gastronomie'
  | 'histoire'
  | 'plage'
  | 'aventure'
  | 'shopping'
  | 'relaxation'
  | 'insolite'
  | 'sport'
  | 'vie_nocturne'
  | 'famille'

// ============================================
// TRIP INPUT (Ce que l'utilisateur envoie)
// ============================================

export interface TripInput {
  destination: string
  days: number
  budget: Budget
  interests: Interest[]
  pace: Pace
  travelers?: number
  startDate?: string
}

// ============================================
// ITINERARY (Ce que Claude génère)
// ============================================

export interface Activity {
  time: string           // "09:00" ou "Matin"
  title: string          // "Visite du Jardin Majorelle"
  description: string    // Description détaillée
  location: string       // "Jardin Majorelle, Marrakech"
  duration?: string      // "2h" ou "1h30"
  costEstimate: string   // "gratuit" ou "10-15€"
  tips?: string          // Conseil pratique
}

export interface Meal {
  name: string           // "Café Clock"
  type: string           // "Café traditionnel"
  costEstimate: string   // "5-10€"
  description?: string
}

export interface Meals {
  breakfast?: Meal
  lunch?: Meal
  dinner?: Meal
}

export interface Accommodation {
  name: string           // "Riad Yasmine"
  type: string           // "Riad traditionnel"
  priceRange: string     // "80-120€/nuit"
  neighborhood?: string  // "Médina"
}

export interface Day {
  day: number            // 1, 2, 3...
  date?: string          // "2026-02-15" (optionnel)
  theme: string          // "Découverte de la Médina"
  activities: Activity[]
  meals: Meals
  accommodation?: Accommodation
  transportTip?: string  // "Privilégiez la marche dans la médina"
}

export interface BudgetSummary {
  accommodation: string  // "240-360€"
  food: string           // "90-150€"
  activities: string     // "50-80€"
  transport: string      // "30-50€"
  total: string          // "410-640€"
}

export interface Itinerary {
  destination: string
  days: Day[]
  budgetSummary: BudgetSummary
  tips: string[]         // Conseils généraux
  bestTimeToVisit?: string
  packingEssentials?: string[]
}

// ============================================
// TRIP (Voyage complet stocké en DB)
// ============================================

export interface Trip {
  id: string
  userId: string
  destination: string
  days: number
  budget: Budget
  interests: Interest[]
  pace: Pace
  travelers?: number
  startDate?: string
  itinerary: Itinerary | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

// ============================================
// API RESPONSES
// ============================================

export interface GenerateItineraryRequest {
  destination: string
  days: number
  budget: Budget
  interests: Interest[]
  pace: Pace
  travelers?: number
  startDate?: string
}

export interface GenerateItineraryResponse {
  success: boolean
  itinerary?: Itinerary
  tripId?: string        // Si sauvegardé en DB
  draftId?: string       // Si sauvegardé en local
  cached?: boolean       // Si résultat depuis cache idempotency
  error?: string
  code?: string
}

export interface ApiError {
  error: string
  code: string
  details?: string
}

// ============================================
// UI STATE
// ============================================

export interface FormStep {
  id: number
  title: string
  description: string
  isCompleted: boolean
  isCurrent: boolean
}

export interface GenerationState {
  status: 'idle' | 'generating' | 'success' | 'error'
  progress?: number      // 0-100
  message?: string       // Message de progression
  itinerary?: Itinerary
  error?: string
}
