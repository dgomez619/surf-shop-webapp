import { useState } from 'react'

// --- MOCK DATABASE (Firestore Schema) ---
const propertyData = {
    id: "shack_001",
    name: "The Bird Rock Bungalow",
    tagline: "Sleep where you surf.",
    description: "A hidden industrial-modern loft tucked behind the shop. 50 steps to the reef. Wake up, check the cam, grab a board from the demo quiver, and paddle out before the coffee brews. Equipped with an outdoor shower, high-speed fiber for remote work, and secure board storage.",
    price: 350, // Nightly rate
    maxGuests: 4,
    images: [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop", // Main
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=1587&auto=format&fit=crop", // Interior
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop", // Patio
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"  // Beach
    ],
    amenities: [
        { icon: "ph-wifi-high", label: "Fiber Wifi" },
        { icon: "ph-shower", label: "Outdoor Shower" },
        { icon: "ph-surfboard", label: "Board Rack" },
        { icon: "ph-coffee", label: "Espresso Bar" },
        { icon: "ph-speaker-hifi", label: "Sonos System" },
        { icon: "ph-car", label: "Private Parking" }
    ]
}

export default function SurfShack() {
    // --- FORM STATE ---
    const [inquiry, setInquiry] = useState({
        checkIn: '',
        checkOut: '',
        guests: 2,
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- HANDLERS ---
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // SIMULATION: This is where you would call:
        // await addDoc(collection(db, 'inquiries'), inquiry);
        
        console.log("Sending Inquiry Payload:", inquiry);
        
        setTimeout(() => {
            alert("Request sent! Matt or Ben will text you shortly.");
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="w-full min-h-screen bg-surf-black text-white font-body bg-noise">
            
            {/* 1. HERO SECTION (Full Width) */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <img 
                    src={propertyData.images[0]} 
                    alt="Surf Shack Hero" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surf-black via-surf-black/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-[1600px] mx-auto">
                    <div className="inline-flex items-center gap-2 border border-surf-accent/30 bg-surf-accent/10 backdrop-blur-md px-3 py-1 rounded-full mb-4">
                        <span className="w-2 h-2 bg-surf-accent rounded-full animate-pulse"></span>
                        <span className="text-surf-accent text-xs font-bold uppercase tracking-widest">Vacation Rental</span>
                    </div>
                    <h1 className="font-display text-6xl md:text-8xl uppercase leading-[0.85] mb-2">
                        {propertyData.name}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 font-display uppercase tracking-wide">
                        {propertyData.tagline}
                    </p>
                </div>
            </div>

            {/* 2. MAIN CONTENT GRID (Split Layout) */}
            <main className="max-w-[1600px] mx-auto px-4 py-12 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT COLUMN: Content (8 Cols) */}
                    <div className="lg:col-span-8 space-y-16">
                        
                        {/* Description */}
                        <section>
                            <h2 className="font-display text-4xl uppercase mb-6">The <span className="text-surf-accent">Vibe</span></h2>
                            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                                {propertyData.description}
                            </p>
                        </section>

                        {/* Amenities Grid */}
                        <section>
                            <h2 className="font-display text-4xl uppercase mb-6">Loadout</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {propertyData.amenities.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-surf-card border border-white/5 hover:border-surf-accent/30 transition-colors group">
                                        <i className={`ph-fill ${item.icon} text-2xl text-gray-500 group-hover:text-surf-accent transition-colors`}></i>
                                        <span className="font-mono text-sm uppercase tracking-wide">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Image Gallery (Masonry-ish) */}
                        <section>
                            <h2 className="font-display text-4xl uppercase mb-6">Visuals</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px]">
                                <div className="md:col-span-1 h-full rounded-2xl overflow-hidden border border-white/5 relative group">
                                    <img src={propertyData.images[1]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Interior" />
                                </div>
                                <div className="md:col-span-1 flex flex-col gap-4 h-full">
                                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative group">
                                        <img src={propertyData.images[2]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Detail 1" />
                                    </div>
                                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative group">
                                        <img src={propertyData.images[3]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Detail 2" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Location / Map Placeholder */}
                        <section className="rounded-2xl overflow-hidden border border-white/10 relative h-[300px] bg-gray-800 flex items-center justify-center group">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541793910-c09e6c646036?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700"></div>
                            <div className="relative z-10 text-center">
                                <i className="ph-fill ph-map-pin text-4xl text-surf-accent mb-2 animate-bounce"></i>
                                <h3 className="font-display text-3xl uppercase">La Jolla, CA</h3>
                                <p className="font-mono text-sm text-gray-400">555 Bird Rock Ave</p>
                            </div>
                        </section>

                    </div>

                    {/* RIGHT COLUMN: Sticky Inquiry Form (4 Cols) */}
                    <div className="lg:col-span-4 relative">
                        {/* Sticky wrapper needs top-offset to clear the Navbar (h-20) plus some breathing room */}
                        <div className="sticky top-24">
                            
                            <div className="bg-surf-card border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                                {/* Decorative "Ticket" Elements */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-surf-accent via-blue-500 to-purple-500"></div>
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-surf-accent/10 rounded-full blur-2xl pointer-events-none"></div>

                                <div className="mb-6">
                                    <span className="font-mono text-xs text-gray-500 uppercase tracking-widest block mb-1">Nightly Rate</span>
                                    <div className="flex items-end gap-2">
                                        <span className="font-display text-5xl text-white">${propertyData.price}</span>
                                        <span className="text-gray-400 mb-2">/ night</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    
                                    {/* Dates Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="font-mono text-[10px] uppercase font-bold text-gray-500">Check In</label>
                                            <input 
                                                type="date" 
                                                required
                                                className="w-full bg-surf-black border border-white/20 rounded-lg p-3 text-sm focus:border-surf-accent focus:outline-none transition-colors uppercase [&::-webkit-calendar-picker-indicator]:invert"
                                                value={inquiry.checkIn}
                                                onChange={(e) => setInquiry({...inquiry, checkIn: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="font-mono text-[10px] uppercase font-bold text-gray-500">Check Out</label>
                                            <input 
                                                type="date" 
                                                required
                                                className="w-full bg-surf-black border border-white/20 rounded-lg p-3 text-sm focus:border-surf-accent focus:outline-none transition-colors uppercase [&::-webkit-calendar-picker-indicator]:invert"
                                                value={inquiry.checkOut}
                                                onChange={(e) => setInquiry({...inquiry, checkOut: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    {/* Guests */}
                                    <div className="space-y-1">
                                        <label className="font-mono text-[10px] uppercase font-bold text-gray-500">Surfers (Guests)</label>
                                        <div className="relative">
                                            <select 
                                                className="w-full bg-surf-black border border-white/20 rounded-lg p-3 text-sm focus:border-surf-accent focus:outline-none appearance-none cursor-pointer"
                                                value={inquiry.guests}
                                                onChange={(e) => setInquiry({...inquiry, guests: e.target.value})}
                                            >
                                                {[...Array(propertyData.maxGuests)].map((_, i) => (
                                                    <option key={i} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                            <i className="ph-bold ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-1">
                                        <label className="font-mono text-[10px] uppercase font-bold text-gray-500">Special Requests / Notes</label>
                                        <textarea 
                                            rows="4"
                                            className="w-full bg-surf-black border border-white/20 rounded-lg p-3 text-sm focus:border-surf-accent focus:outline-none transition-colors resize-none"
                                            placeholder="Do you need a specific board ready? Bringing a dog? Let us know."
                                            value={inquiry.message}
                                            onChange={(e) => setInquiry({...inquiry, message: e.target.value})}
                                        ></textarea>
                                    </div>

                                    {/* Submit Button */}
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full bg-surf-accent text-black font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-white transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <i className="ph-bold ph-spinner animate-spin text-xl"></i>
                                        ) : (
                                            <>
                                                Check Availability <i className="ph-bold ph-paper-plane-right"></i>
                                            </>
                                        )}
                                    </button>
                                    
                                    <p className="text-center text-xs text-gray-500 mt-2">
                                        You won't be charged yet. We'll text you to confirm dates.
                                    </p>

                                </form>
                            </div>

                            {/* Optional: Contact Info below form */}
                            <div className="mt-6 text-center">
                                <p className="font-mono text-xs text-gray-400 uppercase">Questions? Call the shop</p>
                                <a href="tel:8585550123" className="text-white font-bold hover:text-surf-accent transition-colors">(858) 555-0123</a>
                            </div>

                        </div>
                    </div>

                </div>
            </main>

        </div>
    )
}