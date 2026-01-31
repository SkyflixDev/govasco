/**
 * Constantes de l'application
 * Un seul endroit pour tout configurer
 */

// App
export const APP_NAME = 'GoVasco'
export const APP_DESCRIPTION = 'Ton compagnon de voyage'
export const APP_TAGLINE = 'Pars à l\'aventure avec Vasco !'

// Limites utilisateur
export const MAX_TRIPS_FREE = 5
export const MAX_DAYS_PER_TRIP = 30
export const MAX_ACTIVITIES_PER_DAY = 8

// Rate limiting (on les implémentera plus tard)
export const RATE_LIMITS = {
  claude: {
    generationsPerDay: 3,
    generationsPerMonth: 10,
    cooldownSeconds: 30,
  },
  trips: {
    maxActive: 5,
    maxCreationsPerMonth: 20,
  },
}

// Niveaux de confort
export const COMFORT_LEVELS = {
  ECONOMIC: 'economic',
  BALANCED: 'balanced',
  COMFORT: 'comfort',
} as const

export const COMFORT_LABELS = {
  [COMFORT_LEVELS.ECONOMIC]: '💰 Économique',
  [COMFORT_LEVELS.BALANCED]: '⚖️ Équilibré',
  [COMFORT_LEVELS.COMFORT]: '✨ Confort',
}

// Centres d'intérêt (12 catégories)
export const INTERESTS = [
  'culture',
  'nature',
  'gastronomie',
  'histoire',
  'plage',
  'aventure',
  'shopping',
  'relaxation',
  'insolite',
  'sport',
  'vie_nocturne',
  'famille',
] as const

export const INTEREST_LABELS: Record<typeof INTERESTS[number], string> = {
  culture: '🎭 Culture',
  nature: '🌿 Nature',
  gastronomie: '🍽️ Gastronomie',
  histoire: '🏛️ Histoire',
  plage: '🏖️ Plage',
  aventure: '🧗 Aventure',
  shopping: '🛍️ Shopping',
  relaxation: '🧘 Relaxation',
  insolite: '🎪 Insolite',
  sport: '⚽ Sport',
  vie_nocturne: '🌙 Vie nocturne',
  famille: '👨‍👩‍👧‍👦 Famille',
}

// Rythme de voyage
export const TRAVEL_PACE = {
  RELAXED: 'relaxed',
  BALANCED: 'balanced',
  INTENSE: 'intense',
} as const

export const TRAVEL_PACE_LABELS = {
  [TRAVEL_PACE.RELAXED]: '🐌 Tranquille',
  [TRAVEL_PACE.BALANCED]: '🚶 Équilibré',
  [TRAVEL_PACE.INTENSE]: '🏃 Intense',
}