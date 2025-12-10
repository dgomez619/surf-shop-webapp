import { Link } from 'react-router-dom'

const Women = () => {
  return (
       <Link to="/shop?category=Women" className="bento-card bento-women md:col-span-1 min-h-[250px] group cursor-pointer">
            <div className="card-bg bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
            <div className="w-full h-full flex items-center justify-center opacity-10">
              <i className="ph-fill ph-t-shirt text-9xl"></i>
            </div>
            <div className="absolute bottom-6 left-6">
              <span className="text-xs font-bold text-surf-accent uppercase mb-1 block">Apparel</span>
              <h3 className="font-display text-3xl uppercase">Women's</h3>
            </div>
          </Link>  )
}

export default Women