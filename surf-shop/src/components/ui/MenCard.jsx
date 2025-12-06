import React from 'react'

const Men = () => {
  return (
  <div className="bento-card bento-men md:col-span-1 min-h-[250px] group cursor-pointer">
            <div className="card-bg bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
            <div className="w-full h-full flex items-center justify-center opacity-10">
              <i className="ph-fill ph-person-simple-run text-9xl"></i>
            </div>
            <div className="absolute bottom-6 left-6">
              <span className="text-xs font-bold text-surf-accent uppercase mb-1 block">Apparel</span>
              <h3 className="font-display text-3xl uppercase">Men's</h3>
            </div>
            <div className="absolute top-4 right-4 bg-surf-accent text-black text-xs font-bold px-2 py-1 rounded">NEW</div>
          </div>  )
}

export default Men