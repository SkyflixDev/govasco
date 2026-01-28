import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/config/env'

/**
 * Supabase Client pour utilisation côté SERVEUR
 * 
 * Utilisé dans :
 * - API routes
 * - Server Components
 * - Server Actions
 * 
 * NE PAS utiliser dans :
 * - Composants Client React
 * - Hooks
 * 
 * Sécurité : Accès complet via service_role_key si nécessaire
 */

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.supabase.url,
    env.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Le `setAll` peut être appelé depuis un Server Component
            // qui ne peut pas modifier les cookies.
            // C'est OK, on ignore silencieusement.
          }
        },
      },
    }
  )
}

/**
 * Client Supabase avec accès admin (service_role_key)
 * 
 * ⚠️ ATTENTION : Bypass la Row Level Security !
 * Utiliser UNIQUEMENT pour :
 * - Opérations admin nécessaires
 * - Migrations de données
 * - Scripts backend
 * 
 * NE JAMAIS exposer ce client au navigateur !
 */
export function createAdminClient() {
  return createServerClient(
    env.supabase.url,
    env.supabase.serviceRoleKey,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Pas de cookies en mode admin
        },
      },
    }
  )
}