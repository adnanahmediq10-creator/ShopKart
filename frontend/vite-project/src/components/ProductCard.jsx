import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { addToWishlist } from '../services/api'

function ProductCard({ product }) {
  const [wishlistState, setWishlistState] = useState('idle')
  const [cartState, setCartState] = useState('idle')
  const { addToCart } = useCart()

  const handleAddToWishlist = async () => {
    if (wishlistState === 'saving') {
      return
    }

    setWishlistState('saving')

    try {
      await addToWishlist(product._id)
      setWishlistState('saved')
    } catch (error) {
      const status = error.response?.status

      if (status === 409) {
        setWishlistState('saved')
        return
      }

      setWishlistState('error')
    }
  }

  const handleAddToCart = async () => {
    if (cartState === 'adding' || product.stock === 0) {
      return
    }

    setCartState('adding')

    try {
      await addToCart(product._id)
      setCartState('added')
    } catch (error) {
      setCartState('error')
    }
  }

  const getWishlistLabel = () => {
    if (wishlistState === 'saving') return '⏳ Saving...'
    if (wishlistState === 'saved') return '♥ Added to Wishlist'
    if (wishlistState === 'error') return 'Unable to save product. Please try again.'
    return '♡ Add to Wishlist'
  }

  const getCartLabel = () => {
    if (cartState === 'adding') return 'Adding...'
    if (cartState === 'error') return 'Unable to add to cart.'
    if (cartState === 'added') return 'Added to cart'
    return 'Add to Cart'
  }

  return (
    <article className="product-card">
      <img className="product-card-image" src={product.image} alt={product.name} />
      <div className="product-card-content">
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
        <p className={product.stock > 0 ? 'stock-status' : 'stock-status out-of-stock'}>
          {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
        </p>

        <button
          className="button button-secondary"
          type="button"
          onClick={handleAddToCart}
          disabled={cartState === 'adding' || product.stock === 0}
        >
          {getCartLabel()}
        </button>

        <button
          className="button button-secondary"
          type="button"
          onClick={handleAddToWishlist}
          disabled={wishlistState === 'saving' || wishlistState === 'saved'}
        >
          {getWishlistLabel()}
        </button>

        <Link className="button button-primary" to={`/products/${product._id}`}>
          View Details <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

export default ProductCard