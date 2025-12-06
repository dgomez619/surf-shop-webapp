import { Link } from 'react-router-dom'

export default function Rentals(){
  return (
    <main className="pt-24 pb-12 px-4 max-w-[1200px] mx-auto">
      <header className="text-center mb-8">
        <h1 className="font-display text-4xl">Rentals & Bookings</h1>
        <p className="text-gray-300 mt-2">Wetsuits, surfboards, and guided sessions — we keep you on the water.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bento-card text-center">
          <div className="w-24 h-24 rounded-full mx-auto bg-surf-accent flex items-center justify-center mb-4">
            <i className="ph-fill ph-wave-sine text-xl text-black"></i>
          </div>
          <h3 className="font-bold uppercase">Boards</h3>
          <p className="text-sm text-gray-400">Short & longboards available for daily or weekly rental.</p>
        </div>

        <div className="bento-card text-center">
          <div className="w-24 h-24 rounded-full mx-auto bg-surf-accent flex items-center justify-center mb-4">
            <i className="ph-fill ph-user-gear text-xl text-black"></i>
          </div>
          <h3 className="font-bold uppercase">Wetsuits</h3>
          <p className="text-sm text-gray-400">Sizes for all ages — insulated and flexible.</p>
        </div>

        <div className="bento-card text-center">
          <div className="w-24 h-24 rounded-full mx-auto bg-surf-accent flex items-center justify-center mb-4">
            <i className="ph-fill ph-calendar-check text-xl text-black"></i>
          </div>
          <h3 className="font-bold uppercase">Lessons</h3>
          <p className="text-sm text-gray-400">Book private or group lessons with our local instructors.</p>
        </div>
      </section>

      <div className="mt-8 text-center">
        <Link to="/" className="inline-block bg-surf-accent text-black px-6 py-3 font-bold rounded uppercase">Book Now</Link>
      </div>
    </main>
  )
}
