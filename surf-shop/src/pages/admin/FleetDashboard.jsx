import { useState, useEffect } from 'react'
import { db } from '../../firebase.js' // Added .js extension to resolve path
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { Link } from 'react-router-dom'

export default function FleetDashboard() {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch rentals on mount
  useEffect(() => {
    fetchRentals()
  }, [])

  // 2. Fetch Logic
  const fetchRentals = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'rentals'))
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setRentals(items)
    } catch (err) {
      console.error("Error fetching fleet:", err)
    } finally {
      setLoading(false)
    }
  }

  // 3. Status Toggle Logic (Active -> Repair -> Retired -> Active)
  const handleStatusToggle = async (item) => {
    const statusCycle = {
        'active': 'repair',
        'repair': 'retired',
        'retired': 'active'
    }
    const newStatus = statusCycle[item.status] || 'active'
    
    // Optimistic UI Update (Update state immediately for speed)
    setRentals(prev => prev.map(r => r.id === item.id ? { ...r, status: newStatus } : r))

    try {
        await updateDoc(doc(db, "rentals", item.id), { status: newStatus })
    } catch (err) {
        console.error("Failed to update status", err)
        alert("Sync error. Refreshing...")
        fetchRentals() // Revert on error
    }
  }

  // 4. Delete Logic
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this asset from the fleet?")) return;
    try {
        await deleteDoc(doc(db, "rentals", id));
        setRentals(prev => prev.filter(r => r.id !== id));
    } catch (err) {
        console.error("Error deleting asset:", err);
        alert("Error deleting asset");
    }
  }

  // Helper for Status Badge Color
  const getStatusColor = (status) => {
      switch(status) {
          case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
          case 'repair': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
          case 'retired': return 'bg-red-500/20 text-red-400 border-red-500/30';
          default: return 'bg-gray-500/20 text-gray-400';
      }
  }

  if (loading) return <div className="min-h-screen bg-surf-black text-white flex items-center justify-center">Loading Fleet...</div>

  return (
    <div className="min-h-screen bg-surf-black text-white font-body bg-noise">
      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
                <h2 className="font-display text-4xl uppercase mb-1">Rental Fleet</h2>
                <p className="text-gray-400 text-sm">Manage assets, track repairs, and set rates.</p>
            </div>
            <Link to="/admin/fleet/new" className="bg-surf-accent text-black px-6 py-3 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2">
                <i className="ph-bold ph-plus"></i> Add Asset
            </Link>
        </div>

        {/* Fleet Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surf-card border border-white/5 p-4 rounded-xl">
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Total Assets</span>
                <p className="font-display text-3xl text-white">{rentals.length}</p>
            </div>
            <div className="bg-surf-card border border-white/5 p-4 rounded-xl">
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">In Repair</span>
                <p className="font-display text-3xl text-yellow-500">{rentals.filter(r => r.status === 'repair').length}</p>
            </div>
            <div className="bg-surf-card border border-white/5 p-4 rounded-xl">
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Demo Quiver</span>
                <p className="font-display text-3xl text-blue-400">{rentals.filter(r => r.isDemoQuiver).length}</p>
            </div>
        </div>

        {/* Assets Table */}
        <div className="bg-surf-card border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 font-mono text-xs uppercase tracking-widest">
                        <tr>
                            <th className="p-4">Asset Info</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Rates (Day / Mem)</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rentals.map((item) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden shrink-0 border border-white/10">
                                            {item.image ? (
                                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600"><i className="ph-fill ph-wave-sine"></i></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-surf-accent transition-colors">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.make}</p>
                                            {item.isDemoQuiver && <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Demo Quiver</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300">
                                    <span className="inline-block px-2 py-1 bg-white/5 rounded text-xs border border-white/10">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-4 font-mono">
                                    <div className="flex flex-col">
                                        <span>${item.rates?.daily} <span className="text-gray-600 text-[10px]">/day</span></span>
                                        <span className="text-surf-accent text-xs">${item.rates?.member} <span className="text-surf-accent/50 text-[10px]">/mem</span></span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {/* CLICKABLE STATUS TOGGLE */}
                                    <button 
                                        onClick={() => handleStatusToggle(item)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all hover:scale-105 ${getStatusColor(item.status)}`}
                                        title="Click to cycle status"
                                    >
                                        {item.status || 'Active'}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link 
                                            to={`/admin/fleet/${item.id}/edit`} 
                                            className="p-2 hover:bg-white text-gray-400 hover:text-black rounded transition-colors" 
                                            title="Edit"
                                        >
                                            <i className="ph-bold ph-pencil-simple"></i>
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
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
            {rentals.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                    No rental assets found.
                </div>
            )}
        </div>

      </main>
    </div>
  )
}