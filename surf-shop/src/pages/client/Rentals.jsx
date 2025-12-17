import { useState, useEffect, useMemo } from 'react'
import { db } from '../../firebase.js' // Added .js extension
import { collection, getDocs } from 'firebase/firestore'
import { useCart } from '../../context/CartContext.jsx' // Added .jsx extension

// --- HELPER: DATE LOGIC ---
const formatDate = (date) => date.toISOString().split('T')[0];

const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays || 1; 
}

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

export default function Rentals() {
  const { addToCart } = useCart()
  const [rentals, setRentals] = useState([]) 
  const [bookings, setBookings] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  
  const isMember = false;
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDemoOnly, setShowDemoOnly] = useState(false);
  const [showUpsell, setShowUpsell] = useState(true);
  
  const [dateRange, setDateRange] = useState({
    start: formatDate(new Date()),
    end: formatDate(new Date(new Date().setDate(new Date().getDate() + 1)))
  });

  const rentalDays = useMemo(() => calculateDays(dateRange.start, dateRange.end), [dateRange]);

  const getActiveRate = (item) => isMember ? (item.rates?.member || item.rates?.daily) : item.rates?.daily;

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rentalSnap = await getDocs(collection(db, 'rentals'))
        const rentalItems = rentalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setRentals(rentalItems)

        const bookingSnap = await getDocs(collection(db, 'bookings'))
        const bookingItems = bookingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setBookings(bookingItems)

        setError(null)
      } catch (error) {
        console.error("Error fetching data:", error)
        if (rentals.length === 0) setError("Failed to load inventory.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // --- LOGIC: PROCESS AVAILABILITY ---
  const processedInventory = useMemo(() => {
    return rentals.map(item => {
      // A. Check Basics
      if (!item.stock || item.stock <= 0) {
        return { 
          ...item, 
          availabilityStatus: 'unavailable',
          unavailableReason: 'Out of Stock',
          remainingStock: 0
        };
      }

      if (item.status !== 'active') {
        return { 
          ...item, 
          availabilityStatus: 'unavailable',
          unavailableReason: 'In Repair',
          remainingStock: 0
        };
      }

      // B. Check Date Conflicts
      const overlapCount = bookings.filter(booking => {
        // 1. Must match Item ID
        if (booking.boardId !== item.id && booking.rentalId !== item.id) return false; 
        
        // 2. CRITICAL CHANGE: Ignore if returned
        // If status is 'returned', the item is physically back, regardless of dates.
        if (booking.status === 'returned') return false;

        // 3. Date Overlap Logic
        const bookingStart = new Date(booking.dateRange?.start);
        const bookingEnd = new Date(booking.dateRange?.end);
        const reqStart = new Date(dateRange.start);
        const reqEnd = new Date(dateRange.end);

        return reqStart < bookingEnd && reqEnd > bookingStart;
      }).length;

      const remainingStock = item.stock - overlapCount;

      if (remainingStock <= 0) {
        return { 
          ...item, 
          availabilityStatus: 'unavailable',
          unavailableReason: 'Booked for Dates',
          remainingStock: 0
        };
      }
      
      return { 
        ...item, 
        availabilityStatus: 'available',
        remainingStock: remainingStock
      };
    });
  }, [rentals, bookings, dateRange]); 

  const filteredItems = useMemo(() => {
    return processedInventory.filter(item => {
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchDemo = showDemoOnly ? item.isDemoQuiver : true;
      return matchCategory && matchDemo;
    });
  }, [processedInventory, selectedCategory, showDemoOnly]);

  const getCategoryCount = (cat) => {
      if (cat === 'All') return rentals.length;
      return rentals.filter(r => r.category === cat).length;
  }

  const categories = ['All', 'Shortboard', 'Midlength', 'Longboard', 'Foamie', 'Fins'];

  const handleDateChange = (field, value) => {
      setDateRange(prev => {
          const newState = { ...prev, [field]: value };
          if (field === 'end' && new Date(value) < new Date(newState.start)) {
              alert("Dropoff date cannot be before pickup date.");
              return prev;
          }
          if (field === 'start' && new Date(value) > new Date(newState.end)) {
              const newEnd = new Date(value);
              newEnd.setDate(newEnd.getDate() + 1);
              return { start: value, end: formatDate(newEnd) };
          }
          return newState;
      });
  };

  const handleAddToCart = (item) => {
    if (item.availabilityStatus === 'unavailable') {
        alert(item.unavailableReason || "Unavailable.");
        return;
    }
    if (rentalDays < 1) {
        alert("Minimum rental period is 1 day.");
        return;
    }

    const activeRate = getActiveRate(item);
    const rentalItem = {
        id: item.id,
        name: item.name,
        image: item.image,
        category: item.category,
        type: 'rental', 
        price: activeRate, 
        dailyRate: activeRate,
        memberRate: item.rates?.member || 0,
        rateType: isMember ? 'member' : 'daily',
        dateRange: {
            start: dateRange.start,
            end: dateRange.end
        },
        days: rentalDays,
        quantity: 1, 
        stock: item.remainingStock
    };

    addToCart(rentalItem);
    setToastMsg(`Added ${item.name} to Stash`);
  }

  return (
    <div className="w-full min-h-screen bg-surf-black text-white font-body bg-noise pb-24">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* HERO */}
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

      {/* MISSION CONTROL */}
      <div className="sticky top-20 z-30 w-full bg-surf-black/80 backdrop-blur-xl border-y border-white/10 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-4 py-4 md:py-6">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                {/* Date Picker */}
                <div className="flex items-center gap-2 bg-surf-card p-1 rounded-lg border border-white/10 w-full md:w-auto shadow-lg">
                    <div className="relative group px-3 py-2 border-r border-white/10 flex-1 md:flex-none min-w-[140px]">
                        <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Pickup</label>
                        <input type="date" min={formatDate(new Date())} value={dateRange.start} onChange={(e) => handleDateChange('start', e.target.value)} className="bg-transparent text-white font-mono text-sm focus:outline-none w-full uppercase [&::-webkit-calendar-picker-indicator]:invert cursor-pointer" />
                    </div>
                    <div className="relative group px-3 py-2 flex-1 md:flex-none min-w-[140px]">
                        <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Dropoff</label>
                        <input type="date" min={dateRange.start} value={dateRange.end} onChange={(e) => handleDateChange('end', e.target.value)} className="bg-transparent text-white font-mono text-sm focus:outline-none w-full uppercase [&::-webkit-calendar-picker-indicator]:invert cursor-pointer" />
                    </div>
                    <div className="hidden md:flex flex-col items-center justify-center px-4 bg-white/5 h-full rounded">
                        <span className="font-display text-xl text-surf-accent">{rentalDays}</span>
                        <span className="text-[10px] uppercase text-gray-500 leading-none">Days</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto overflow-hidden">
                    <button onClick={() => setShowDemoOnly(!showDemoOnly)} className={`flex items-center gap-2 px-4 py-2 rounded border transition-all whitespace-nowrap ${showDemoOnly ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-transparent border-white/10 text-gray-400 hover:text-white'}`}>
                        <i className={`ph-fill ${showDemoOnly ? 'ph-check-square' : 'ph-square'}`}></i>
                        <span className="text-xs font-bold uppercase tracking-widest">Demo Quiver Only</span>
                    </button>
                    <div className="flex-1 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                        <div className="flex gap-2 w-max">
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-all border flex items-center gap-2 ${selectedCategory === cat ? 'bg-surf-accent text-black border-surf-accent' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-transparent'}`}>
                                    {cat}
                                    <span className={`text-[10px] py-0.5 px-1.5 rounded-full ${selectedCategory === cat ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-500'}`}>{getCategoryCount(cat)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* GRID */}
      <main className="max-w-[1600px] mx-auto px-4 py-12">
        {error && <div className="max-w-md mx-auto mb-8 bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">{error}</div>}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-24 gap-4">
                <i className="ph-duotone ph-spinner-gap text-4xl animate-spin text-surf-accent"></i>
                <span className="font-mono text-sm tracking-widest uppercase text-gray-500">Checking the racks...</span>
            </div>
        ) : (
            <>
                {filteredItems.length === 0 && (
                    <div className="text-center py-24 border border-dashed border-white/10 rounded-xl">
                        <i className="ph-duotone ph-magnifying-glass text-4xl text-gray-600 mb-4"></i>
                        <p className="text-gray-400">No available gear matches your filter.</p>
                        {showDemoOnly && <button onClick={() => setShowDemoOnly(false)} className="mt-4 text-surf-accent hover:underline">Show all boards</button>}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredItems.map((item) => {
                        const isUnavailable = item.availabilityStatus === 'unavailable';

                        return (
                            <div key={item.id} className={`group relative flex flex-col ${isUnavailable ? 'opacity-50 grayscale' : ''}`}>
                                
                                <div className="relative aspect-[1/2] rounded-xl overflow-hidden bg-surf-card border border-white/5 group-hover:border-surf-accent/50 transition-all duration-500">
                                    {item.image ? (
                                        <img src={item.image} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt={item.name} />
                                    ) : (
                                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center"><i className="ph-fill ph-wave-sine text-6xl text-gray-600"></i></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90"></div>

                                    {/* Availability Badge */}
                                    {isUnavailable ? (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
                                            <div className="border-2 border-red-500 text-red-500 px-4 py-2 font-display text-xl uppercase -rotate-12 text-center">{item.unavailableReason}</div>
                                        </div>
                                    ) : (
                                        // Show Stock Count if low or available
                                        <div className="absolute top-2 right-2 z-20">
                                            <span className={`text-[10px] font-bold px-2 py-1 uppercase rounded shadow-lg ${item.remainingStock < 3 ? 'bg-yellow-500 text-black' : 'bg-black/50 text-white border border-white/20'}`}>
                                                {item.remainingStock} Available
                                            </span>
                                        </div>
                                    )}

                                    {item.isDemoQuiver && !isUnavailable && (
                                        <div className="absolute top-2 left-2 z-20">
                                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 uppercase rounded shadow-lg">Demo Quiver</span>
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 w-full p-4 z-10">
                                        <h3 className="font-display text-3xl uppercase leading-none mb-4 group-hover:text-surf-accent transition-colors">{item.name}</h3>
                                        {item.specs && (
                                            <div className="grid grid-cols-3 border-t border-white/20 pt-3">
                                                <div className="text-center border-r border-white/10"><span className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest">Len</span><span className="font-mono text-sm">{item.specs.length}</span></div>
                                                <div className="text-center border-r border-white/10"><span className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest">Vol</span><span className="font-mono text-sm">{item.specs.vol}</span></div>
                                                <div className="text-center"><span className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest">Fin</span><span className="font-mono text-sm">{item.specs.fin}</span></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-3 bg-white/5 rounded-lg p-3 border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                {isMember ? (
                                                    <>
                                                        <span className="text-gray-400 text-sm line-through decoration-red-500">${item.rates?.daily}</span>
                                                        <span className="text-surf-accent font-mono font-bold text-lg">${item.rates?.member}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-white font-mono font-bold text-lg">${item.rates?.daily}</span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{isMember ? 'Member Rate' : 'Daily Rate'}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-white font-bold text-lg">${(getActiveRate(item) * rentalDays).toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Total ({rentalDays} Days)</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleAddToCart(item)}
                                        disabled={isUnavailable}
                                        className="w-full h-10 bg-white text-black font-bold uppercase text-xs rounded hover:bg-surf-accent transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        Add to Quiver <i className="ph-bold ph-plus"></i>
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </>
        )}
      </main>

      {/* FOOTER UPSELL */}
      {showUpsell && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-20 pointer-events-none">
          <div className="max-w-md mx-auto bg-surf-accent text-black p-4 rounded-lg shadow-2xl pointer-events-auto flex items-center justify-between transform transition-transform hover:scale-105 cursor-pointer border border-black group relative">
              <div>
                  <p className="font-bold uppercase text-sm group-hover:underline">Unlock Member Pricing</p>
                  <p className="text-xs opacity-80">Join the Surf Society today.</p>
              </div>
              <div className="flex items-center gap-2">
                  <button className="bg-black text-white px-4 py-2 rounded text-xs font-bold uppercase cursor-pointer">Join</button>
                  <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          setShowUpsell(false);
                      }}
                      className="bg-black/20 hover:bg-black/40 text-black p-1.5 rounded transition-colors"
                      aria-label="Dismiss"
                  >
                      <i className="ph-bold ph-x text-sm"></i>
                  </button>
              </div>
          </div>
        </div>
      )}


    </div>
  )
}