/**
 * Configuration centralisée des variables d'environnement
 * Évite les erreurs de typo et fournit l'autocomplétion
 */

// Validation des variables CLIENT uniquement (NEXT_PUBLIC_*)
// Les variables serveur (ANTHROPIC_API_KEY) sont validées uniquement côté serveur
if (typeof window !== 'undefined') {
  // Côté client : valider uniquement NEXT_PUBLIC_*
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
} else {
  // Côté serveur : valider TOUT
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️ ANTHROPIC_API_KEY is not set - Claude API will not work')
  }
}

export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  anthropic: {
    // Côté client, cette valeur sera undefined (normal)
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: 'GoVasco',
  },
} 