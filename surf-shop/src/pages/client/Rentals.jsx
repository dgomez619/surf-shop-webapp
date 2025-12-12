import { useState, useEffect, useMemo } from 'react'
import { db } from '../../firebase' // Removed .js extension to fix resolution error
import { collection, getDocs } from 'firebase/firestore'

// Mock Bookings (Keeping this logic local for now as requested)
const today = new Date();
const threeDaysFromNow = new Date();
threeDaysFromNow.setDate(today.getDate() + 3);

const existingBookings = [
  {
    id: "booking_123",
    itemId: "b001", // Make sure this ID matches one of your seeded items if you want to see the "Booked" status
    startDate: today.toISOString().split('T')[0], 
    endDate: threeDaysFromNow.toISOString().split('T')[0],
    status: "confirmed"
  }
]

const formatDate = (date) => date.toISOString().split('T')[0];

export default function Rentals() {
  // --- STATE ---
  const [rentals, setRentals] = useState([]) // Replaces mock inventory
  const [loading, setLoading] = useState(true)
  
  const [dateRange, setDateRange] = useState({
    start: formatDate(new Date()),
    end: formatDate(new Date(new Date().setDate(new Date().getDate() + 1)))
  });
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Shortboard', 'Midlength', 'Longboard', 'Foamie', 'Fins'];

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'rentals'))
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setRentals(items)
      } catch (error) {
        console.error("Error fetching rental fleet:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRentals()
  }, [])

  // --- 2. AVAILABILITY LOGIC ---
  const availableInventory = useMemo(() => {
    // We map over the fetched 'rentals' state instead of the old 'inventory' constant
    return rentals.map(item => {
      const isBooked = existingBookings.some(booking => {
        // Note: In real app, booking.itemId needs to match item.id from Firestore
        if (booking.itemId !== item.id) return false;
        
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        const reqStart = new Date(dateRange.start);
        const reqEnd = new Date(dateRange.end);

        return reqStart <= bookingEnd && reqEnd >= bookingStart;
      });

      return { ...item, status: isBooked ? 'unavailable' : 'available' };
    });
  }, [dateRange, rentals]);

  const displayedItems = selectedCategory === 'All' 
    ? availableInventory 
    : availableInventory.filter(i => i.category === selectedCategory);

  return (
    // Root wrapper
    <div className="w-full min-h-screen bg-surf-black text-white font-body bg-noise pb-24">
      
      {/* 1. HERO SECTION */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden flex items-end pb-12 px-4 md:px-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505528082984-783b9f1d011f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surf-black via-transparent to-black/40"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto w-full">
            <span className="text-surf-accent font-mono font-bold text-xs md:text-sm tracking-widest uppercase mb-2 block">
                The Board Room
            </span>
            <h1 className="font-display text-5xl md:text-8xl uppercase leading-[0.85] mb-4">
                Build Your <br/><span className="text-transparent stroke-white text-outline">Quiver</span>
            </h1>
            <p className="text-gray-300 max-w-lg text-sm md:text-base">
                Select your dates. Choose your weapon. Pick it up at the shop.
            </p>
        </div>
      </div>

      {/* 2. MISSION CONTROL (Sticky Filter Bar) */}
      <div className="sticky top-20 z-30 w-full bg-surf-black/80 backdrop-blur-xl border-y border-white/10 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-4 py-4 md:py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* A. Date Picker Module */}
                <div className="flex items-center gap-2 bg-surf-card p-1 rounded-lg border border-white/10 w-full md:w-auto">
                    <div className="relative group px-3 py-2 border-r border-white/10 flex-1 md:flex-none">
                        <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Pickup</label>
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            className="bg-transparent text-white font-mono text-sm focus:outline-none w-full uppercase [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                    <div className="relative group px-3 py-2 flex-1 md:flex-none">
                        <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Dropoff</label>
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            className="bg-transparent text-white font-mono text-sm focus:outline-none w-full uppercase [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                </div>

                {/* B. Category Pills */}
                <div className="w-auto max-w-[100vw] overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex gap-2 w-max">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-all border ${
                                    selectedCategory === cat 
                                    ? 'bg-surf-accent text-black border-surf-accent' 
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-transparent'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>

      {/* 3. INVENTORY GRID */}
      <main className="max-w-[1600px] mx-auto px-4 py-12">
        
        {/* Loading State */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-24 gap-4">
                <i className="ph-duotone ph-spinner-gap text-4xl animate-spin text-surf-accent"></i>
                <span className="font-mono text-sm tracking-widest uppercase text-gray-500">Checking the racks...</span>
            </div>
        ) : (
            <>
                {/* Helper Message if no items */}
                {displayedItems.length === 0 && (
                    <div className="text-center py-24 border border-dashed border-white/10 rounded-xl">
                        <i className="ph-duotone ph-magnifying-glass text-4xl text-gray-600 mb-4"></i>
                        <p className="text-gray-400">No gear found in this category.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {displayedItems.map((item) => {
                        const isUnavailable = item.status === 'unavailable';

                        return (
                            <div key={item.id} className={`group relative flex flex-col ${isUnavailable ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                
                                {/* A. The "Card Face" (Image & Specs) */}
                                <div className={`relative aspect-[1/2] rounded-xl overflow-hidden bg-surf-card transition-all duration-500 ${
                                    item.isDemoQuiver 
                                        ? 'border-2 border-yellow-500/40 group-hover:border-yellow-500/80' 
                                        : 'border border-white/5 group-hover:border-surf-accent/50'
                                }`}>
                                    
                                    {/* Image Logic */}
                                    {item.image ? (
                                        <img src={item.image} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt={item.name} />
                                    ) : (
                                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                            <i className="ph-fill ph-wave-sine text-6xl text-gray-600"></i>
                                        </div>
                                    )}
                                    
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90"></div>

                                    {/* Demo Quiver Badge */}
                                    {item.isDemoQuiver && !isUnavailable && (
                                        <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 border border-yellow-600/30">
                                            <i className="ph-fill ph-crown text-sm"></i>
                                            <span className="font-bold text-xs uppercase tracking-wider">Society Exclusive</span>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    {isUnavailable && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
                                            <div className="border-2 border-red-500 text-red-500 px-4 py-2 font-display text-2xl uppercase -rotate-12">
                                                Booked
                                            </div>
                                        </div>
                                    )}

                                    {/* Specs HUD (Head Up Display) */}
                                    <div className="absolute bottom-0 w-full p-4 z-10">
                                        <h3 className="font-display text-3xl uppercase leading-none mb-4 group-hover:text-surf-accent transition-colors">{item.name}</h3>
                                        
                                        {/* Specs Grid - Safe access with optional chaining */}
                                        {item.specs && (
                                            <div className="grid grid-cols-3 border-t border-white/20 pt-3">
                                                <div className="text-center border-r border-white/10">
                                                    <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest">Len</span>
                                                    <span className="font-mono text-sm">{item.specs.length}</span>
                                                </div>
                                                <div className="text-center border-r border-white/10">
                                                    <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest">Vol</span>
                                                    <span className="font-mono text-sm">{item.specs.vol}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest">Fin</span>
                                                    <span className="font-mono text-sm">{item.specs.fin}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* B. Pricing & Action */}
                                <div className="mt-3 flex items-center justify-between px-1">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-sm line-through decoration-red-500">${item.rates?.daily}</span>
                                            <span className="text-surf-accent font-mono font-bold text-lg">${item.rates?.member}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Daily Rate</span>
                                    </div>

                                    <button className="h-10 px-4 bg-white text-black font-bold uppercase text-xs rounded hover:bg-surf-accent transition-colors flex items-center gap-2 cursor-pointer">
                                        Add <i className="ph-bold ph-plus"></i>
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </>
        )}
      </main>

      {/* 4. SURF SOCIETY UPSELL (Sticky Footer) */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-30 pointer-events-none">
        <div className="max-w-md mx-auto bg-surf-accent text-black p-4 rounded-lg shadow-2xl pointer-events-auto flex items-center justify-between transform transition-transform hover:scale-105 cursor-pointer border border-black">
            <div>
                <p className="font-bold uppercase text-sm">Save 40% on Rentals</p>
                <p className="text-xs opacity-80">Join the Surf Society today.</p>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded text-xs font-bold uppercase cursor-pointer">Join</button>
        </div>
      </div>

    </div>
  )
}