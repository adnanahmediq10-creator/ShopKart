import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'

function Cart() {
  const { cartItems, cartLoading, cartError, subtotal, refreshCart, updateQuantity, removeFromCart } = useCart()

  const totalUnits = cartItems.reduce((total, item) => total + item.quantity, 0)

  const handleQuantityChange = async (productId, nextQuantity) => {
    if (nextQuantity < 1) {
      return
    }

    await updateQuantity(productId, nextQuantity)
  }

  if (cartLoading) {
    return (
      <main className="cart-page">
        <Navbar />
        <div className="cart-content">
          <p className="cart-message">Loading your cart...</p>
        </div>
      </main>
    )
  }

  if (cartError) {
    return (
      <main className="cart-page">
        <Navbar />
        <div className="cart-content cart-empty-state">
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
      <main className="cart-page">
        <Navbar />
        <div className="cart-content cart-empty-state">
          <div className="cart-empty-inner">
            <div className="cart-empty-icon" aria-hidden="true">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link className="button button-primary" to="/products">
              Browse Products <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="cart-page">
      <Navbar />
      <div className="cart-content">
        <div className="cart-header">
          <p className="eyebrow">YOUR BAG</p>
          <h1>Shopping cart</h1>
        </div>

        <div className="cart-layout">
          <div className="cart-list">
            {cartItems.map((item) => (
              <article key={item.product?._id} className="cart-item">
                <img className="cart-item-image" src={item.product?.image} alt={item.product?.name} />

                <div className="cart-item-details">
                  <p className="product-category">{item.product?.category}</p>
                  <h2>{item.product?.name}</h2>
                  <p className="product-price">₹{(item.product?.price || 0).toLocaleString('en-IN')}</p>

                  <div className="quantity-row">
                    <button
                      className="quantity-button"
                      type="button"
                      disabled={item.quantity <= 1}
                      onClick={() => handleQuantityChange(item.product?._id, item.quantity - 1)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      className="quantity-button"
                      type="button"
                      disabled={item.quantity >= (item.product?.stock || 0)}
                      onClick={() => handleQuantityChange(item.product?._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <p className="cart-stock-status">
                    {item.product?.stock > 0 ? `${item.product.stock} units left` : 'Out of stock'}
                  </p>
                </div>

                <div className="cart-item-actions">
                  <p className="cart-subtotal">₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}</p>
                  <button className="button button-secondary" type="button" onClick={() => removeFromCart(item.product?._id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items</span>
              <strong>{totalUnits}</strong>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
            </div>
            <Link className="button button-primary" to="/checkout">
              Proceed to Checkout <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default Cart
