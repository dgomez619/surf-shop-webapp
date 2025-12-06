import React from 'react'

const Groms = () => {
  return (
  <div className="bento-card bento-groms md:col-span-1 min-h-[200px] group cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <i className="ph-fill ph-smiley text-6xl"></i>
            </div>
            <div className="mt-auto absolute bottom-6 left-6">
              <h3 className="font-display text-3xl uppercase group-hover:text-surf-accent transition-colors">Groms</h3>
              <p className="text-xs text-gray-400">Future rippers</p>
            </div>
          </div>  )
}

export default Groms