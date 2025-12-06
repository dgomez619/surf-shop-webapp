import { Link } from 'react-router-dom'

export default function Society(){
  return (
    <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="font-display text-5xl">The Surf Society</h1>
        <p className="text-gray-300 mt-2">Exclusive membership — early drops, demos, and member-only events.</p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <aside className="bento-card">
          <h3 className="font-display text-2xl mb-2">Membership Perks</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• 20% off rentals & demos</li>
            <li>• Early access to limited drops</li>
            <li>• Members-only surf events and socials</li>
          </ul>
        </aside>

        <div className="bento-card flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold">Join the Quiver Club</h4>
            <p className="text-sm text-gray-300 mt-2">Members get special rates on board demos and private fittings. Be the first to try new setups from premium brands.</p>
          </div>
          <div className="mt-4">
            <Link to="/" className="inline-block bg-surf-accent text-black px-6 py-3 rounded uppercase font-bold">Become a Member</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
