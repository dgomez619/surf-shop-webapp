import React from 'react'
import { Link } from 'react-router-dom'

const Boards = () => {
  return (
 <Link to="/shop?category=Surfboards" className="bento-card bento-boards md:col-span-1 md:row-span-1 min-h-[250px] bg-white text-black group cursor-pointer">
            <div className="card-bg bg-[url('https://images.unsplash.com/photo-1531722569936-825d3dd91b15?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale group-hover:grayscale-0 transition-all"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h3 className="font-display text-4xl uppercase leading-none">Surf<br/>Boards</h3>
                <i className="ph-bold ph-arrow-up-right text-2xl"></i>
              </div>
              <p className="font-bold text-sm uppercase tracking-wide">Performance & <br/>Longboards</p>
            </div>
          </Link>  )
}

export default Boards