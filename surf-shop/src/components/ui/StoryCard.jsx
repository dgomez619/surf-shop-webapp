import React from 'react'

const Story = () => {
  return (
   <div className="bento-card bento-story md:col-span-2 flex flex-col md:flex-row items-center gap-6 bg-gray-900 border-surf-accent/20">
            <div className="flex-1">
              <span className="text-surf-accent text-xs font-bold uppercase tracking-widest mb-2 block">Our Roots</span>
              <h3 className="font-display text-3xl uppercase mb-3">Hidden Gem of La Jolla</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                "Brothers Matt & Ben started Bird Rock Surf Shop in 2007 out of pure passion. We are a breeding ground for excited veteran surfers and groms alike."
              </p>
              <a href="#" className="text-white text-sm font-bold underline decoration-surf-accent underline-offset-4 hover:text-surf-accent transition-colors">Read our story</a>
            </div>
            <div className="w-full md:w-1/3 aspect-square bg-gray-800 rounded-lg overflow-hidden relative">
               <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <i className="ph-duotone ph-users-three text-6xl text-gray-500"></i>
               </div>
            </div>
          </div>  )
}

export default Story