import Link from 'next/link'
import { APP_NAME } from '@/lib/config/constants'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Vasco */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="text-3xl">🦊</span>
            <span className="font-bold text-xl tracking-tight">
              {APP_NAME}
            </span>
          </Link>

          {/* Actions desktop (cachées sur mobile) */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/trips/new"
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              Nouveau voyage
            </Link>
            
            <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-sm">
              Connexion
            </button>
          </div>

          {/* Burger menu mobile (pour plus tard) */}
          <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}