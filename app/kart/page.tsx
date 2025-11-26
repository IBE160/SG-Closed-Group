import BonfireMap from '@/components/bonfire/BonfireMap'

export default function KartPage() {
  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Bålkart</h1>
          <div id="bonfire-count-portal" />
        </div>
      </nav>
      <div className="flex-1">
        <BonfireMap />
      </div>
    </div>
  )
}
