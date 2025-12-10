import { useState, useEffect } from 'react'
import { db, auth } from '../../firebase.js' // Added .js extension
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // 1. Auth Guard (Protect the Route)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/admin/login')
      } else {
        setUser(currentUser)
        fetchProducts() // Only fetch if authorized
      }
    })
    return () => unsubscribe()
  }, [navigate])

  // 2. Fetch Logic
  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (err) {
        // Fallback if index missing
        const snapshot = await getDocs(collection(db, 'products'))
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } finally {
      setLoading(false)
    }
  }

  // 3. Delete Logic
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this item? This cannot be undone.")) return;
    
    try {
        await deleteDoc(doc(db, "products", id));
        // Optimistic UI update (remove from list immediately)
        setProducts(products.filter(p => p.id !== id));
    } catch (err) {
        alert("Error deleting product");
        console.error(err);
    }
  }

  if (loading) return <div className="min-h-screen bg-surf-black text-white flex items-center justify-center">Loading Mission Control...</div>

  return (
    <div className="min-h-screen bg-surf-black text-white font-body bg-noise">
      
      {/* Top Bar */}
      <div className="border-b border-white/10 bg-surf-card px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-white"><i className="ph ph-house"></i></Link>
            <span className="text-white/20">/</span>
            <h1 className="font-display text-xl uppercase tracking-wide">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 uppercase tracking-widest hidden md:block">{user?.email}</span>
            <button 
                onClick={() => auth.signOut()}
                className="text-xs font-bold text-red-500 border border-red-500/20 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-colors"
            >
                LOGOUT
            </button>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
                <h2 className="font-display text-4xl uppercase mb-1">Inventory</h2>
                <p className="text-gray-400 text-sm">Manage your fleet and stash.</p>
            </div>
            <Link to="/admin/products/new" className="bg-surf-accent text-black px-6 py-3 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2">
                <i className="ph-bold ph-plus"></i> Add Product
            </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surf-card border border-white/5 p-4 rounded-xl">
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Total Items</span>
                <p className="font-display text-3xl text-white">{products.length}</p>
            </div>
            <div className="bg-surf-card border border-white/5 p-4 rounded-xl">
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Low Stock</span>
                <p className="font-display text-3xl text-yellow-500">{products.filter(p => p.stock < 5).length}</p>
            </div>
             <div className="bg-surf-card border border-white/5 p-4 rounded-xl">
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Value</span>
                <p className="font-display text-3xl text-surf-accent">
                    ${products.reduce((acc, curr) => acc + (curr.price || 0), 0).toLocaleString()}
                </p>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-surf-card border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 font-mono text-xs uppercase tracking-widest">
                        <tr>
                            <th className="p-4">Product</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                            {product.image ? (
                                                <img src={product.image} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600"><i className="ph-fill ph-image"></i></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-surf-accent transition-colors">{product.name}</p>
                                            <p className="text-xs text-gray-500 font-mono truncate max-w-[150px]">{product.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300">
                                    <span className="inline-block px-2 py-1 bg-white/5 rounded text-xs border border-white/10">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="p-4 font-mono">
                                    ${product.price}
                                    {product.memberPrice && <span className="block text-[10px] text-surf-accent">Member: ${product.memberPrice}</span>}
                                </td>
                                <td className="p-4">
                                    {product.stock > 0 ? (
                                        <span className="text-green-400 font-mono">{product.stock} in stock</span>
                                    ) : (
                                        <span className="text-red-500 font-bold uppercase text-xs">Out of Stock</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 hover:bg-white text-gray-400 hover:text-black rounded transition-colors" title="Edit">
                                            <i className="ph-bold ph-pencil-simple"></i>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 hover:bg-red-500 text-gray-400 hover:text-white rounded transition-colors" 
                                            title="Delete"
                                        >
                                            <i className="ph-bold ph-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {products.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                    No products found. Add one to get started.
                </div>
            )}
        </div>

      </main>
    </div>
  )
}