import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { logoutCustomer } from '../services/api'

function Navbar() {
  const navigate = useNavigate()
  const { cartCount, clearCart } = useCart()

  const handleLogout = async () => {
    try {
      await logoutCustomer()
    } finally {
      clearCart()
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/" aria-label="ShopKart home">
        <span className="brand-mark">S</span>
        <span>ShopKart</span>
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/products">Products</Link>
        <Link className="nav-link" to="/wishlist">Wishlist</Link>
        <Link className="nav-link" to="/orders">My Orders</Link>
        <Link className="nav-link nav-link-cart" to="/cart">Cart ({cartCount})</Link>
      </nav>

      <button className="button button-quiet" type="button" onClick={handleLogout}>
        Logout <span aria-hidden="true">↗</span>
      </button>
    </header>
  )
}

export default Navbar
