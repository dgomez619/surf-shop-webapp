import { Link } from 'react-router-dom'

const Rentals = () => {
  return (
<Link to="/rentals" className="bento-card bento-rentals md:col-span-1 flex flex-col justify-center items-center text-center group cursor-pointer border-surf-accent">
            <div className="w-16 h-16 rounded-full bg-surf-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="ph-fill ph-calendar-check text-3xl text-black"></i>
            </div>
            <h3 className="font-display text-3xl uppercase mb-1">Rentals</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Wetsuits • Boards • Gear</p>
          </Link>  )
}

export default Rentals