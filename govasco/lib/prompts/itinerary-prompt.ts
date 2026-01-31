/**
 * Prompt Engineering pour génération d'itinéraires
 *
 * Prompt optimisé pour Claude Sonnet - Génération d'itinéraires de voyage
 */

import type { TripInput } from '../types'

// Labels pour le prompt (en français)
const BUDGET_LABELS = {
  economic: 'économique (petit budget, hostels, street food)',
  balanced: 'équilibré (bon rapport qualité-prix)',
  comfort: 'confort (hôtels 4*, bons restaurants)',
}

const PACE_LABELS = {
  relaxed: 'tranquille (2-3 activités par jour, temps libre)',
  balanced: 'équilibré (4-5 activités par jour)',
  intense: 'intense (journées bien remplies, maximum de découvertes)',
}

const INTEREST_LABELS: Record<string, string> = {
  culture: 'culture et musées',
  nature: 'nature et randonnées',
  gastronomie: 'gastronomie et cuisine locale',
  histoire: 'sites historiques et patrimoine',
  plage: 'plages et activités nautiques',
  aventure: 'aventure et adrénaline',
  shopping: 'shopping et marchés',
  relaxation: 'spa et détente',
  insolite: 'expériences insolites et hors des sentiers battus',
  sport: 'sport et activités physiques',
  vie_nocturne: 'vie nocturne et bars',
  famille: 'activités familiales',
}

/**
 * Génère le prompt système pour Claude
 */
export function getSystemPrompt(): string {
  return `Tu es Vasco, un expert en planification de voyages. Tu génères des itinéraires de voyage personnalisés, détaillés et réalistes.

RÈGLES IMPORTANTES :
1. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après
2. Tous les textes doivent être en français
3. Les estimations de prix sont en euros (€)
4. Les horaires sont au format "HH:MM" ou descriptif ("Matin", "Après-midi")
5. Sois réaliste sur les temps de trajet et les horaires d'ouverture
6. Propose des alternatives locales et authentiques, pas que des spots touristiques
7. Adapte les activités au budget et au rythme demandés
8. Inclus des recommandations pratiques et des tips locaux

FORMAT DE RÉPONSE (JSON strict) :
{
  "destination": "Ville, Pays",
  "days": [
    {
      "day": 1,
      "theme": "Titre du jour",
      "activities": [
        {
          "time": "09:00",
          "title": "Nom de l'activité",
          "description": "Description détaillée",
          "location": "Adresse ou quartier",
          "duration": "2h",
          "costEstimate": "10-15€",
          "tips": "Conseil pratique (optionnel)"
        }
      ],
      "meals": {
        "breakfast": {
          "name": "Nom du lieu",
          "type": "Type de cuisine",
          "costEstimate": "5-10€"
        },
        "lunch": { ... },
        "dinner": { ... }
      },
      "accommodation": {
        "name": "Nom de l'hébergement",
        "type": "Type (hôtel, auberge, etc.)",
        "priceRange": "50-80€/nuit",
        "neighborhood": "Quartier"
      },
      "transportTip": "Conseil transport du jour"
    }
  ],
  "budgetSummary": {
    "accommodation": "XXX-XXX€",
    "food": "XXX-XXX€",
    "activities": "XXX-XXX€",
    "transport": "XXX-XXX€",
    "total": "XXX-XXX€"
  },
  "tips": [
    "Conseil général 1",
    "Conseil général 2",
    "Conseil général 3"
  ],
  "bestTimeToVisit": "Meilleure période pour visiter",
  "packingEssentials": ["Élément 1", "Élément 2"]
}`
}

/**
 * Génère le prompt utilisateur avec les paramètres du voyage
 */
export function getUserPrompt(input: TripInput): string {
  const interests = input.interests
    .map((i) => INTEREST_LABELS[i] || i)
    .join(', ')

  const budgetLabel = BUDGET_LABELS[input.budget]
  const paceLabel = PACE_LABELS[input.pace]
  const travelers = input.travelers || 1

  let prompt = `Génère un itinéraire de voyage complet pour :

📍 DESTINATION : ${input.destination}
📅 DURÉE : ${input.days} jour${input.days > 1 ? 's' : ''}
👥 VOYAGEURS : ${travelers} personne${travelers > 1 ? 's' : ''}
💰 BUDGET : ${budgetLabel}
🏃 RYTHME : ${paceLabel}
❤️ INTÉRÊTS : ${interests}`

  if (input.startDate) {
    prompt += `\n📆 DATE DE DÉPART : ${input.startDate}`
  }

  prompt += `

INSTRUCTIONS SPÉCIFIQUES :
- Propose des activités variées correspondant aux intérêts mentionnés
- Inclus un hébergement recommandé pour chaque nuit
- Suggère des restaurants locaux pour chaque repas
- Adapte le nombre d'activités au rythme demandé
- Donne des estimations de prix réalistes pour ${input.budget === 'economic' ? 'un petit budget' : input.budget === 'comfort' ? 'un budget confortable' : 'un budget moyen'}
- Ajoute des tips pratiques et locaux
- Le budget total doit couvrir : hébergement + repas + activités + transport local

Génère le JSON de l'itinéraire complet.`

  return prompt
}

/**
 * Génère le prompt complet (système + utilisateur)
 */
export function generateItineraryPrompt(input: TripInput): {
  systemPrompt: string
  userPrompt: string
} {
  return {
    systemPrompt: getSystemPrompt(),
    userPrompt: getUserPrompt(input),
  }
}

/**
 * Extrait et parse le JSON de la réponse Claude
 * Gère les cas où la réponse contient du texte avant/après le JSON
 */
export function parseClaudeResponse(response: string): {
  success: boolean
  data?: unknown
  error?: string
} {
  try {
    // Essai direct
    const parsed = JSON.parse(response)
    return { success: true, data: parsed }
  } catch {
    // Cherche un bloc JSON dans la réponse
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return { success: true, data: parsed }
      } catch (e) {
        return {
          success: false,
          error: `JSON invalide: ${e instanceof Error ? e.message : 'Erreur de parsing'}`,
        }
      }
    }

    return {
      success: false,
      error: 'Aucun JSON trouvé dans la réponse',
    }
  }
}
