import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getOrder } from '../services/api'

function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await getOrder(id)
        setOrder(response.order)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load this order.')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [id])

  if (isLoading) {
    return (
      <main className="orders-page">
        <Navbar />
        <div className="orders-content">
          <p className="cart-message">Loading order details...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="orders-page">
        <Navbar />
        <div className="orders-content orders-empty-state">
          <div>
            <p className="form-error">{error}</p>
            <Link className="button button-primary" to="/orders">
              Back to orders
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="orders-page">
        <Navbar />
        <div className="orders-content orders-empty-state">
          <div>
            <p className="form-error">Order not found.</p>
            <Link className="button button-primary" to="/orders">
              Back to orders
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="orders-page">
      <Navbar />

      <div className="orders-content">
        <div className="wishlist-header">
          <p className="eyebrow">ORDER DETAILS</p>
          <h1>Order #{order._id}</h1>
        </div>

        <div className="order-detail-card">
          <div className="order-details-row">
            <div>
              <p className="order-label">Total</p>
              <p>₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="order-label">Status</p>
              <p>{order.status}</p>
            </div>
            <div>
              <p className="order-label">Payment</p>
              <p>{order.paymentStatus}</p>
            </div>
          </div>

          <div className="order-details-row">
            <div>
              <p className="order-label">Customer</p>
              <p>{order.shippingAddress?.fullName}</p>
            </div>
            <div>
              <p className="order-label">Phone</p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </div>

          <div className="order-address-box">
            <p className="order-label">Shipping address</p>
            <p>{order.shippingAddress?.addressLine1}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p>{order.shippingAddress?.pincode}</p>
          </div>

          <div className="order-items-list">
            {order.items?.map((item) => (
              <div key={`${order._id}-${item.product}`} className="checkout-item-row">
                <img className="checkout-item-image" src={item.image} alt={item.name} />
                <div className="checkout-item-copy">
                  <p className="checkout-item-name">{item.name}</p>
                  <p className="checkout-item-meta">Qty: {item.quantity}</p>
                  <p className="checkout-item-meta">₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="checkout-item-price">
                  ₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default OrderDetails
