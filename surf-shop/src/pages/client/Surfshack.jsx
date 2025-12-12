import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function SurfShack() {
    const [property, setProperty] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Updated Form State
    const [inquiry, setInquiry] = useState({
        guestName: '',
        contactMethod: 'phone', // 'phone' or 'email'
        contactValue: '',
        checkIn: '',
        checkOut: '',
        guests: 2,
        message: ''
    });

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const docRef = doc(db, 'properties', 'main_shack')
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) setProperty(docSnap.data())
            } catch (err) {
                console.error("Error fetching property:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProperty()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await addDoc(collection(db, 'inquiries'), {
                ...inquiry,
                propertyName: property?.name || 'Surf Shack',
                status: 'new',
                createdAt: serverTimestamp()
            });

            alert(`Thanks ${inquiry.guestName}! We'll reach out via ${inquiry.contactMethod} shortly.`);
            
            // Reset form
            setInquiry({ 
                guestName: '', 
                contactMethod: 'phone', 
                contactValue: '', 
                checkIn: '', 
                checkOut: '', 
                guests: 2, 
                message: '' 
            });
        } catch (err) {
            console.error(err);
            alert("Error sending request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surf-black flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <i className="ph-duotone ph-house-line text-4xl animate-bounce text-surf-accent"></i>
                    <span className="font-mono text-sm tracking-widest uppercase text-gray-500">Opening the Shack...</span>
                </div>
            </div>
        )
    }

    if (!property) return <div className="text-white text-center pt-24">Property data unavailable.</div>

    return (
        <div className="w-full min-h-screen bg-surf-black text-white font-body bg-noise">
            
            {/* 1. HERO SECTION */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <img 
                    src={property.images?.[0]} 
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
                        {property.name}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 font-display uppercase tracking-wide">
                        {property.tagline}
                    </p>
                </div>
            </div>

            {/* 2. MAIN CONTENT */}
            <main className="max-w-[1600px] mx-auto px-4 py-12 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT COLUMN: Details */}
                    <div className="lg:col-span-8 space-y-16">
                        <section>
                            <h2 className="font-display text-4xl uppercase mb-6">The <span className="text-surf-accent">Vibe</span></h2>
                            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">{property.description}</p>
                        </section>

                        <section>
                            <h2 className="font-display text-4xl uppercase mb-6">Loadout</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {property.amenities?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-surf-card border border-white/5 hover:border-surf-accent/30 transition-colors group">
                                        <i className={`ph-fill ${item.icon} text-2xl text-gray-500 group-hover:text-surf-accent transition-colors`}></i>
                                        <span className="font-mono text-sm uppercase tracking-wide">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="font-display text-4xl uppercase mb-6">Visuals</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px]">
                                <div className="md:col-span-1 h-full rounded-2xl overflow-hidden border border-white/5 relative group">
                                    <img src={property.images?.[1]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Interior" />
                                </div>
                                <div className="md:col-span-1 flex flex-col gap-4 h-full">
                                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative group">
                                        <img src={property.images?.[2]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Detail 1" />
                                    </div>
                                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative group">
                                        <img src={property.images?.[3]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Detail 2" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Updated Form */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-24">
                            <div className="bg-surf-card border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-surf-accent via-blue-500 to-purple-500"></div>
                                
                                <div className="mb-6">
                                    <span className="font-mono text-xs text-gray-500 uppercase tracking-widest block mb-1">Nightly Rate</span>
                                    <div className="flex items-end gap-2">
                                        <span className="font-display text-5xl text-white">${property.price}</span>
                                        <span className="text-gray-400 mb-2">/ night</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    
                                    {/* Name Field */}
                                    <div className="space-y-1">
                                        <label className="font-mono text-[10px] uppercase font-bold text-gray-500">Full Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="Your Name"
                                            className="w-full bg-surf-black border border-white/20 rounded-lg p-3 text-sm focus:border-surf-accent focus:outline-none transition-colors"
                                            value={inquiry.guestName}
                                            onChange={(e) => setInquiry({...inquiry, guestName: e.target.value})}
                                        />
                                    </div>

                                    {/* Contact Method Toggle */}
                                    <div className="space-y-1">
                                        <label className="font-mono text-[10px] uppercase font-bold text-gray-500">Preferred Contact</label>
                                        <div className="flex bg-surf-black rounded-lg border border-white/20 p-1">
                                            <button 
                                                type="button"
                                                onClick={() => setInquiry({...inquiry, contactMethod: 'phone'})}
                                                className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-all ${inquiry.contactMethod === 'phone' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                Text
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setInquiry({...inquiry, contactMethod: 'email'})}
                                                className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-all ${inquiry.contactMethod === 'email' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                Email
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dynamic Contact Input */}
                                    <div className="space-y-1">
                                        <input 
                                            type={inquiry.contactMethod === 'email' ? 'email' : 'tel'} 
                                            required
                                            placeholder={inquiry.contactMethod === 'email' ? 'you@email.com' : '(555) 555-5555'}
                                            className="w-full bg-surf-black border border-white/20 rounded-lg p-3 text-sm focus:border-surf-accent focus:outline-none transition-colors"
                                            value={inquiry.contactValue}
                                            onChange={(e) => setInquiry({...inquiry, contactValue: e.target.value})}
                                        />
                                    </div>

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

                                    <div className="space-y-1">
                                        <label className="font-mono text-[10px] uppercase font-bold text-gray-500">Guests</label>
                                        <div className="relative">
                                            <select 
                                                className="w-full bg-surf-black border border-white/20 rounded-lg p-3 text-sm focus:border-surf-accent focus:outline-none appearance-none cursor-pointer"
                                                value={inquiry.guests}
                                                onChange={(e) => setInquiry({...inquiry, guests: e.target.value})}
                                            >
                                                {[...Array(property.maxGuests || 4)].map((_, i) => (
                                                    <option key={i} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                            <i className="ph-bold ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-mono text-[10px] uppercase font-bold text-gray-500">Notes</label>
                                        <textarea 
                                            rows="3"
                                            className="w-full bg-surf-black border border-white/20 rounded-lg p-3 text-sm focus:border-surf-accent focus:outline-none transition-colors resize-none"
                                            placeholder="Questions or requests?"
                                            value={inquiry.message}
                                            onChange={(e) => setInquiry({...inquiry, message: e.target.value})}
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full bg-surf-accent text-black font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-white transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {isSubmitting ? <i className="ph-bold ph-spinner animate-spin text-xl"></i> : 'Request Booking'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}