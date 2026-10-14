import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { createPaymentOrder, verifyPayment } from '../services/api'

const initialShipping = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

const loadRazorpayScript = () => new Promise((resolve, reject) => {
  const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)

  if (existingScript) {
    if (window.Razorpay) {
      resolve()
      return
    }

    existingScript.addEventListener('load', () => resolve(), { once: true })
    existingScript.addEventListener('error', () => reject(new Error('Razorpay script failed to load.')), { once: true })
    return
  }

  const script = document.createElement('script')
  script.src = RAZORPAY_SCRIPT_URL
  script.async = true
  script.onload = () => resolve()
  script.onerror = () => reject(new Error('Razorpay script failed to load.'))
  document.body.appendChild(script)
})

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, cartLoading, cartError, subtotal, clearCart, refreshCart } = useCart()
  const [shippingAddress, setShippingAddress] = useState(initialShipping)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingScript, setIsLoadingScript] = useState(false)

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0 && !cartError) {
      setSubmitError('Your cart is empty. Add products before checkout.')
    }
  }, [cartItems, cartLoading, cartError])

  const totalItems = useMemo(
    () => cartItems.reduce((total, item) => total + (item.quantity || 0), 0),
    [cartItems]
  )

  const validateForm = (formData) => {
    const nextErrors = {}
    const cleanData = { ...formData }

    Object.keys(cleanData).forEach((key) => {
      cleanData[key] = String(cleanData[key] ?? '').trim()
    })

    if (!cleanData.fullName) {
      nextErrors.fullName = 'Full name is required.'
    }

    if (!cleanData.phone) {
      nextErrors.phone = 'Phone number is required.'
    } else if (!/^\d{10}$/.test(cleanData.phone)) {
      nextErrors.phone = 'Phone number must contain 10 digits.'
    }

    if (!cleanData.addressLine1) {
      nextErrors.addressLine1 = 'Address line is required.'
    }

    if (!cleanData.city) {
      nextErrors.city = 'City is required.'
    }

    if (!cleanData.state) {
      nextErrors.state = 'State is required.'
    }

    if (!cleanData.pincode) {
      nextErrors.pincode = 'Pincode is required.'
    } else if (!/^\d{6}$/.test(cleanData.pincode)) {
      nextErrors.pincode = 'Pincode must contain 6 digits.'
    }

    setShippingAddress(cleanData)
    return nextErrors
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setShippingAddress((previous) => ({
      ...previous,
      [name]: value,
    }))

    setErrors((previous) => ({
      ...previous,
      [name]: '',
    }))
  }

  const handlePayment = async (paymentOrderResponse) => {
    if (!window.Razorpay) {
      setSubmitError('Razorpay is unavailable right now. Please try again.')
      setIsSubmitting(false)
      return
    }

    const razorpayOptions = {
      key: paymentOrderResponse.key,
      amount: paymentOrderResponse.amount,
      currency: paymentOrderResponse.currency,
      name: 'ShopKart',
      description: 'ShopKart order payment',
      order_id: paymentOrderResponse.razorpayOrderId,
      handler: async function (razorpayResponseData) {
        try {
          setSubmitError('')
          setIsSubmitting(true)

          await verifyPayment({
            shopKartOrderId: paymentOrderResponse.shopKartOrderId,
            razorpay_order_id: razorpayResponseData.razorpay_order_id,
            razorpay_payment_id: razorpayResponseData.razorpay_payment_id,
            razorpay_signature: razorpayResponseData.razorpay_signature,
          })

          clearCart()
          navigate(`/order-success/${paymentOrderResponse.shopKartOrderId}`)
        } catch (error) {
          const backendMessage = error.response?.data?.message || 'Payment verification failed.'
          setSubmitError(backendMessage)
          setIsSubmitting(false)
        }
      },
      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone,
      },
      theme: {
        color: '#c8ed68',
      },
      modal: {
        ondismiss: () => {
          setSubmitError('Payment cancelled. Your cart is still available.')
          setIsSubmitting(false)
        },
      },
    }

    const razorpayInstance = new window.Razorpay(razorpayOptions)
    razorpayInstance.open()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (cartItems.length === 0) {
      setSubmitError('Your cart is empty. Add products before checkout.')
      return
    }

    const validationErrors = validateForm(shippingAddress)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSubmitError('Please fix the highlighted shipping details.')
      return
    }

    setSubmitError('')
    setIsLoadingScript(true)
    setIsSubmitting(true)

    try {
      try {
        await loadRazorpayScript()
      } catch (scriptError) {
        setSubmitError('Failed to load Razorpay payment gateway. Please check your internet connection.')
        setIsSubmitting(false)
        setIsLoadingScript(false)
        return
      }

      const paymentOrder = await createPaymentOrder({
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      })

      if (!paymentOrder?.success) {
        setSubmitError(paymentOrder?.message || 'Unable to create your order right now.')
        setIsSubmitting(false)
        setIsLoadingScript(false)
        return
      }

      await handlePayment(paymentOrder)
      setIsLoadingScript(false)
    } catch (error) {
      const backendMessage = error.response?.data?.message || 'Unable to create payment order.'
      setSubmitError(backendMessage)
      setIsSubmitting(false)
      setIsLoadingScript(false)
    }
  }

  if (cartLoading) {
    return (
      <main className="checkout-page">
        <Navbar />
        <div className="checkout-content">
          <p className="cart-message">Loading your cart...</p>
        </div>
      </main>
    )
  }

  if (cartError) {
    return (
      <main className="checkout-page">
        <Navbar />
        <div className="checkout-content cart-empty-state">
          <div>
            <p className="form-error">Unable to load your cart.</p>
            <button className="button button-primary" type="button" onClick={refreshCart}>
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <Navbar />
        <div className="checkout-content cart-empty-state">
          <div className="cart-empty-inner">
            <div className="cart-empty-icon" aria-hidden="true">🛒</div>
            <h2>Checkout is empty</h2>
            <p>Add a few products to your cart before continuing.</p>
            <Link className="button button-primary" to="/products">
              Browse Products <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="checkout-page">
      <Navbar />

      <div className="checkout-content">
        <div className="checkout-header">
          <p className="eyebrow">CHECKOUT</p>
          <h1>Complete your order</h1>
        </div>

        {submitError && <p className="form-error checkout-message">{submitError}</p>}

        <div className="checkout-layout">
          <section className="checkout-panel">
            <h2>Shipping details</h2>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div>
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    placeholder="Aarav Sharma"
                  />
                  {errors.fullName && <p className="form-error">{errors.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                  />
                  {errors.phone && <p className="form-error">{errors.phone}</p>}
                </div>
              </div>

              <label htmlFor="addressLine1">Address Line</label>
              <input
                id="addressLine1"
                name="addressLine1"
                value={shippingAddress.addressLine1}
                onChange={handleInputChange}
                placeholder="22 MG Road"
              />
              {errors.addressLine1 && <p className="form-error">{errors.addressLine1}</p>}

              <div className="form-grid">
                <div>
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    placeholder="Bengaluru"
                  />
                  {errors.city && <p className="form-error">{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    placeholder="Karnataka"
                  />
                  {errors.state && <p className="form-error">{errors.state}</p>}
                </div>
              </div>

              <label htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                name="pincode"
                value={shippingAddress.pincode}
                onChange={handleInputChange}
                placeholder="560001"
              />
              {errors.pincode && <p className="form-error">{errors.pincode}</p>}

              <button className="button button-primary" type="submit" disabled={isSubmitting || isLoadingScript}>
                {isLoadingScript ? 'Loading Razorpay...' : isSubmitting ? 'Processing payment...' : 'Place Order'}
              </button>
            </form>
          </section>

          <aside className="checkout-summary">
            <h2>Order summary</h2>

            <div className="checkout-items">
              {cartItems.map((item) => (
                <div key={item.product?._id} className="checkout-item-row">
                  <img className="checkout-item-image" src={item.product?.image} alt={item.product?.name} />

                  <div className="checkout-item-copy">
                    <p className="checkout-item-name">{item.product?.name}</p>
                    <p className="checkout-item-meta">Qty: {item.quantity}</p>
                    <p className="checkout-item-meta">₹{(item.product?.price || 0).toLocaleString('en-IN')}</p>
                  </div>

                  <div className="checkout-item-price">
                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Items</span>
              <strong>{totalItems}</strong>
            </div>

            <div className="summary-row total-row">
              <span>Total</span>
              <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default Checkout
