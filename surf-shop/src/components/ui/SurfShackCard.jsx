const SurfShack = () => {
  return (
 <div className="bento-card bento-surfshack md:col-span-1 min-h-[250px] group cursor-pointer">
            <div className="card-bg bg-[url('https://images.unsplash.com/photo-1505691723518-36aee14c2e2f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-500"></div>
            <div className="card-overlay bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="relative z-10 p-2 flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-bold text-surf-accent uppercase tracking-widest mb-1 block">Stay</span>
                <h3 className="font-display text-2xl uppercase mb-1">The Surfshack</h3>
                <p className="text-sm text-gray-300">Steps from the shop — cozy rental for surfers and families.</p>
              </div>
              <div className="mt-4">
                <button className="inline-block bg-surf-accent text-black font-bold uppercase tracking-wider px-4 py-2 rounded hover:bg-white transition-colors">
                  Book The Surfshack
                </button>
              </div>
            </div>
          </div>  )
}

export default SurfShack