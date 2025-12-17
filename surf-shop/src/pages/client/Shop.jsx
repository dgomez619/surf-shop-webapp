import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { db } from '../../firebase' // Reverted to extension-less import
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useCart } from '../../context/CartContext'

// Toast Notification Component
const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-surf-accent text-black px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(196,249,52,0.3)] animate-bounce-in flex items-center gap-2">
            <i className="ph-bold ph-check-circle text-xl"></i>
            {message}
        </div>
    );
};

// ShopProductCard Component - Manages individual product with size selection
const ShopProductCard = ({ product, addToCart, onAddSuccess, isOutOfStock }) => {
  const [selectedSize, setSelectedSize] = useState(null)
  
  // Helper for border hover colors
  const getHoverColor = (cat) => {
    if(cat === 'Surfboards') return 'group-hover:border-blue-500'
    if(cat === 'Women') return 'group-hover:border-pink-500'
    if(cat === 'Groms') return 'group-hover:border-yellow-500'
    return 'group-hover:border-surf-accent/50'
  }

  const handleAddToCart = () => {
    // Prevent adding out of stock items
    if (isOutOfStock) {
      alert('This item is currently out of stock.')
      return
    }

    // Check if product requires size selection
    if (product.sizes && product.sizes.length > 0) {
      if (!selectedSize) {
        alert('Please select a size.')
        return
      }
      
      // Check size-specific stock
      if (product.stockBySize) {
        const sizeStock = product.stockBySize[selectedSize] || 0
        if (sizeStock === 0) {
          alert(`Size ${selectedSize} is currently out of stock.`)
          return
        }
      }
    }

    // Add to cart with selected size (if applicable)
    addToCart({
      ...product,
      selectedSize: selectedSize || undefined,
      type: 'shop' // Mark as shop product (not rental)
    })
    
    // Trigger success toast
    onAddSuccess(product.name)
  }

  const hoverColor = getHoverColor(product.category)

  return (
    <div className={`group col-span-1 ${product.type === 'board' ? 'lg:row-span-1' : ''}`}>
      {/* Card Container */}
      <div
        className={`relative rounded-xl overflow-hidden border border-white/5 ${hoverColor} transition-all duration-300
          ${product.type === 'board'
            ? 'aspect-[2/3.5] md:aspect-3/4 lg:aspect-4/5'
            : product.type === 'accessory'
              ? 'aspect-square'
              : 'aspect-[3/4.5] md:aspect-3/4 lg:aspect-3/4'
          } bg-surf-card w-full ${isOutOfStock ? 'opacity-60' : ''}`}
      >
        {/* Background Logic: Real Image or Placeholder */}
        {product.image ? (
          <div className="absolute inset-0">
            <img 
              src={product.image} 
              alt={product.name} 
              className={`w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ${isOutOfStock ? 'grayscale' : ''}`} 
            />
            <div className="absolute inset-0 bg-linear-to-t from-surf-black via-transparent to-transparent opacity-90"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-gray-600">
            <i className={`ph-fill ${product.icon} text-5xl md:text-6xl`}></i>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="text-center">
              <div className="bg-red-500 text-white px-6 py-3 font-bold uppercase text-sm md:text-base rotate-[-12deg] border-2 border-white shadow-xl inline-block mb-2">
                Out of Stock
              </div>
              <p className="text-xs text-gray-400 mt-2">Check back soon</p>
            </div>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 bg-surf-accent text-black text-[10px] font-bold px-2 py-1 uppercase rounded-sm z-30">
            {product.badge}
          </div>
        )}

        {/* Size Selection (if applicable) */}
        {product.sizes && product.sizes.length > 0 && !isOutOfStock && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-30">
            {product.sizes.map((size) => {
              const sizeStock = product.stockBySize?.[size] || 0
              const isSizeOutOfStock = sizeStock === 0
              
              return (
                <button
                  key={size}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isSizeOutOfStock) {
                      setSelectedSize(size)
                    }
                  }}
                  disabled={isSizeOutOfStock}
                  className={`w-8 h-8 rounded border text-xs font-bold transition-all relative ${
                    isSizeOutOfStock
                      ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed line-through'
                      : selectedSize === size
                        ? 'bg-surf-accent text-black border-surf-accent'
                        : 'bg-black/60 text-white border-white/30 hover:border-surf-accent cursor-pointer'
                  }`}
                  title={isSizeOutOfStock ? `Size ${size} out of stock` : `${sizeStock} in stock`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        )}

        {/* Board Specs Overlay */}
        {product.type === 'board' && product.specs && Object.values(product.specs).some(val => val) && (
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-black/60 backdrop-blur-sm border-t border-white/10 opacity-100 translate-y-0 md:opacity-100 md:translate-y-full md:group-hover:translate-y-0 transition-all text-[10px] font-mono z-10">
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

        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`absolute bottom-3 right-3 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-30 shadow-lg ${
            isOutOfStock 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-black hover:bg-surf-accent cursor-pointer'
          }`}
        >
          {isOutOfStock ? (
            <i className="ph-bold ph-x text-lg"></i>
          ) : (
            <i className="ph-bold ph-plus text-lg"></i>
          )}
        </button>
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
        
        {/* Selected Size Display */}
        {selectedSize && (
          <p className="text-xs text-surf-accent font-mono">
            Size: {selectedSize}
          </p>
        )}
      </div>
    </div>
  )
}

// Ad breaks configuration
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
  // --- 1. URL & FILTER STATE MANAGEMENT ---
  const [searchParams, setSearchParams] = useSearchParams()
  const categories = ['All', 'Surfboards', 'Men', 'Women', 'Groms', 'Accessories']
  const { addToCart } = useCart()
  const [toastMsg, setToastMsg] = useState(null)
  
  // Get category from URL, validate it, and use as initial state
  const getCategoryFromUrl = () => {
    const urlCategory = searchParams.get('category')
    return urlCategory && categories.includes(urlCategory) ? urlCategory : 'All'
  }
  
  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromUrl)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Sync state when URL changes (Browser Back/Forward)
  useEffect(() => {
    const urlCategory = searchParams.get('category')
    const validCategory = urlCategory && categories.includes(urlCategory) ? urlCategory : 'All'
    setSelectedCategory(validCategory)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Helper to update both URL and State when user clicks a pill
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setSearchParams({ category: cat })
  }

  // --- 2. FETCH DATA FROM FIREBASE ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'products')
        // Try sorting by createdAt, fallback gracefully if index missing
        let q = query(productsRef, orderBy('createdAt', 'desc'))
        
        try {
            const querySnapshot = await getDocs(q)
            setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        } catch (sortError) {
            console.warn("Sorting failed (missing index?), fetching unsorted.")
            const unsortedSnapshot = await getDocs(productsRef)
            setProducts(unsortedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // --- 3. CLIENT-SIDE FILTERING ---
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory)

  // --- 4. RENDER ---
  if (loading) {
    return (
        <div className="min-h-screen bg-surf-black flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
                <i className="ph-duotone ph-spinner-gap text-4xl animate-spin text-surf-accent"></i>
                <span className="font-mono text-sm tracking-widest uppercase text-gray-500">Loading Stash...</span>
            </div>
        </div>
    )
  }

  return (
    <div className="bg-surf-black min-h-screen text-white font-body bg-noise">

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      <br />
      <br />
      {/* Marquee Banner - User's Full width Hack */}
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

      {/* Category Pills - Scrollable (Fixed position below nav using User's class) */}
      <div className="sticky-below-nav w-full overflow-x-auto hide-scrollbar bg-surf-black/80 backdrop-blur-md py-2 border-b border-white/5 z-40">
        <div className="px-4 flex gap-2 min-w-max pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 md:px-6 py-2 rounded-full font-bold uppercase text-xs md:text-sm whitespace-nowrap transition-colors border shrink-0 cursor-pointer ${
                selectedCategory === cat
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
      <div className="px-4 pt-20 max-w-[1600px] mx-auto">
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
            // Check if product is out of stock
            let isOutOfStock = false
            if (product.sizes && product.sizes.length > 0 && product.stockBySize) {
              // For sized products, check if ALL sizes are out of stock
              const allSizesOutOfStock = product.sizes.every(size => {
                const sizeStock = product.stockBySize[size] || 0
                return sizeStock === 0
              })
              isOutOfStock = allSizesOutOfStock
            } else {
              // For non-sized products, check general stock
              isOutOfStock = !product.stock || product.stock === 0
            }
            
            const productCard = <ShopProductCard 
              key={product.id} 
              product={product} 
              addToCart={addToCart} 
              onAddSuccess={(name) => setToastMsg(`Added ${name} to Stash`)}
              isOutOfStock={isOutOfStock}
            />

            // Inject ad break using your logic
            if ((index + 2) % 2 === 0 && selectedCategory === 'All') {
              // Calculate which ad to show based on how many ads have been shown
              const adIndex = Math.floor((index + 2) / 2) % adBreaks.length
              const currentAd = adBreaks[adIndex]

              return (
                <div key={`group-${index}`} className="contents">
                  {productCard}

                  {/* Ad Break */}
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
          <button className="relative px-6 py-3 md:px-8 md:py-4 bg-transparent border border-white/20 text-sm md:text-base font-bold uppercase tracking-widest overflow-hidden group cursor-pointer">
            <span className="relative z-10 group-hover:text-black transition-colors">Load More Gear</span>
            <div className="absolute inset-0 bg-surf-accent translate-y-full group-hover:translate-y-0 transition-transform"></div>
          </button>
        </div>
      </div>
    </div>
  )
}