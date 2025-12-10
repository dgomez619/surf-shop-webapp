import React from 'react'
import { Link } from 'react-router-dom'

const Society = () => {
  return (
 <Link to="/society" className="bento-card bento-society md:col-span-1 md:row-span-2 bg-gradient-to-b from-blue-900 to-surf-black flex flex-col justify-between border-blue-500/30">
            <div>
              <div className="flex items-center justify-between mb-2">
                <i className="ph-fill ph-crown text-3xl text-yellow-400"></i>
                <span className="text-xs font-bold uppercase tracking-widest opacity-50">Members Only</span>
              </div>
              <h2 className="font-display text-4xl uppercase leading-none mb-2">Surf<br/>Society</h2>
              <p className="text-sm text-blue-200 leading-relaxed mb-4">
                Join the inner circle. Get exclusive access to the <strong>Quiver Club</strong> and test drive our premium board selection.
              </p>
              <ul className="text-sm space-y-2 mb-6 text-gray-300">
                <li className="flex items-center gap-2"><i className="ph-bold ph-check text-surf-accent"></i> 20% Off Rentals</li>
                <li className="flex items-center gap-2"><i className="ph-bold ph-check text-surf-accent"></i> Demo Any Board</li>
                <li className="flex items-center gap-2"><i className="ph-bold ph-check text-surf-accent"></i> Early Access Drops</li>
              </ul>
            </div>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded uppercase font-bold text-sm tracking-widest transition-colors">
              Join The Club
            </button>
          </Link>  )
}

export default Society