import { useState, useEffect } from 'react'
import { db, auth } from '../../firebase' // Reverting to extension-less import to match Rentals.jsx
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'

export default function ShackManager() {
  const [activeTab, setActiveTab] = useState('inbox')
  const [inquiries, setInquiries] = useState([])
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate('/admin/login')
      else {
        setUser(currentUser)
        fetchData()
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const fetchData = async () => {
    setLoading(true)
    try {
        const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'))
        const inquirySnap = await getDocs(q)
        setInquiries(inquirySnap.docs.map(d => ({ id: d.id, ...d.data() })))

        const docRef = doc(db, 'properties', 'main_shack')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) setProperty(docSnap.data())

    } catch (err) {
        console.error("Error fetching admin data:", err)
    } finally {
        setLoading(false)
    }
  }

  // --- ACTIONS ---
  
  const toggleInquiryStatus = async (id, currentStatus) => {
      const newStatus = currentStatus === 'new' ? 'contacted' : 'new'
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
      await updateDoc(doc(db, 'inquiries', id), { status: newStatus })
  }

  // NEW: Delete Inquiry
  const handleDeleteInquiry = async (id) => {
      if (!window.confirm("Delete this lead permanently?")) return;
      
      try {
          await deleteDoc(doc(db, 'inquiries', id));
          setInquiries(prev => prev.filter(i => i.id !== id));
      } catch (err) {
          console.error(err);
          alert("Error deleting inquiry.");
      }
  }

  const handleSaveProperty = async (e) => {
      e.preventDefault()
      try {
          await updateDoc(doc(db, 'properties', 'main_shack'), {
              ...property,
              updatedAt: serverTimestamp()
          })
          alert("Listing updated successfully!")
      } catch (err) {
          alert("Error saving property.")
      }
  }

  const handlePropChange = (e) => {
      const { name, value } = e.target
      setProperty(prev => ({ ...prev, [name]: value }))
  }

  if (loading) return <div className="min-h-screen bg-surf-black text-white flex items-center justify-center">Loading Shack HQ...</div>

  return (
    <div className="min-h-screen bg-surf-black text-white font-body bg-noise">
      
      {/* Header */}
      <div className="border-b border-white/10 bg-surf-card px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
            <h1 className="font-display text-xl uppercase tracking-wide">The Shack Manager</h1>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('inbox')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'inbox' ? 'bg-surf-accent text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
                Guest Inbox
            </button>
            <button 
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-surf-accent text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
                Edit Listing
            </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 md:p-8">

        {/* --- TAB 1: INBOX --- */}
        {activeTab === 'inbox' && (
            <div className="space-y-4">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">Booking Requests</h2>
                        <p className="text-gray-400 text-sm">Leads from the website form.</p>
                    </div>
                    <span className="bg-surf-card border border-white/10 px-3 py-1 rounded text-xs font-mono text-surf-accent">
                        {inquiries.filter(i => i.status === 'new').length} New Pending
                    </span>
                </div>

                <div className="grid gap-4">
                    {inquiries.map(inq => (
                        <div key={inq.id} className={`bg-surf-card border p-6 rounded-xl transition-all ${inq.status === 'new' ? 'border-surf-accent/50 shadow-[0_0_20px_rgba(196,249,52,0.1)]' : 'border-white/5 opacity-75'}`}>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-white">
                                        {/* Display Name if available, fallback to Guest Count */}
                                        {inq.guestName || `${inq.guests} Guests`} 
                                        <span className="text-gray-500 font-normal mx-2">•</span> 
                                        <span className="text-sm font-mono text-surf-accent uppercase">{inq.contactMethod}: {inq.contactValue}</span>
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 font-mono">
                                        <span>{inq.checkIn}</span>
                                        <i className="ph-bold ph-arrow-right"></i>
                                        <span>{inq.checkOut}</span>
                                        <span className="text-gray-600">|</span>
                                        <span>{inq.guests} Guests</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => toggleInquiryStatus(inq.id, inq.status)}
                                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest border transition-colors ${inq.status === 'new' ? 'bg-surf-accent text-black border-surf-accent hover:bg-white' : 'bg-transparent text-gray-500 border-white/10 hover:border-white hover:text-white'}`}
                                    >
                                        {inq.status === 'new' ? 'Mark Contacted' : 'Contacted ✓'}
                                    </button>
                                    
                                    {/* DELETE BUTTON */}
                                    <button 
                                        onClick={() => handleDeleteInquiry(inq.id)}
                                        className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                        title="Delete Lead"
                                    >
                                        <i className="ph-bold ph-trash text-lg"></i>
                                    </button>
                                </div>
                            </div>
                            
                            {inq.message && (
                                <div className="bg-black/30 p-4 rounded border border-white/5 mt-4">
                                    <p className="text-gray-300 text-sm italic">"{inq.message}"</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {inquiries.length === 0 && (
                        <div className="text-center py-20 text-gray-500 bg-surf-card rounded-xl border border-white/5 border-dashed">
                            No inquiries yet.
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- TAB 2: EDITOR --- */}
        {activeTab === 'editor' && property && (
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold">Property Details</h2>
                    <p className="text-gray-400 text-sm">Update pricing and content instantly.</p>
                </div>

                <form onSubmit={handleSaveProperty} className="space-y-6">
                    
                    <div className="bg-surf-card p-6 rounded-xl border border-white/5 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Property Name</label>
                            <input name="name" value={property.name} onChange={handlePropChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Tagline</label>
                            <input name="tagline" value={property.tagline} onChange={handlePropChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Nightly Rate ($)</label>
                                <input type="number" name="price" value={property.price} onChange={handlePropChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Max Guests</label>
                                <input type="number" name="maxGuests" value={property.maxGuests} onChange={handlePropChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Description</label>
                            <textarea name="description" value={property.description} onChange={handlePropChange} rows="5" className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none"></textarea>
                        </div>
                    </div>

                    <div className="bg-surf-card p-6 rounded-xl border border-white/5 space-y-4">
                        <h3 className="text-surf-accent font-bold uppercase text-xs tracking-widest mb-2">Images</h3>
                        <p className="text-xs text-gray-500 mb-4">Paste URLs directly. Order: Main, Interior, Patio, Beach.</p>
                        
                        {property.images?.map((img, idx) => (
                            <div key={idx} className="flex gap-4 items-center">
                                <div className="w-16 h-10 bg-gray-800 rounded overflow-hidden shrink-0">
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </div>
                                <input 
                                    value={img} 
                                    onChange={(e) => {
                                        const newImages = [...property.images]
                                        newImages[idx] = e.target.value
                                        setProperty({...property, images: newImages})
                                    }}
                                    className="flex-1 bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-surf-accent outline-none font-mono"
                                />
                            </div>
                        ))}
                    </div>

                    <button className="w-full bg-surf-accent text-black font-bold uppercase py-4 rounded tracking-widest hover:bg-white transition-colors cursor-pointer">
                        Save Changes
                    </button>

                </form>
            </div>
        )}

      </main>
    </div>
  )
}