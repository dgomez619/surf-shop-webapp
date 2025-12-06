import React from 'react'

const Accessories = () => {
  return (
<div className="bento-card bento-accessories md:col-span-2 min-h-[200px] flex items-center justify-between group cursor-pointer bg-gray-800">
            <div className="pl-4">
              <h3 className="font-display text-4xl uppercase mb-2">Home & <br/>Gear</h3>
              <p className="text-gray-400 text-sm">Fins, Leashes, Wax, & Decor</p>
            </div>
            <div className="w-1/2 h-full bg-white/5 relative">
               <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="block text-5xl font-display mb-1">50+</span>
                  <span className="text-xs uppercase tracking-widest">Brands</span>
                </div>
               </div>
            </div>
          </div>  )
}

export default Accessories