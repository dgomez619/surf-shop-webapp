import React from 'react'

const Newsletter = () => {
  return (
 <div className="mt-4 bento-card flex flex-col md:flex-row items-center justify-between gap-6 bg-surf-accent text-black">
          <div>
            <h3 className="font-display text-4xl uppercase">Don't miss the swell.</h3>
            <p className="font-medium">Sign up for forecast alerts and shop events.</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input type="email" placeholder="YOUR EMAIL" className="bg-black/10 border-0 placeholder-black/60 text-black px-4 py-3 rounded w-full md:w-64 focus:ring-2 focus:ring-black outline-none" />
            <button className="bg-black text-white px-6 py-3 rounded font-bold uppercase hover:bg-white hover:text-black transition-colors">
              Join
            </button>
          </div>
        </div>  )
}

export default Newsletter