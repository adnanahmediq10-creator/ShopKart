import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getOrder } from '../services/api'

function OrderSuccess() {
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
        setError(err.response?.data?.message || 'Unable to load order details.')
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
          <p className="cart-message">Loading your order confirmation...</p>
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="orders-page">
        <Navbar />
        <div className="orders-content orders-empty-state">
          <div>
            <p className="form-error">{error || 'Order not found.'}</p>
            <Link className="button button-primary" to="/products">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="orders-page">
      <Navbar />

      <div className="orders-content order-success-box">
        <p className="eyebrow success-eyebrow">ORDER PLACED</p>
        <h1>Order placed successfully!</h1>
        <p className="success-copy">Your order has been saved successfully.</p>

        <div className="success-summary">
          <div>
            <p className="order-label">Order ID</p>
            <p>{order._id}</p>
          </div>
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

        <div className="order-success-actions">
          <Link className="button button-primary" to="/orders">
            View My Orders
          </Link>
          <Link className="button button-secondary" to="/products">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}

export default OrderSuccess
