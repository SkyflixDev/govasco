import { supabase } from '@/lib/supabase'

export default async function Home() {
  // Test Supabase
  let supabaseStatus = '✅ Connected'
  try {
    const { error } = await supabase.from('_test').select('*').limit(1)
    if (error) supabaseStatus = '✅ Connected (empty DB)'
  } catch (e) {
    supabaseStatus = '❌ Error'
  }

  // Test Claude API
  let claudeStatus = '⏳ Testing...'
  try {
    const res = await fetch('http://localhost:3000/api/test-claude', {
      cache: 'no-store'
    })
    const data = await res.json()
    if (data.success) {
      claudeStatus = '✅ ' + data.response
    } else {
      claudeStatus = '❌ Error'
    }
  } catch (e) {
    claudeStatus = '❌ Error'
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🦊</div>
            <h1 className="text-4xl font-bold text-orange-600 mb-2">
              GoVasco
            </h1>
            <p className="text-gray-600">
              Ton compagnon de voyage
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold">Next.js 14</span>
              <span className="text-green-600">✅ Running</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold">Supabase</span>
              <span className="text-green-600">{supabaseStatus}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold">Claude API</span>
              <span className="text-green-600">{claudeStatus}</span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              🎉 Semaine 1 - Foundation terminée !
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}