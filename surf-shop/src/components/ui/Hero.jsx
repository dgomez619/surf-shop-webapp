import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
<div className="bento-card bento-hero md:col-span-4 min-h-[500px] flex flex-col justify-end group">
            <div className="card-bg bg-[url('https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"></div>
            <div className="card-overlay bg-gradient-to-t from-surf-black via-surf-black/50 to-transparent"></div>
            
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/30 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                <span className="w-2 h-2 rounded-full bg-surf-accent animate-pulse"></span>
                <span className="text-xs font-bold tracking-widest uppercase">La Jolla, CA</span>
              </div>
              <h1 className="font-display text-6xl md:text-8xl uppercase leading-[0.9] mb-4">
                Ride The <span className="text-surf-accent">Local</span> Energy.
              </h1>
              <p className="text-gray-300 max-w-lg text-lg mb-8">
                The hidden gem of the south. High-performance gear for veterans, guidance for groms.
              </p>
              <div className="flex gap-4">
                <Link to="/shop">
                <button className="bg-surf-accent text-black font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-white transition-colors">
                  Shop The Drop
                </button>
                </Link>
                <button className="border border-white text-white font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-white hover:text-black transition-colors">
                  Book Rentals
                </button>
              </div>
            </div>
          </div>  )
}

export default Hero