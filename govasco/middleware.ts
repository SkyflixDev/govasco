import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware Next.js - Point d'entrée de TOUTES les requêtes
 * 
 * Ce middleware :
 * 1. Vérifie l'authentification sur les routes protégées
 * 2. Redirige vers /login si pas connecté
 * 3. Gère les sessions Supabase (refresh tokens)
 * 4. Protège les API routes
 * 
 * Sécurité : PREMIÈRE ligne de défense de l'app
 */

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session si nécessaire
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Routes qui nécessitent authentification
  const protectedPaths = ['/dashboard', '/trips', '/profile']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Routes API protégées
  const protectedApiPaths = ['/api/claude', '/api/trips']
  const isProtectedApi = protectedApiPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Si route protégée et pas d'utilisateur → Redirection login
  if (isProtectedPath && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si API protégée et pas d'utilisateur → 401
  if (isProtectedApi && !user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    )
  }

  // Si utilisateur connecté essaie d'accéder à /login ou /signup → Dashboard
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

/**
 * Configuration : Où le middleware s'applique
 * 
 * Matcher : Routes sur lesquelles le middleware s'exécute
 * Exclut : Static files, images, favicon, etc.
 */
export const config = {
  matcher: [
    /*
     * Match toutes les routes SAUF :
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}