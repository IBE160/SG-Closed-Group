import BonfireMap from '@/components/bonfire/BonfireMap'

export default function BalmeldingPage() {
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header med tittel og antall bålmeldinger */}
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Bålkart</h1>
        <div id="bonfire-count-portal" />
      </div>

      {/* Kart som fyller resten av plassen */}
      <div className="flex-1">
        <BonfireMap />
      </div>
    </div>
  );
}
