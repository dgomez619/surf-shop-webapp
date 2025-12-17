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
  const [selectedOrders, setSelectedOrders] = useState([])
  const [selectedBookings, setSelectedBookings] = useState([])
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

      const bookingQ = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
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

  // Batch delete selected orders
  const handleBatchDeleteOrders = async () => {
      if (selectedOrders.length === 0) return;
      if (!window.confirm(`Delete ${selectedOrders.length} selected order(s)? This cannot be undone.`)) return;
      
      try {
          await Promise.all(selectedOrders.map(id => deleteDoc(doc(db, 'orders', id))));
          setOrders(prev => prev.filter(o => !selectedOrders.includes(o.id)));
          setSelectedOrders([]);
      } catch (err) {
          alert("Error deleting orders");
      }
  }

  // Batch delete selected bookings
  const handleBatchDeleteBookings = async () => {
      if (selectedBookings.length === 0) return;
      if (!window.confirm(`Delete ${selectedBookings.length} selected booking(s)? Items will become available for these dates.`)) return;
      
      try {
          await Promise.all(selectedBookings.map(id => deleteDoc(doc(db, 'bookings', id))));
          setBookings(prev => prev.filter(b => !selectedBookings.includes(b.id)));
          setSelectedBookings([]);
      } catch (err) {
          alert("Error deleting bookings");
      }
  }

  // Toggle selection
  const toggleOrderSelection = (orderId) => {
      setSelectedOrders(prev => 
          prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
      )
  }

  const toggleBookingSelection = (bookingId) => {
      setSelectedBookings(prev => 
          prev.includes(bookingId) ? prev.filter(id => id !== bookingId) : [...prev, bookingId]
      )
  }

  // Select all toggle
  const toggleSelectAllOrders = () => {
      if (selectedOrders.length === orders.length) {
          setSelectedOrders([])
      } else {
          setSelectedOrders(orders.map(o => o.id))
      }
  }

  const toggleSelectAllBookings = () => {
      if (selectedBookings.length === bookings.length) {
          setSelectedBookings([])
      } else {
          setSelectedBookings(bookings.map(b => b.id))
      }
  }

  const formatDate = (val) => {
      if (!val) return 'N/A'
      
      let date;
      if (val.seconds) {
          // Firestore Timestamp
          date = new Date(val.seconds * 1000)
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      } else if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Date string in YYYY-MM-DD format (rental dates) - parse as local date
          const [year, month, day] = val.split('-').map(Number)
          date = new Date(year, month - 1, day)
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      } else {
          // Fallback for other formats
          date = new Date(val)
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      }
  }

  const getOrderType = (items) => {
      if (!items || items.length === 0) return 'unknown'
      const hasShop = items.some(i => i.type === 'shop')
      const hasRental = items.some(i => i.type === 'rental')
      
      if (hasShop && hasRental) return 'Rental + Shop'
      if (hasRental) return 'rental'
      return 'shop'
  }

  // Calculate Daily and Weekly Revenue
  const calculateRevenue = () => {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // Get the most recent Monday (start of week)
      const weekStart = new Date(todayStart)
      const dayOfWeek = weekStart.getDay() // 0 = Sunday, 1 = Monday, etc.
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // If Sunday, go back 6 days, else go back to Monday
      weekStart.setDate(weekStart.getDate() - daysToMonday)
      
      let dailyRevenue = 0
      let weeklyRevenue = 0
      
      orders.forEach(order => {
          if (!order.createdAt || !order.total) return
          
          const orderDate = order.createdAt.seconds 
              ? new Date(order.createdAt.seconds * 1000)
              : new Date(order.createdAt)
          
          // Check if order is from today
          if (orderDate >= todayStart) {
              dailyRevenue += order.total
          }
          
          // Check if order is from this week (Monday onwards)
          if (orderDate >= weekStart) {
              weeklyRevenue += order.total
          }
      })
      
      return { dailyRevenue, weeklyRevenue }
  }

  const { dailyRevenue, weeklyRevenue } = calculateRevenue()

  if (loading) return <div className="min-h-screen bg-surf-black text-white flex items-center justify-center">Loading Ledger...</div>

  return (
    <div className="min-h-screen bg-surf-black text-white font-body bg-noise w-full">
      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
      
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h2 className="font-display text-4xl uppercase mb-1">Operations</h2>
            <p className="text-gray-400 text-sm">Manage orders and rental bookings.</p>
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

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surf-card border border-white/5 p-4 rounded-xl">
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Total Orders</span>
            <p className="font-display text-3xl text-white">{orders.length}</p>
          </div>
          <div className="bg-surf-card border border-white/5 p-4 rounded-xl">
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Active Bookings</span>
            <p className="font-display text-3xl text-blue-400">{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
          <div className="bg-surf-card border border-white/5 p-4 rounded-xl">
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Today's Revenue</span>
            <p className="font-display text-3xl text-surf-accent">
              ${dailyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-surf-card border border-white/5 p-4 rounded-xl">
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">This Week</span>
            <p className="font-display text-3xl text-blue-400">
              ${weeklyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        {/* --- VIEW 1: ORDERS TABLE (Financials) --- */}
        {activeTab === 'orders' && (
            <div className="bg-surf-card border border-white/5 rounded-xl overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Recent Transactions</h3>
                        {selectedOrders.length > 0 && (
                            <button
                                onClick={handleBatchDeleteOrders}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2"
                            >
                                <i className="ph-bold ph-trash"></i>
                                Delete {selectedOrders.length} Selected
                            </button>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                            <tr>
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.length === orders.length && orders.length > 0}
                                        onChange={toggleSelectAllOrders}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 cursor-pointer"
                                    />
                                </th>
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
                                        className={`hover:bg-white/5 transition-colors ${expandedOrderId === order.id ? 'bg-white/5' : ''} ${selectedOrders.includes(order.id) ? 'bg-surf-accent/5' : ''}`}
                                    >
                                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => toggleOrderSelection(order.id)}
                                                className="w-4 h-4 rounded border-gray-600 bg-gray-700 cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-4 cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                            <div className="font-mono text-white">{formatDate(order.createdAt)}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">#{order.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="p-4 cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                            <div className="font-bold">{order.customer?.name}</div>
                                            <div className="text-xs text-gray-500">{order.customer?.email}</div>
                                        </td>
                                        
                                        <td className="p-4 cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                                                orderType === 'shop' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' :
                                                orderType === 'rental' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                            }`}>
                                                {orderType}
                                            </span>
                                        </td>

                                        <td className="p-4 cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-black/30 border border-white/10 text-xs">
                                                <i className="ph-bold ph-bag"></i> {order.items?.length || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-surf-accent cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                            ${order.total?.toFixed(2)}
                                        </td>
                                        <td className="p-4 cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                                                order.status === 'paid' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                order.status === 'shipped' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                order.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                            <i className={`ph-bold ph-caret-down transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`}></i>
                                        </td>
                                    </tr>

                                    {/* Expanded Detail View */}
                                    {expandedOrderId === order.id && (
                                        <tr className="bg-black/20 border-b border-white/5">
                                            <td colSpan="8" className="p-6">
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
                                                            <div className="text-sm text-gray-300 bg-black/20 p-3 rounded border border-white/5">
                                                                <p>{order.customer?.name}</p>
                                                                <p>{order.customer?.address}</p>
                                                                <p>{order.customer?.city}, {order.customer?.zip}</p>
                                                                <p className="text-xs text-gray-400 mt-2">{order.customer?.email}</p>
                                                            </div>
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
                    <div className="flex items-center gap-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Rental Schedule</h3>
                        {selectedBookings.length > 0 && (
                            <button
                                onClick={handleBatchDeleteBookings}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2"
                            >
                                <i className="ph-bold ph-trash"></i>
                                Delete {selectedBookings.length} Selected
                            </button>
                        )}
                    </div>
                    <span className="text-xs font-mono text-blue-400">
                        {bookings.filter(b => b.status === 'confirmed').length} Active Reservations
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                            <tr>
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedBookings.length === bookings.length && bookings.length > 0}
                                        onChange={toggleSelectAllBookings}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 cursor-pointer"
                                    />
                                </th>
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
                                <tr key={booking.id} className={`hover:bg-white/5 transition-colors ${selectedBookings.includes(booking.id) ? 'bg-surf-accent/5' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedBookings.includes(booking.id)}
                                            onChange={() => toggleBookingSelection(booking.id)}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 cursor-pointer"
                                        />
                                    </td>
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