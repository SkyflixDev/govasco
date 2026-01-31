/**
 * API Route: Génération d'itinéraires avec Claude
 *
 * POST /api/generate-itinerary
 *
 * Protections :
 * - Rate limiting (3/jour guest, 10/jour auth)
 * - Idempotency (cache 24h)
 * - Validation Zod
 * - Retry automatique (1x)
 */

import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import {
  checkIdempotencyKey,
  generateIdempotencyKey,
  storeIdempotencyResult,
} from '@/lib/idempotency'
import { validateTripInput, validateItinerary, formatZodErrors } from '@/lib/validators'
import { generateItineraryPrompt, parseClaudeResponse } from '@/lib/prompts/itinerary-prompt'
import type { Itinerary, GenerateItineraryResponse } from '@/lib/types'

// Vérification de la clé API au démarrage
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY manquante dans .env.local')
}

const anthropic = ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  : null

// Configuration
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 4096
const TIMEOUT_MS = 60000 // 60 secondes

export async function POST(request: Request) {
  // Vérifier que la clé API existe
  if (!anthropic) {
    return NextResponse.json(
      {
        success: false,
        error: 'Service temporairement indisponible',
        code: 'API_KEY_MISSING',
      } as GenerateItineraryResponse,
      { status: 503 }
    )
  }

  try {
    // 1. Parse le body
    const body = await request.json()

    // 2. Valider les inputs
    const validation = validateTripInput(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: formatZodErrors(validation.errors!).join(', '),
        },
        { status: 400 }
      )
    }

    const tripInput = validation.data!

    // 3. Vérifier l'authentification (optionnelle)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const userId = user?.id || null
    const identifier = userId || getClientIp(request)
    const isAuthenticated = !!userId

    // 4. Vérifier l'idempotency (cache)
    const idempotencyKey = generateIdempotencyKey(tripInput)
    const cachedResult = checkIdempotencyKey(idempotencyKey)

    if (cachedResult.exists) {
      console.log('✅ Retour du résultat en cache (idempotency)')
      return NextResponse.json({
        success: true,
        itinerary: cachedResult.result,
        cached: true,
      } as GenerateItineraryResponse)
    }

    // 5. Vérifier le rate limit (AVANT l'appel Claude)
    // On ne consommera le quota que si Claude répond avec succès
    const rateLimit = checkRateLimit(identifier, isAuthenticated)

    if (!rateLimit.allowed) {
      const headers: Record<string, string> = {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
      }
      if (rateLimit.retryAfter) {
        headers['Retry-After'] = rateLimit.retryAfter.toString()
      }

      return NextResponse.json(
        {
          success: false,
          error: rateLimit.remaining === 0
            ? `Limite atteinte. Réessayez dans ${Math.ceil((rateLimit.resetAt - Date.now()) / 3600000)}h`
            : `Veuillez patienter ${rateLimit.retryAfter}s entre chaque requête`,
          code: 'RATE_LIMIT_EXCEEDED',
        } as GenerateItineraryResponse,
        { status: 429, headers }
      )
    }

    // 6. Générer le prompt
    const { systemPrompt, userPrompt } = generateItineraryPrompt(tripInput)

    // 7. Appeler Claude avec retry
    let itinerary: Itinerary | null = null
    let lastError: string | null = null
    let attempts = 0
    const maxAttempts = 2 // 1 essai + 1 retry

    while (attempts < maxAttempts && !itinerary) {
      attempts++

      try {
        console.log(`🦊 Génération itinéraire (tentative ${attempts}/${maxAttempts})...`)

        const message = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        })

        // Extraire le texte de la réponse
        const responseText =
          message.content[0].type === 'text' ? message.content[0].text : ''

        // Parser le JSON
        const parseResult = parseClaudeResponse(responseText)

        if (!parseResult.success) {
          lastError = parseResult.error || 'Erreur de parsing'
          console.error(`❌ Parsing échoué (tentative ${attempts}):`, lastError)
          continue
        }

        // Valider la structure de l'itinéraire
        const itineraryValidation = validateItinerary(parseResult.data)

        if (!itineraryValidation.success) {
          lastError = formatZodErrors(itineraryValidation.errors!).join(', ')
          console.error(`❌ Validation itinéraire échouée (tentative ${attempts}):`, lastError)
          continue
        }

        itinerary = itineraryValidation.data as Itinerary
        console.log(`✅ Itinéraire généré avec succès !`)
      } catch (error) {
        if (error instanceof Anthropic.APIError) {
          // Erreur API Anthropic
          if (error.status === 429) {
            lastError = 'Service surchargé, réessayez dans quelques minutes'
            console.error('❌ Rate limit Anthropic atteint')
            break // Pas de retry sur rate limit
          }
          lastError = `Erreur API: ${error.message}`
        } else if (error instanceof Error) {
          lastError = error.message
        } else {
          lastError = 'Erreur inconnue'
        }
        console.error(`❌ Erreur Claude (tentative ${attempts}):`, lastError)
      }

      // Attendre avant retry
      if (attempts < maxAttempts && !itinerary) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    // 8. Si échec après tous les essais
    if (!itinerary) {
      // NOTE: Le rate limit a déjà été consommé par checkRateLimit
      // Dans une version future, on pourrait "rembourser" le quota ici
      return NextResponse.json(
        {
          success: false,
          error: 'Impossible de générer l\'itinéraire. Réessayez dans quelques minutes.',
          code: 'GENERATION_FAILED',
          details: lastError,
        },
        { status: 500 }
      )
    }

    // 9. Stocker en cache (idempotency)
    storeIdempotencyResult(idempotencyKey, itinerary)

    // 10. Retourner le résultat
    return NextResponse.json(
      {
        success: true,
        itinerary,
        cached: false,
      } as GenerateItineraryResponse,
      {
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
        },
      }
    )
  } catch (error) {
    console.error('❌ Erreur inattendue:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur inattendue s\'est produite',
        code: 'INTERNAL_ERROR',
      } as GenerateItineraryResponse,
      { status: 500 }
    )
  }
}

// GET pour vérifier le statut de l'API
export async function GET() {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY

  return NextResponse.json({
    status: hasApiKey ? 'ok' : 'missing_api_key',
    model: CLAUDE_MODEL,
    maxTokens: MAX_TOKENS,
  })
}
