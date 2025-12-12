import { useState, useEffect } from 'react'
import { db, auth } from '../../firebase.js' // Added .js extension to fix resolution
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'

export default function RentalForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  // Initial State matches your Schema
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    category: 'Shortboard',
    image: '',
    stock: 1,
    status: 'active', // active, repair, retired
    isDemoQuiver: false,
    // Nested Objects
    rates: {
        daily: 45,
        member: 25
    },
    specs: {
        length: '',
        vol: '',
        fin: ''
    }
  })

  // Auth & Fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/admin/login')
        return
      }
      if (id) {
        setLoading(true)
        const docRef = doc(db, 'rentals', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            // Merge to ensure nested objects exist
            const data = docSnap.data()
            setFormData(prev => ({
                ...prev,
                ...data,
                rates: { ...prev.rates, ...data.rates },
                specs: { ...prev.specs, ...data.specs }
            })) 
        }
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [id, navigate])

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  // Specialized Handler for Rates & Specs
  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
        ...prev,
        [parent]: {
            ...prev[parent],
            [field]: value
        }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Ensure numbers are numbers
    const payload = {
        ...formData,
        stock: Number(formData.stock),
        rates: {
            daily: Number(formData.rates.daily),
            member: Number(formData.rates.member)
        },
        updatedAt: serverTimestamp()
    }

    try {
        if (id) {
            await updateDoc(doc(db, 'rentals', id), payload)
        } else {
            payload.createdAt = serverTimestamp()
            await addDoc(collection(db, 'rentals'), payload)
        }
        navigate('/admin/fleet')
    } catch (err) {
        console.error(err)
        alert("Error saving asset")
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surf-black text-white font-body bg-noise p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div>
                    <h1 className="font-display text-3xl uppercase">{id ? 'Edit Asset' : 'Add to Fleet'}</h1>
                    <p className="text-gray-400 text-sm">Hardware details and pricing.</p>
                </div>
                <Link to="/admin/fleet" className="text-sm text-gray-500 hover:text-white">Cancel</Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Identification */}
                <div className="bg-surf-card p-6 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-surf-accent font-bold uppercase text-xs tracking-widest mb-4">Identity</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Model Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" placeholder="e.g. Seaside" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Shaper / Make</label>
                            <input name="make" value={formData.make} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" placeholder="e.g. Firewire" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none">
                                <option value="Shortboard">Shortboard</option>
                                <option value="Midlength">Midlength</option>
                                <option value="Longboard">Longboard</option>
                                <option value="Foamie">Foamie</option>
                                <option value="Fins">Fins</option>
                                <option value="Wetsuit">Wetsuit</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Stock Qty</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none">
                                <option value="active">Active</option>
                                <option value="repair">In Repair</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Specs (The "Digital Quiver" Data) */}
                <div className="bg-surf-card p-6 rounded-xl border border-blue-500/30 space-y-4">
                    <h3 className="text-blue-400 font-bold uppercase text-xs tracking-widest mb-4">Tech Specs</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Length</label>
                            <input 
                                value={formData.specs.length} 
                                onChange={(e) => handleNestedChange('specs', 'length', e.target.value)} 
                                className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-blue-500 outline-none" 
                                placeholder="5'6" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Volume</label>
                            <input 
                                value={formData.specs.vol} 
                                onChange={(e) => handleNestedChange('specs', 'vol', e.target.value)} 
                                className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-blue-500 outline-none" 
                                placeholder="32.5L" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Fin System</label>
                            <input 
                                value={formData.specs.fin} 
                                onChange={(e) => handleNestedChange('specs', 'fin', e.target.value)} 
                                className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-blue-500 outline-none" 
                                placeholder="Futures" 
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Pricing & Membership */}
                <div className="bg-surf-card p-6 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-surf-accent font-bold uppercase text-xs tracking-widest mb-4">Rates & Society</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Standard ($)</label>
                                <input 
                                    type="number" 
                                    value={formData.rates.daily} 
                                    onChange={(e) => handleNestedChange('rates', 'daily', e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500 text-surf-accent">Member ($)</label>
                                <input 
                                    type="number" 
                                    value={formData.rates.member} 
                                    onChange={(e) => handleNestedChange('rates', 'member', e.target.value)}
                                    className="w-full bg-black/30 border border-surf-accent/30 text-surf-accent rounded p-3 focus:border-surf-accent outline-none" 
                                />
                            </div>
                        </div>

                        {/* Demo Toggle */}
                        <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg border border-white/5">
                            <div>
                                <span className="block font-bold text-sm text-white">Demo Quiver Exclusive</span>
                                <span className="text-xs text-gray-500">Is this board reserved for members?</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="isDemoQuiver" checked={formData.isDemoQuiver} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-surf-accent"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 4. Image */}
                <div className="bg-surf-card p-6 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-surf-accent font-bold uppercase text-xs tracking-widest mb-4">Visuals</h3>
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500">Image URL</label>
                        <input name="image" value={formData.image} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" placeholder="https://..." />
                        {formData.image && (
                            <div className="mt-2 w-32 h-48 rounded overflow-hidden border border-white/10 bg-black">
                                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                            </div>
                        )}
                    </div>
                </div>

                <button 
                    disabled={loading}
                    className="w-full bg-surf-accent text-black font-bold uppercase py-4 rounded tracking-widest hover:bg-white transition-colors text-lg cursor-pointer"
                >
                    {loading ? 'Saving Asset...' : (id ? 'Update Asset' : 'Add Asset to Fleet')}
                </button>

            </form>
        </div>
    </div>
  )
}
