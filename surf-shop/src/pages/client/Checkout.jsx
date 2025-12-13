import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { db } from '../../firebase'
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    cardName: '',
    cardNumber: '' // Mock field
  })

  // Redirect if empty
  if (cartItems.length === 0) {
    return (
        <div className="min-h-screen bg-surf-black text-white flex flex-col items-center justify-center gap-4 bg-noise">
            <h2 className="font-display text-3xl uppercase">Your stash is empty</h2>
            <Link to="/shop" className="text-surf-accent hover:underline">Return to Shop</Link>
        </div>
    )
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
        const batch = writeBatch(db)
        
        // 1. Create the Order Reference
        const orderRef = doc(collection(db, 'orders'))
        const orderId = orderRef.id

        // 2. Prepare Order Data
        const orderData = {
            orderId,
            customer: {
                email: formData.email,
                name: `${formData.firstName} ${formData.lastName}`,
                address: formData.address
            },
            items: cartItems,
            total: cartTotal,
            status: 'paid', // Simulating successful payment
            createdAt: serverTimestamp()
        }

        batch.set(orderRef, orderData)

        // 3. Handle Side Effects (Bookings & Stock)
        cartItems.forEach(item => {
            
            // A. If it's a Rental -> Create a Booking Block
            if (item.type === 'rental') {
                const bookingRef = doc(collection(db, 'bookings'))
                batch.set(bookingRef, {
                    orderId,
                    rentalId: item.id, // ID of the asset
                    itemName: item.name,
                    dateRange: item.dateRange, // { start, end }
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    status: 'confirmed',
                    createdAt: serverTimestamp()
                })
            }

            // B. If it's a Product -> Decrement Stock (Optional logic for later)
            // Ideally, you would read the current stock and decrement it here.
            // For MVP, we are skipping the complex "read-modify-write" stock logic 
            // to avoid race conditions without Cloud Functions.
        })

        // 4. Commit All Changes
        await batch.commit()

        // 5. Success
        clearCart()
        alert("Order placed successfully! Surfs up.")
        navigate('/') // Or to a /success page

    } catch (err) {
        console.error("Checkout Error:", err)
        alert("Payment failed. Please try again.")
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surf-black text-white font-body bg-noise pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT COLUMN: FORM */}
            <div>
                <div className="mb-8">
                    <h1 className="font-display text-4xl uppercase mb-2">Checkout</h1>
                    <p className="text-gray-400 text-sm">Secure Payment • SSL Encrypted</p>
                </div>

                <form onSubmit={handleCheckout} className="space-y-8">
                    
                    {/* Contact */}
                    <div className="bg-surf-card p-6 rounded-xl border border-white/5 space-y-4">
                        <h3 className="text-surf-accent font-bold uppercase text-xs tracking-widest mb-4">Contact Info</h3>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Email</label>
                            <input name="email" type="email" required onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-surf-card p-6 rounded-xl border border-white/5 space-y-4">
                        <h3 className="text-surf-accent font-bold uppercase text-xs tracking-widest mb-4">Shipping / Billing</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">First Name</label>
                                <input name="firstName" required onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Last Name</label>
                                <input name="lastName" required onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Address</label>
                            <input name="address" required onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">City</label>
                                <input name="city" required onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Zip Code</label>
                                <input name="zip" required onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Payment (Mock) */}
                    <div className="bg-surf-card p-6 rounded-xl border border-white/5 space-y-4 opacity-75">
                        <h3 className="text-surf-accent font-bold uppercase text-xs tracking-widest mb-4">Payment (Simulated)</h3>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500">Card Number</label>
                            <input name="cardNumber" placeholder="4242 4242 4242 4242" className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none font-mono" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Expiry</label>
                                <input placeholder="MM/YY" className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">CVC</label>
                                <input placeholder="123" className="w-full bg-black/30 border border-white/10 rounded p-3 focus:border-surf-accent outline-none" />
                            </div>
                        </div>
                    </div>

                    <button disabled={loading} className="w-full bg-surf-accent text-black font-bold uppercase py-4 rounded tracking-widest hover:bg-white transition-colors text-lg cursor-pointer">
                        {loading ? 'Processing...' : `Pay $${cartTotal.toLocaleString()}`}
                    </button>

                </form>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div>
                <div className="bg-surf-card p-8 rounded-xl border border-white/10 sticky top-32">
                    <h3 className="font-display text-2xl uppercase mb-6">Order Summary</h3>
                    
                    <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                        {cartItems.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0">
                                <div className="w-16 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm">{item.name}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">{item.category}</p>
                                    
                                    {/* Dynamic Info */}
                                    {item.type === 'rental' ? (
                                        <div className="text-xs text-surf-accent mt-1">
                                            {item.dateRange.start} - {item.dateRange.end}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-400 mt-1">
                                            Size: {item.selectedSize} • Qty: {item.quantity}
                                        </div>
                                    )}
                                </div>
                                <div className="font-mono text-sm">
                                    {item.type === 'rental' 
                                        ? `$${(item.price * (item.days || 1)).toFixed(2)}`
                                        : `$${(item.price * item.quantity).toFixed(2)}`
                                    }
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-white/10 text-sm">
                        <div className="flex justify-between text-gray-400">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Taxes (Estimated)</span>
                            <span>${(cartTotal * 0.08).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-xl pt-4 border-t border-white/10 mt-4">
                            <span>Total</span>
                            <span>${(cartTotal * 1.08).toFixed(2)}</span>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
  )
}