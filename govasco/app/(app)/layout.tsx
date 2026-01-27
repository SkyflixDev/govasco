import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header fixe en haut */}
      <Header />
      
      {/* Contenu principal avec padding pour le BottomNav */}
      <main className="flex-1 pb-20 md:pb-8">
        {children}
      </main>
      
      {/* Bottom Nav fixe en bas (mobile uniquement) */}
      <BottomNav />
    </div>
  )
}