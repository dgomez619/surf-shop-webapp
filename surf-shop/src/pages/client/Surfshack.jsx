import { Link } from 'react-router-dom'

export default function Surfshack(){
  return (
    <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="font-display text-5xl">The Surfshack</h1>
        <p className="text-gray-300 mt-2">A cozy rental near Bird Rock — surf-friendly, family-ready.</p>
      </header>

      <section className="bento-card grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="bg-[url('https://images.unsplash.com/photo-1505691723518-36aee14c2e2f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center min-h-[220px] rounded-md"></div>
        <div className="flex flex-col justify-between">
          <div>
            <p className="mb-3 text-gray-300">Nestled steps from the shop, the Surfshack is a compact, surf-focused stay. Fully furnished and surf-ready — bring boards or rent from us.</p>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• 2 Bedrooms • Sleeps 4</li>
              <li>• Short walk to Bird Rock pier and local cafés</li>
              <li>• In-house surf storage & outdoor shower</li>
            </ul>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Link to="/" className="bg-surf-accent text-black px-4 py-2 rounded font-bold uppercase">Book Now</Link>
            <Link to="/" className="border border-white/10 px-4 py-2 rounded text-sm">Check Availability</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
