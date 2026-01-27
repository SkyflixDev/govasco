/**
 * Configuration centralisée des variables d'environnement
 * Évite les erreurs de typo et fournit l'autocomplétion
 */

export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
  },
  
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: 'GoVasco',
  },
}

// Validation au démarrage
if (!env.supabase.url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
if (!env.supabase.anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
if (!env.anthropic.apiKey) throw new Error('ANTHROPIC_API_KEY is required')