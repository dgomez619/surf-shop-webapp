import { useState, useEffect } from 'react'
import { db, auth } from '../../firebase.js' 
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'

export default function OrderManager() {
  const [activeTab, setActiveTab] = useState('orders') // 'orders' or 'bookings'
  const [orders, setOrders] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate('/admin/login')
      else {
        setUser(currentUser)
        fetchAllData()
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const orderQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const orderSnap = await getDocs(orderQ)
      setOrders(orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))

      const bookingQ = query(collection(db, 'bookings'), orderBy('dateRange.start', 'asc'))
      const bookingSnap = await getDocs(bookingQ)
      setBookings(bookingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))

    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  // --- ACTIONS ---
  const handleOrderStatus = async (orderId, newStatus) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus })
  }

  const handleBookingStatus = async (bookingId, newStatus) => {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
      await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus })
  }

  // NEW: Delete Order (Does NOT affect stock)
  const handleDeleteOrder = async (orderId) => {
      if (!window.confirm("Delete this financial record? (This will NOT affect shop inventory)")) return;
      try {
          await deleteDoc(doc(db, 'orders', orderId));
          setOrders(prev => prev.filter(o => o.id !== orderId));
      } catch (err) {
          alert("Error deleting order");
      }
  }

  // NEW: Delete Booking (Frees up availability)
  const handleDeleteBooking = async (bookingId) => {
      if (!window.confirm("Delete this booking? This will make the item available again for these dates.")) return;
      try {
          await deleteDoc(doc(db, 'bookings', bookingId));
          setBookings(prev => prev.filter(b => b.id !== bookingId));
      } catch (err) {
          alert("Error deleting booking");
      }
  }

  const formatDate = (val) => {
      if (!val) return 'N/A'
      const date = val.seconds ? new Date(val.seconds * 1000) : new Date(val)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getOrderType = (items) => {
      if (!items || items.length === 0) return 'unknown'
      const hasShop = items.some(i => i.type === 'shop')
      const hasRental = items.some(i => i.type === 'rental')
      
      if (hasShop && hasRental) return 'Rental + Shop'
      if (hasRental) return 'rental'
      return 'shop'
  }

  if (loading) return <div className="min-h-screen bg-surf-black text-white flex items-center justify-center">Loading Ledger...</div>

  return (
    <div className="min-h-screen bg-surf-black text-white font-body bg-noise">
      
      {/* Header */}
      <div className="border-b border-white/10 bg-surf-card px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-gray-400 hover:text-white"><i className="ph ph-arrow-left"></i></Link>
            <h1 className="font-display text-xl uppercase tracking-wide">Operations</h1>
        </div>
        
        {/* VIEW TOGGLE */}
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
            <button 
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-surf-accent text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
                <i className="ph-bold ph-receipt"></i> Orders
            </button>
            <button 
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'bookings' ? 'bg-surf-accent text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
                <i className="ph-bold ph-calendar-check"></i> Bookings
            </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* --- VIEW 1: ORDERS TABLE (Financials) --- */}
        {activeTab === 'orders' && (
            <div className="bg-surf-card border border-white/5 rounded-xl overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Recent Transactions</h3>
                    <span className="text-xs font-mono text-surf-accent">
                        Total Revenue: ${orders.reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString()}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                            <tr>
                                <th className="p-4">Date / ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.map((order) => {
                                const orderType = getOrderType(order.items)
                                
                                return (
                                <>
                                    <tr 
                                        key={order.id} 
                                        className={`hover:bg-white/5 transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-white/5' : ''}`}
                                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                    >
                                        <td className="p-4">
                                            <div className="font-mono text-white">{formatDate(order.createdAt)}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">#{order.id.slice(0, 6)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold">{order.customer?.name}</div>
                                            <div className="text-xs text-gray-500">{order.customer?.email}</div>
                                        </td>
                                        
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                                                orderType === 'shop' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' :
                                                orderType === 'rental' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                            }`}>
                                                {orderType}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-black/30 border border-white/10 text-xs">
                                                <i className="ph-bold ph-bag"></i> {order.items?.length || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-surf-accent">
                                            ${order.total?.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                                                order.status === 'paid' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                order.status === 'shipped' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                order.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <i className={`ph-bold ph-caret-down transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`}></i>
                                        </td>
                                    </tr>

                                    {/* Expanded Detail View */}
                                    {expandedOrderId === order.id && (
                                        <tr className="bg-black/20 border-b border-white/5">
                                            <td colSpan="7" className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    
                                                    {/* Left: Item List */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Order Contents</h4>
                                                            <span className="text-xs font-mono text-gray-400">Placed: {formatDate(order.createdAt)}</span>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {order.items?.map((item, idx) => (
                                                                <div key={idx} className="flex gap-4 items-center bg-surf-card border border-white/5 p-3 rounded-lg">
                                                                    <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-bold text-sm text-white">{item.name}</p>
                                                                        {item.type === 'rental' ? (
                                                                            <p className="text-xs text-surf-accent font-mono">
                                                                                {item.dateRange.start} <i className="ph-bold ph-arrow-right mx-1"></i> {item.dateRange.end}
                                                                            </p>
                                                                        ) : (
                                                                            <p className="text-xs text-gray-400">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-mono text-sm">${item.price}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Right: Fulfillment & Info */}
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Shipping Address</h4>
                                                            <p className="text-sm text-gray-300 bg-black/20 p-3 rounded border border-white/5 font-mono">
                                                                {order.customer?.address}<br/>
                                                                {order.customer?.city}, {order.customer?.zip}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Fulfillment Actions</h4>
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => handleOrderStatus(order.id, 'shipped')}
                                                                    disabled={order.status === 'shipped'}
                                                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold uppercase transition-colors disabled:opacity-50"
                                                                >
                                                                    Mark Shipped
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleOrderStatus(order.id, 'completed')}
                                                                    disabled={order.status === 'completed'}
                                                                    className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded text-xs font-bold uppercase transition-colors disabled:opacity-50"
                                                                >
                                                                    Complete Order
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteOrder(order.id)}
                                                                    className="px-3 py-3 text-gray-500 hover:text-red-500 border border-white/5 hover:border-red-500/30 bg-white/5 rounded transition-colors"
                                                                    title="Delete Order"
                                                                >
                                                                    <i className="ph-bold ph-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- VIEW 2: BOOKINGS TABLE (Calendar/Operations) --- */}
        {activeTab === 'bookings' && (
            <div className="bg-surf-card border border-white/5 rounded-xl overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Rental Schedule</h3>
                    <span className="text-xs font-mono text-blue-400">
                        {bookings.filter(b => b.status === 'confirmed').length} Active Reservations
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                            <tr>
                                <th className="p-4">Pickup Date</th>
                                <th className="p-4">Return Date</th>
                                <th className="p-4">Asset</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-white border-l-4 border-l-transparent hover:border-l-surf-accent">
                                        {formatDate(booking.dateRange?.start)}
                                    </td>
                                    <td className="p-4 font-mono text-gray-400">
                                        {formatDate(booking.dateRange?.end)}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-white">{booking.itemName}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">ID: {booking.rentalId}</div>
                                    </td>
                                    <td className="p-4">{booking.customerName}</td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                                            booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                            booking.status === 'returned' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {/* Mark Returned Logic */}
                                            {booking.status === 'confirmed' && (
                                                <button 
                                                    onClick={() => handleBookingStatus(booking.id, 'returned')}
                                                    className="px-3 py-1 bg-white/10 hover:bg-green-500 hover:text-black rounded text-[10px] font-bold uppercase transition-colors"
                                                >
                                                    Mark Returned
                                                </button>
                                            )}
                                            {/* Undo Logic */}
                                            {booking.status === 'returned' && (
                                                <button 
                                                    onClick={() => handleBookingStatus(booking.id, 'confirmed')}
                                                    className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500 hover:text-black text-yellow-500 border border-yellow-500/30 rounded text-[10px] font-bold uppercase transition-colors"
                                                >
                                                    Undo Return
                                                </button>
                                            )}
                                            {/* Delete Booking */}
                                            <button 
                                                onClick={() => handleDeleteBooking(booking.id)}
                                                className="p-1 text-gray-600 hover:text-red-500 transition-colors"
                                                title="Delete Booking"
                                            >
                                                <i className="ph-bold ph-trash text-lg"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {bookings.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            No active bookings found.
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  )
}