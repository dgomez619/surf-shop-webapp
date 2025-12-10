import { useState, useEffect } from 'react'
import { db, auth } from '../../firebase'
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'

export default function ProductForm() {
  const { id } = useParams() // If ID exists, we are in EDIT mode
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Men',
    subCategory: 'Apparel',
    price: '',
    memberPrice: '',
    stock: 10,
    image: '', // URL String
    description: '',
    badge: '',
    type: 'apparel', // 'apparel', 'board', 'accessory'
    // Specs (Only for boards)
    specs: {
        length: '',
        vol: '',
        fin: ''
    }
  })

  // Auth & Fetch Data Guard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/admin/login')
        return
      }

      // If ID is present, fetch product data to populate form (Edit Mode)
      if (id) {
        setLoading(true)
        const docRef = doc(db, 'products', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const data = docSnap.data()
            // Merge defaults in case old data is missing fields
            setFormData(prev => ({ ...prev, ...data })) 
        }
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSpecChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
        ...prev, 
        specs: { ...prev.specs, [name]: value }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Clean up data types before sending
    const payload = {
        ...formData,
        price: Number(formData.price),
        memberPrice: formData.memberPrice ? Number(formData.memberPrice) : null,
        stock: Number(formData.stock),
        updatedAt: serverTimestamp()
    }

    try {
        if (id) {
            // Update existing
            await updateDoc(doc(db, 'products', id), payload)
        } else {
            // Create new
            payload.createdAt = serverTimestamp()
            await addDoc(collection(db, 'products'), payload)
        }
        navigate('/admin/dashboard')
    } catch (err) {
        console.error(err)
        alert("Error saving product")
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
                    <h1 className="font-display text-3xl uppercase">{id ? 'Edit Product' : 'New Product'}</h1>
                    <p className="text-gray-400 text-sm">Fill in the details below.</p>
                </div>
                <Link to="/admin/dashboard" className="text-sm text-gray-500 hover:text-white">Cancel</Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Basic Info */}
                <div className="bg-surf-card p-6 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-surf-accent font-bold uppercase text-xs tracking-widest mb-4">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Product Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" placeholder="e.g. Dawn Patrol Hoodie" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Badge (Optional)</label>
                            <input name="badge" value={formData.badge} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" placeholder="e.g. New Drop" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" placeholder="Product details..."></textarea>
                    </div>
                </div>

                {/* 2. Categorization & Pricing */}
                <div className="bg-surf-card p-6 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-surf-accent font-bold uppercase text-xs tracking-widest mb-4">Details</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none">
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Groms">Groms</option>
                                <option value="Surfboards">Surfboards</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Home">Home</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none">
                                <option value="apparel">Apparel</option>
                                <option value="board">Surfboard</option>
                                <option value="accessory">Accessory</option>
                            </select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Stock</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Price ($)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Member Price ($)</label>
                            <input type="number" name="memberPrice" value={formData.memberPrice} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" placeholder="Optional" />
                        </div>
                    </div>
                </div>

                {/* 3. Media */}
                <div className="bg-surf-card p-6 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-surf-accent font-bold uppercase text-xs tracking-widest mb-4">Media</h3>
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500">Image URL</label>
                        <input name="image" value={formData.image} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" placeholder="https://..." />
                        {formData.image && (
                            <div className="mt-2 w-32 h-32 rounded overflow-hidden border border-white/10">
                                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Board Specs (Conditional) */}
                {formData.type === 'board' && (
                    <div className="bg-surf-card p-6 rounded-xl border border-blue-500/30 space-y-4">
                        <h3 className="text-blue-400 font-bold uppercase text-xs tracking-widest mb-4">Surfboard Specs</h3>
                        <div className="grid grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Length</label>
                                <input name="length" value={formData.specs?.length || ''} onChange={handleSpecChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-blue-500 outline-none" placeholder="5'10" />
                            </div>
                             <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Volume</label>
                                <input name="vol" value={formData.specs?.vol || ''} onChange={handleSpecChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-blue-500 outline-none" placeholder="29.5L" />
                            </div>
                             <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Fin System</label>
                                <input name="fin" value={formData.specs?.fin || ''} onChange={handleSpecChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-blue-500 outline-none" placeholder="Futures/FCS" />
                            </div>
                        </div>
                    </div>
                )}

                <button 
                    disabled={loading}
                    className="w-full bg-surf-accent text-black font-bold uppercase py-4 rounded tracking-widest hover:bg-white transition-colors text-lg"
                >
                    {loading ? 'Saving...' : (id ? 'Update Product' : 'Create Product')}
                </button>

            </form>
        </div>
    </div>
  )
}