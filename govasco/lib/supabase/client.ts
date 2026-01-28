import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/config/env'

/**
 * Supabase Client pour utilisation côté CLIENT (navigateur)
 * 
 * Utilisé dans :
 * - Composants React Client
 * - Hooks
 * - Event handlers
 * 
 * NE PAS utiliser dans :
 * - API routes
 * - Server Components
 * - Middleware
 * 
 * Sécurité : Row Level Security (RLS) appliqué automatiquement
 */

export function createClient() {
  return createBrowserClient(
    env.supabase.url,
    env.supabase.anonKey
  )
}

// Export singleton pour utilisation directe
export const supabase = createClient()