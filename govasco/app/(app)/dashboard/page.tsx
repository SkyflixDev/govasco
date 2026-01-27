'use client'

import Link from 'next/link'
import { APP_NAME } from '@/lib/config/constants'
import { Plane, MapPin, Compass } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Texture subtile */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' /%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête simple */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Tableau de bord
          </h1>
          <p className="text-lg text-gray-600">
            Bienvenue sur {APP_NAME}. Prêt à planifier votre prochaine aventure ?
          </p>
        </div>

        {/* Card principale - Design épuré */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-10">
          {/* Accent bar orange */}
          <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
          
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Vasco simplifié */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-40 h-40 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl">
                    <span className="text-8xl">🦊</span>
                  </div>
                  
                  {/* Badge subtil */}
                  <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    BETA
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Créez votre itinéraire personnalisé
                </h2>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl">
                  Vasco, votre assistant de voyage intelligent, vous aide à planifier 
                  des aventures sur mesure. Destinations, activités, hébergements : 
                  tout est pensé pour vous.
                </p>

                {/* Stats épurées */}
                <div className="flex gap-8 mb-8 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Plane size={14} />
                      Voyages
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} />
                      Destinations
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Compass size={14} />
                      Activités
                    </div>
                  </div>
                </div>

                {/* CTA principal */}
                <Link
                  href="/trips/new"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Créer mon voyage
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Accent bar bas */}
          <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
        </div>

        {/* Destinations - Design pro */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Destinations populaires
            </h2>
            <span className="text-sm text-gray-500">Inspiration pour votre prochain voyage</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Marrakech */}
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all cursor-pointer">
              <div className="aspect-[16/9] bg-gradient-to-br from-orange-400 to-red-500 relative overflow-hidden">
                {/* Image placeholder avec overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-6xl font-bold opacity-90">MAR</span>
                </div>
                
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Populaire
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">Marrakech</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    7 jours
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Médinas historiques, souks colorés et désert du Sahara
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full font-medium">
                    Culture
                  </span>
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full font-medium">
                    Gastronomie
                  </span>
                </div>
              </div>
            </div>

            {/* Tokyo */}
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all cursor-pointer">
              <div className="aspect-[16/9] bg-gradient-to-br from-pink-400 to-red-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-6xl font-bold opacity-90">TYO</span>
                </div>
                
                <div className="absolute top-4 right-4 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Tendance
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">Tokyo</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    14 jours
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Temples traditionnels, quartiers modernes et mont Fuji
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full font-medium">
                    Tradition
                  </span>
                  <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full font-medium">
                    Nature
                  </span>
                </div>
              </div>
            </div>

            {/* Surprise */}
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all cursor-pointer">
              <div className="aspect-[16/9] bg-gradient-to-br from-purple-400 to-blue-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-6xl font-bold opacity-90">???</span>
                </div>
                
                <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  Mystère
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">Destination surprise</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Variable
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Laissez Vasco choisir votre prochaine destination
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                    Aventure
                  </span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                    Aléatoire
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Citation sobre */}
        <div className="mt-16 text-center">
          <blockquote className="text-gray-600 italic text-lg max-w-3xl mx-auto">
            "Le monde est un livre, et ceux qui ne voyagent pas n'en lisent qu'une page."
          </blockquote>
          <p className="text-sm text-gray-500 mt-3">— Saint Augustin</p>
        </div>
      </div>
    </div>
  )
}