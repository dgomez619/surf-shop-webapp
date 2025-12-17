import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { db } from '../../firebase'
import { collection, writeBatch, doc, serverTimestamp, increment, getDoc, query, where, getDocs } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
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
    setError(null)

    try {
        // === STEP 1: PRE-VALIDATE AVAILABILITY & PRICES ===
        const validationErrors = []
        const validatedItems = []

        for (const cartItem of cartItems) {
            if (cartItem.type === 'rental') {
                // Validate rental availability
                const rentalDoc = await getDoc(doc(db, 'rentals', cartItem.id))
                if (!rentalDoc.exists()) {
                    validationErrors.push(`${cartItem.name} is no longer available`)
                    continue
                }

                const rentalData = rentalDoc.data()
                
                // Check if still active
                if (rentalData.status !== 'active') {
                    validationErrors.push(`${cartItem.name} is currently unavailable (status: ${rentalData.status})`)
                    continue
                }

                // Check current bookings for date conflicts
                const bookingsQuery = query(
                    collection(db, 'bookings'),
                    where('rentalId', '==', cartItem.id)
                )
                const bookingsSnap = await getDocs(bookingsQuery)
                
                const conflictCount = bookingsSnap.docs.filter(bookingDoc => {
                    const booking = bookingDoc.data()
                    const bookingStart = new Date(booking.dateRange.start)
                    const bookingEnd = new Date(booking.dateRange.end)
                    const requestStart = new Date(cartItem.dateRange.start)
                    const requestEnd = new Date(cartItem.dateRange.end)
                    
                    return requestStart < bookingEnd && requestEnd > bookingStart
                }).length

                const availableStock = rentalData.stock - conflictCount

                if (availableStock < cartItem.quantity) {
                    validationErrors.push(`${cartItem.name}: Only ${availableStock} available for selected dates (you requested ${cartItem.quantity})`)
                    continue
                }

                // Get current rate
                const currentRate = rentalData.rates?.daily || cartItem.price
                validatedItems.push({
                    ...cartItem,
                    price: currentRate,
                    dailyRate: currentRate,
                    verifiedStock: availableStock,
                    // Ensure days is set
                    days: cartItem.days || 1
                })

            } else if (cartItem.type === 'shop') {
                // Validate shop product availability
                const productDoc = await getDoc(doc(db, 'products', cartItem.id))
                if (!productDoc.exists()) {
                    validationErrors.push(`${cartItem.name} is no longer available`)
                    continue
                }

                const productData = productDoc.data()
                
                // Check size-specific stock if product has size selected
                if (cartItem.selectedSize && productData.stockBySize) {
                    const sizeStock = productData.stockBySize[cartItem.selectedSize] || 0
                    
                    if (sizeStock === 0) {
                        validationErrors.push(`${cartItem.name} (Size ${cartItem.selectedSize}): Currently out of stock`)
                        continue
                    } else if (sizeStock < cartItem.quantity) {
                        validationErrors.push(`${cartItem.name} (Size ${cartItem.selectedSize}): Only ${sizeStock} in stock (you requested ${cartItem.quantity})`)
                        continue
                    }
                } else {
                    // General stock check for non-sized products
                    if (productData.stock === 0) {
                        validationErrors.push(`${cartItem.name}: Item currently out of stock`)
                        continue
                    } else if (productData.stock < cartItem.quantity) {
                        validationErrors.push(`${cartItem.name}: Only ${productData.stock} in stock (you requested ${cartItem.quantity})`)
                        continue
                    }
                }

                // Get current price
                const currentPrice = productData.price || cartItem.price
                validatedItems.push({
                    ...cartItem,
                    price: currentPrice,
                    verifiedStock: cartItem.selectedSize && productData.stockBySize 
                        ? productData.stockBySize[cartItem.selectedSize]
                        : productData.stock
                })
            }
        }

        // If any validation errors, stop checkout
        if (validationErrors.length > 0) {
            setError(validationErrors.join('. '))
            setLoading(false)
            return
        }

        // === STEP 2: CALCULATE TOTALS WITH VALIDATED PRICES ===
        const TAX_RATE = 0.08
        const subtotal = validatedItems.reduce((sum, item) => {
            if (item.type === 'rental') {
                return sum + (item.price * (item.days || 1) * item.quantity)
            }
            return sum + (item.price * item.quantity)
        }, 0)
        const tax = subtotal * TAX_RATE
        const total = subtotal + tax

        // === STEP 3: CREATE BATCH TRANSACTION ===
        const batch = writeBatch(db)
        
        const orderRef = doc(collection(db, 'orders'))
        const orderId = orderRef.id

        // Order data with validated items and complete pricing
        const orderData = {
            orderId,
            customer: {
                email: formData.email,
                name: `${formData.firstName} ${formData.lastName}`,
                address: formData.address,
                city: formData.city,
                zip: formData.zip
            },
            items: validatedItems,
            subtotal,
            tax,
            taxRate: TAX_RATE,
            total,
            status: 'paid',
            createdAt: serverTimestamp()
        }

        batch.set(orderRef, orderData)

        // === STEP 4: HANDLE SIDE EFFECTS ===
        validatedItems.forEach(item => {
            
            // A. RENTALS: Create booking(s) with quantity
            if (item.type === 'rental') {
                // Create one booking per quantity unit
                for (let i = 0; i < item.quantity; i++) {
                    const bookingRef = doc(collection(db, 'bookings'))
                    batch.set(bookingRef, {
                        orderId,
                        rentalId: item.id,
                        boardId: item.id, // Alias for backward compatibility
                        itemName: item.name,
                        dateRange: item.dateRange,
                        customerName: `${formData.firstName} ${formData.lastName}`,
                        customerEmail: formData.email,
                        quantity: 1, // Each booking represents 1 unit
                        unitNumber: i + 1, // Track which unit (1 of 2, 2 of 2, etc.)
                        totalUnits: item.quantity,
                        status: 'confirmed',
                        createdAt: serverTimestamp()
                    })
                }
            }

            // B. SHOP PRODUCTS: Decrement stock atomically
            if (item.type === 'shop') {
                const productRef = doc(db, 'products', item.id)
                
                if (item.selectedSize && item.stockBySize) {
                    // Decrement size-specific stock
                    batch.update(productRef, {
                        [`stockBySize.${item.selectedSize}`]: increment(-item.quantity),
                        // Also decrement total stock
                        stock: increment(-item.quantity)
                    })
                } else {
                    // Decrement general stock for non-sized products
                    batch.update(productRef, {
                        stock: increment(-item.quantity)
                    })
                }
            }
        })

        // === STEP 5: COMMIT TRANSACTION ===
        await batch.commit()

        // === STEP 6: SUCCESS ===
        clearCart()
        navigate(`/order-success/${orderId}`)

    } catch (err) {
        console.error("Checkout Error:", err)
        setError(`Payment processing failed: ${err.message}. Please try again.`)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surf-black text-white font-body bg-noise pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* ERROR MESSAGE */}
            {error && (
                <div className="lg:col-span-2 bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                    <i className="ph-bold ph-warning text-2xl text-red-500"></i>
                    <div>
                        <p className="font-bold text-red-400 mb-1">Checkout Error</p>
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                </div>
            )}

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

                    {/* Order Actions */}
                    <div className="flex gap-4 mt-4">
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 bg-surf-card text-white font-bold uppercase py-3 rounded tracking-widest hover:bg-white/10 transition-colors border border-white/20"
                        >
                            <i className="ph-bold ph-pencil mr-2"></i>
                            Edit Order
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                    clearCart()
                                    navigate('/')
                                }
                            }}
                            className="flex-1 bg-red-500/20 text-red-400 font-bold uppercase py-3 rounded tracking-widest hover:bg-red-500/30 transition-colors border border-red-500/50"
                        >
                            <i className="ph-bold ph-x mr-2"></i>
                            Cancel Order
                        </button>
                    </div>

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