/**
 * Validators Zod pour GoVasco
 *
 * Validation des inputs utilisateur et des réponses API
 */

import { z } from 'zod'

// ============================================
// CONSTANTES DE VALIDATION
// ============================================

export const VALID_BUDGETS = ['economic', 'balanced', 'comfort'] as const
export const VALID_PACES = ['relaxed', 'balanced', 'intense'] as const
export const VALID_INTERESTS = [
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

// ============================================
// SCHEMAS DE BASE
// ============================================

export const budgetSchema = z.enum(VALID_BUDGETS, {
  message: 'Budget invalide. Choisissez: economic, balanced ou comfort',
})

export const paceSchema = z.enum(VALID_PACES, {
  message: 'Rythme invalide. Choisissez: relaxed, balanced ou intense',
})

export const interestSchema = z.enum(VALID_INTERESTS, {
  message: 'Centre d\'intérêt invalide',
})

// ============================================
// SCHEMA TRIP INPUT
// ============================================

export const tripInputSchema = z.object({
  destination: z
    .string()
    .min(2, 'La destination doit faire au moins 2 caractères')
    .max(100, 'La destination ne peut pas dépasser 100 caractères')
    .regex(
      /^[a-zA-ZÀ-ÿ\s\-',]+$/,
      'La destination ne peut contenir que des lettres, espaces et tirets'
    ),

  days: z
    .number()
    .int('Le nombre de jours doit être un entier')
    .min(1, 'Minimum 1 jour')
    .max(30, 'Maximum 30 jours'),

  budget: budgetSchema,

  interests: z
    .array(interestSchema)
    .min(1, 'Sélectionnez au moins 1 centre d\'intérêt')
    .max(5, 'Maximum 5 centres d\'intérêt'),

  pace: paceSchema,

  travelers: z
    .number()
    .int()
    .min(1, 'Minimum 1 voyageur')
    .max(20, 'Maximum 20 voyageurs')
    .optional(),

  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .optional(),
})

export type TripInputSchema = z.infer<typeof tripInputSchema>

// ============================================
// SCHEMA ITINERARY (pour valider la réponse Claude)
// ============================================

const activitySchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  duration: z.string().optional(),
  costEstimate: z.string(),
  tips: z.string().optional(),
})

const mealSchema = z.object({
  name: z.string(),
  type: z.string(),
  costEstimate: z.string(),
  description: z.string().optional(),
})

const mealsSchema = z.object({
  breakfast: mealSchema.optional(),
  lunch: mealSchema.optional(),
  dinner: mealSchema.optional(),
})

const accommodationSchema = z.object({
  name: z.string(),
  type: z.string(),
  priceRange: z.string(),
  neighborhood: z.string().optional(),
})

const daySchema = z.object({
  day: z.number().int().min(1),
  date: z.string().optional(),
  theme: z.string(),
  activities: z.array(activitySchema).min(1).max(8),
  meals: mealsSchema,
  accommodation: accommodationSchema.optional(),
  transportTip: z.string().optional(),
})

const budgetSummarySchema = z.object({
  accommodation: z.string(),
  food: z.string(),
  activities: z.string(),
  transport: z.string(),
  total: z.string(),
})

export const itinerarySchema = z.object({
  destination: z.string(),
  days: z.array(daySchema).min(1),
  budgetSummary: budgetSummarySchema,
  tips: z.array(z.string()),
  bestTimeToVisit: z.string().optional(),
  packingEssentials: z.array(z.string()).optional(),
})

export type ItinerarySchema = z.infer<typeof itinerarySchema>

// ============================================
// FONCTIONS DE VALIDATION
// ============================================

/**
 * Valide un input de création de voyage
 */
export function validateTripInput(data: unknown): {
  success: boolean
  data?: TripInputSchema
  errors?: z.ZodError
} {
  const result = tripInputSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: result.error }
}

/**
 * Valide un itinéraire généré par Claude
 */
export function validateItinerary(data: unknown): {
  success: boolean
  data?: ItinerarySchema
  errors?: z.ZodError
} {
  const result = itinerarySchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: result.error }
}

/**
 * Formate les erreurs Zod pour l'affichage
 */
export function formatZodErrors(errors: z.ZodError): string[] {
  return errors.issues.map((issue) => {
    const path = issue.path.join('.')
    return path ? `${path}: ${issue.message}` : issue.message
  })
}

/**
 * Normalise une chaîne d'intérêt
 * Ex: "Vie nocturne" → "vie_nocturne"
 */
export function normalizeInterest(interest: string): string {
  return interest
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime accents
    .replace(/\s+/g, '_')            // Espaces → underscores
    .replace(/[^a-z_]/g, '')         // Garde que lettres et _
}

/**
 * Vérifie si un intérêt est valide
 */
export function isValidInterest(interest: string): boolean {
  return VALID_INTERESTS.includes(interest as typeof VALID_INTERESTS[number])
}
