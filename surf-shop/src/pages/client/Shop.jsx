import { Link } from 'react-router-dom'
import { useState } from 'react'

const products = [
  {
    id: 1,
    name: 'Bird Rock Logo Tee',
    category: 'Men',
    type: 'apparel',
    price: 32,
    memberPrice: 28,
    badge: 'New Drop',
    icon: 'ph-t-shirt',
    color: 'group-hover:border-surf-accent/50'
  },

  {
    id: 2,
    name: 'Pyzel Crisis',
    category: 'Surfboards',
    type: 'board',
    price: 850,
    memberPrice: null,
    specs: {
      length: "5'10\"",
      vol: '29.5L',
      fin: 'Twin'
    },
    badge: 'Free Rental Demo',
    icon: 'ph-wave-sine',
    color: 'group-hover:border-blue-500'
  },

  {
    id: 3,
    name: 'Sticky Bumps Wax',
    category: 'Accessories',
    type: 'accessory',
    price: 4,
    memberPrice: null,
    icon: 'ph-drop',
    color: 'group-hover:border-surf-accent/50'
  },

  {
    id: 4,
    name: 'Dawn Patrol Hoodie',
    category: 'Women',
    type: 'apparel',
    price: 65,
    memberPrice: 55,
    icon: 'ph-hoodie',
    color: 'group-hover:border-pink-500'
  },

  {
    id: 5,
    name: 'Grom Trucker Hat',
    category: 'Groms',
    type: 'accessory',
    price: 24,
    memberPrice: null,
    icon: 'ph-baseball-cap',
    color: 'group-hover:border-yellow-500'
  },

  {
    id: 6,
    name: 'CJ Nelson Sprout',
    category: 'Surfboards',
    type: 'board',
    price: 1100,
    memberPrice: null,
    specs: {
      length: "9'2\"",
      fin: 'Single',
      style: 'Log'
    },
    icon: 'ph-wave-sine',
    color: 'group-hover:border-blue-500'
  },

  {
    id: 7,
    name: 'Sea Salt Candle',
    category: 'Home',
    type: 'accessory',
    price: 28,
    memberPrice: null,
    icon: 'ph-fire',
    color: 'group-hover:border-surf-accent/50'
  },
]

const adBreaks = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1520116468816-95b69f847357?q=80&w=2574&auto=format&fit=crop',
    category: 'The Society',
    title: 'Ride this board for $25/day',
    link: '/society'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=2626&auto=format&fit=crop',
    category: 'Rentals',
    title: 'Wetsuits & boards ready to go',
    link: '/rentals'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2574&auto=format&fit=crop',
    category: 'The Surfshack',
    title: 'Your home away from home',
    link: '/surfshack'
  }
]

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const categories = ['All', 'Surfboards', 'Men', 'Women', 'Groms', 'Accessories']

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory)

  return (
    <>

      <br />
      <br />
      {/* Marquee Banner - Full width */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-surf-accent text-black overflow-hidden py-2 border-b border-black">
        <div className="flex gap-8 items-center animate-scroll font-mono font-bold text-sm tracking-widest uppercase whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-8 items-center">
              <span>Free Wax with every board purchase</span>
              <span>•</span>
              <span>Members get 20% off apparel</span>
              <span>•</span>
              <span>Local Delivery to La Jolla & PB</span>
              <span>•</span>
              <span>New "Storm" Collection out now</span>
              <span>•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status & Actions Bar */}
      <div className="w-full px-4 py-3 flex flex-col md:flex-row md:justify-end md:items-center gap-4">
        <div className="flex items-center gap-2 bg-surf-card px-3 py-1 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-xs font-mono text-gray-400">SHOP OPEN UNTIL 8PM</span>
        </div>
      </div>

      {/* Category Pills - Scrollable (Fixed position below nav) */}
      <div className="sticky-below-nav w-full overflow-x-auto hide-scrollbar bg-surf-black/80 backdrop-blur-md py-2 border-b border-white/5">
        <div className="px-4 flex gap-2 min-w-max pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 md:px-6 py-2 rounded-full font-bold uppercase text-xs md:text-sm whitespace-nowrap transition-colors border shrink-0 ${selectedCategory === cat
                ? 'bg-white text-black border-white'
                : 'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white border-white/20'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>


      {/* Main Content - Constrained width with padding to account for fixed pills bar */}
      <div className="px-4 pt-20">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="font-display text-4xl md:text-6xl lg:text-8xl uppercase leading-[0.85]">
            The <span className="text-surf-accent">Stash room</span>
          </h1>
          <p className="text-gray-400 mt-2 md:mt-4 max-w-md text-sm md:text-base">
            Curated hardgoods and softgoods for the La Jolla reef breaks. Verified by locals.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6 w-full">
          {filteredProducts.map((product, index) => {
            const productCard = (
              <div
                key={product.id}
                className={`group col-span-1 ${product.type === 'board' ? 'lg:row-span-1' : ''}`}
              >
                {/* Card Container */}
                <div
                  className={`relative rounded-xl overflow-hidden border border-white/5 ${product.color}
                    ${product.type === 'board'
                      ? 'aspect-[2/3.5] md:aspect-3/4 lg:aspect-4/5'
                      : product.type === 'accessory'
                        ? 'aspect-square'
                        : 'aspect-[3/4.5] md:aspect-3/4 lg:aspect-3/4'
                    } bg-surf-card w-full`}
                >
                  {/* Background */}
                  <div className="absolute inset-0 bg-gray-800" />

                  {/* Product Icon */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600 z-10">
                    {product.type === 'board'
                      ? <div className="w-12 md:w-16 h-[70%] bg-gray-300 rounded-full opacity-20"></div>
                      : <i className={`ph-fill ${product.icon} text-5xl md:text-6xl`}></i>
                    }
                  </div>

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-2 left-2 bg-surf-accent text-black text-[10px] font-bold px-2 py-1 uppercase rounded-sm z-30">
                      {product.badge}
                    </div>
                  )}

                  {/* Add to Cart Button - Positioned above specs */}
                  <button className="absolute bottom-12 right-3 bg-white text-black w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 z-20">
                    <i className="ph-bold ph-plus"></i>
                  </button>

                  {/* Board Specs Overlay */}
                  {product.specs && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-black/60 backdrop-blur-sm border-t border-white/10 translate-y-full group-hover:translate-y-0 transition-all text-[10px] font-mono z-10">
                      <div className="grid grid-cols-3 gap-2 text-center text-gray-300">
                        {Object.entries(product.specs).map(([key, val]) => (
                          <div key={key}>
                            <span className="block text-white font-bold">{val}</span>
                            {key}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="mt-2 space-y-1">
                  <h3 className="font-bold text-sm md:text-lg truncate group-hover:text-surf-accent">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{product.category}</p>

                  <div className="flex items-center gap-2 text-xs md:text-sm font-mono mt-1 flex-wrap">
                    <span>${product.price}</span>
                    {product.memberPrice && (
                      <span className="text-surf-accent border border-surf-accent/30 px-1 rounded bg-surf-accent/10 text-[10px]">
                        ${product.memberPrice} Member
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )

            // Insert ad break after every 3rd product
            if ((index + 2) % 2 === 0 && selectedCategory === 'All') {
              // Calculate which ad to show based on how many ads have been shown
              const adIndex = Math.floor((index + 2) / 2) % adBreaks.length
              const currentAd = adBreaks[adIndex]

              return (
                <div key={`group-${index}`} className="contents">
                  {productCard}

                  {/* Ad Break - Cycles through different ads */}
                  <div className="col-span-1 aspect-[2/3.5] md:aspect-3/4 lg:aspect-4/5 relative rounded-xl overflow-hidden group">
                    <img
                      src={currentAd.image}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                      alt={currentAd.category}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black to-transparent"></div>
                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 max-w-xs">
                      <span className="text-surf-accent font-bold text-[10px] md:text-xs uppercase tracking-widest mb-2 block">{currentAd.category}</span>
                      <h3 className="font-display text-lg md:text-3xl uppercase mb-2 md:mb-4 leading-none">{currentAd.title}</h3>
                      <Link to={currentAd.link} className="text-xs font-bold border-b border-surf-accent hover:text-surf-accent inline-block">
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              )
            }

            return productCard
          })}
        </div>

        {/* Load More */}
        <div className="mt-12 md:mt-20 text-center">
          <button className="relative px-6 py-3 md:px-8 md:py-4 bg-transparent border border-white/20 text-sm md:text-base font-bold uppercase tracking-widest overflow-hidden group">
            <span className="relative z-10 group-hover:text-black transition-colors">Load More Gear</span>
            <div className="absolute inset-0 bg-surf-accent translate-y-full group-hover:translate-y-0 transition-transform"></div>
          </button>
        </div>
      </div>
    </>
  )
}
