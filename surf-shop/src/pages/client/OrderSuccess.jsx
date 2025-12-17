import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function OrderSuccess() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId))
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() })
        }
      } catch (err) {
        console.error("Error fetching order:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  const formatDate = (val) => {
    if (!val) return 'N/A'
    const date = val.seconds ? new Date(val.seconds * 1000) : new Date(val)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surf-black text-white flex items-center justify-center bg-noise">
        <div className="flex flex-col items-center gap-4">
          <i className="ph-duotone ph-spinner-gap text-4xl animate-spin text-surf-accent"></i>
          <span className="font-mono text-sm tracking-widest uppercase text-gray-500">Loading order...</span>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-surf-black text-white flex flex-col items-center justify-center gap-4 bg-noise">
        <i className="ph-bold ph-warning text-6xl text-red-500"></i>
        <h2 className="font-display text-3xl uppercase">Order Not Found</h2>
        <Link to="/" className="text-surf-accent hover:underline">Return Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surf-black text-white font-body bg-noise pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-surf-accent rounded-full mb-6 animate-bounce-in">
            <i className="ph-fill ph-check-circle text-4xl text-black"></i>
          </div>
          <h1 className="font-display text-5xl uppercase mb-4">Order Confirmed!</h1>
          <p className="text-gray-400 text-lg">Thanks for your order. We'll send a confirmation email shortly.</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-surf-card border border-white/10 rounded-xl overflow-hidden mb-6">
          <div className="bg-white/5 p-6 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-1">Order Number</h3>
                <p className="font-mono text-xl text-surf-accent">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-1">Order Date</h3>
                <p className="font-mono text-sm">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-1">Status</h3>
                <span className="inline-block px-3 py-1 rounded text-xs font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Shipping Information</h3>
            <div className="text-sm space-y-1">
              <p className="font-bold">{order.customer?.name}</p>
              <p className="text-gray-400">{order.customer?.address}</p>
              <p className="text-gray-400">{order.customer?.city}, {order.customer?.zip}</p>
              <p className="text-surf-accent mt-2">{order.customer?.email}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-16 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{item.category}</p>
                    {item.type === 'rental' ? (
                      <div className="text-xs text-surf-accent mt-1 flex items-center gap-1">
                        <i className="ph-bold ph-calendar"></i>
                        {item.dateRange.start} → {item.dateRange.end}
                        <span className="text-gray-500">({item.days} days)</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 mt-1">
                        Size: {item.selectedSize} • Qty: {item.quantity}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">${item.price.toFixed(2)}</p>
                    {item.type === 'rental' && (
                      <p className="text-xs text-gray-500">× {item.days} days</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Tax ({(order.taxRate * 100).toFixed(0)}%)</span>
                <span>${order.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/10 mt-2">
                <span>Total Paid</span>
                <span className="text-surf-accent">${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/" 
            className="flex-1 bg-surf-accent text-black font-bold uppercase py-4 rounded text-center hover:bg-white transition-colors"
          >
            Continue Shopping
          </Link>
          <button 
            onClick={() => window.print()}
            className="flex-1 bg-white/10 text-white font-bold uppercase py-4 rounded hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <i className="ph-bold ph-printer"></i>
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  )
}
