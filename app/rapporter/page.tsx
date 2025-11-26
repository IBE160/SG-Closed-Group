import BonfireForm from '@/components/bonfire/BonfireForm'
import AIChat from '@/components/bonfire/AIChat'

export default function RapporterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">110 Sør-Vest - Bålmeldingssystem</h1>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <BonfireForm />
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 110 Sør-Vest | Rogaland brann og redning IKS
          </p>
          <p className="text-xs mt-2 text-gray-400">
            For nødssituasjoner ring 110
          </p>
        </div>
      </footer>

      {/* AI Chat - flytende knapp nede til høyre */}
      <AIChat />
    </div>
  )
}
