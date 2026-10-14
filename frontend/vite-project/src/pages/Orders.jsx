import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getOrders } from '../services/api'

function Orders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await getOrders()
      setOrders(response.orders || [])
    } catch (err) {
      setError('Unable to load your orders.')
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  if (isLoading) {
    return (
      <main className="orders-page">
        <Navbar />
        <div className="orders-content">
          <p className="cart-message">Loading your orders...</p>
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
            <button className="button button-primary" type="button" onClick={loadOrders}>
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (orders.length === 0) {
    return (
      <main className="orders-page">
        <Navbar />
        <div className="orders-content orders-empty-state">
          <div className="cart-empty-inner">
            <div className="cart-empty-icon" aria-hidden="true">📦</div>
            <h2>You have not placed any orders yet.</h2>
            <Link className="button button-primary" to="/products">
              Start Shopping <span aria-hidden="true">→</span>
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
          <p className="eyebrow">YOUR ORDERS</p>
          <h1>Recent purchases</h1>
        </div>

        <div className="orders-list">
          {orders.map((order) => {
            const productNames = order.items?.map((item) => item.name).join(', ') || 'Products'

            return (
              <article key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <p className="eyebrow order-meta">Order ID</p>
                    <strong>{order._id}</strong>
                  </div>
                  <div>
                    <p className="eyebrow order-meta">Date</p>
                    <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="order-details-row">
                  <div>
                    <p className="order-label">Items</p>
                    <p>{productNames}</p>
                  </div>
                  <div>
                    <p className="order-label">Total</p>
                    <p>₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="order-details-row">
                  <div>
                    <p className="order-label">Order status</p>
                    <p>{order.status}</p>
                  </div>
                  <div>
                    <p className="order-label">Payment</p>
                    <p>{order.paymentStatus}</p>
                  </div>
                </div>

                <Link className="button button-secondary order-button" to={`/orders/${order._id}`}>
                  View Details
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}

export default Orders
