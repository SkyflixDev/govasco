'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Plus, User } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const links = [
    { 
      href: '/dashboard', 
      icon: Home, 
      label: 'Accueil',
      isActive: pathname === '/dashboard'
    },
    { 
      href: '/trips', 
      icon: Map, 
      label: 'Voyages',
      isActive: pathname?.startsWith('/trips') && !pathname.includes('/new')
    },
    { 
      href: '/trips/new', 
      icon: Plus, 
      label: 'Créer',
      isActive: pathname === '/trips/new'
    },
    { 
      href: '/profile', 
      icon: User, 
      label: 'Profil',
      isActive: pathname === '/profile'
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {links.map((link) => {
          const Icon = link.icon
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-all duration-200 rounded-lg
                ${link.isActive 
                  ? 'text-orange-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon 
                size={24} 
                strokeWidth={link.isActive ? 2.5 : 2}
                className="mb-1"
              />
              <span className={`
                text-xs font-medium
                ${link.isActive ? 'font-semibold' : ''}
              `}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}