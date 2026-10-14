import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getWishlist, removeFromWishlist } from '../services/api'

function Wishlist() {
  const [wishlist, setWishlist] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const navigate = useNavigate()

  const loadWishlist = async () => {
    setIsLoading(true)
    setHasError(false)

    try {
      const data = await getWishlist()
      setWishlist(data.wishlist || [])
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login', { replace: true })
        return
      }

      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWishlist()
  }, [navigate])

  const handleRemove = async (productId) => {
    setRemovingId(productId)

    try {
      await removeFromWishlist(productId)
      setWishlist((currentWishlist) => currentWishlist.filter((product) => product._id !== productId))
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login', { replace: true })
        return
      }

      setHasError(true)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <main className="wishlist-page">
      <Navbar />

      <section className="wishlist-content">
        <div className="wishlist-header">
          <p className="eyebrow">SAVED FOR LATER</p>
          <h1>Your wishlist</h1>
        </div>

        {isLoading && <p className="wishlist-message">Loading your wishlist...</p>}

        {!isLoading && hasError && (
          <div className="wishlist-error">
            <div>
              <p className="form-error">Something went wrong.</p>
              <p className="wishlist-message">We couldn't load your wishlist.</p>
              <button className="button button-primary" type="button" onClick={loadWishlist}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {!isLoading && !hasError && wishlist.length === 0 && (
          <div className="wishlist-empty">
            <div className="wishlist-empty-inner">
              <div className="wishlist-empty-icon" aria-hidden="true">❤️</div>
              <h2>Your wishlist is empty</h2>
              <p>Save products you love and find them here later.</p>
              <Link className="button button-primary" to="/products">
                Browse Products <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        )}

        {!isLoading && !hasError && wishlist.length > 0 && (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <article key={product._id} className="wishlist-item">
                <img className="wishlist-item-image" src={product.image} alt={product.name} />
                <div className="wishlist-item-content">
                  <p className="product-category">{product.category}</p>
                  <h2>{product.name}</h2>
                  <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
                  <p className={product.stock > 0 ? 'stock-status' : 'stock-status out-of-stock'}>
                    {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
                  </p>

                  <div className="wishlist-actions">
                    <Link className="button button-primary" to={`/products/${product._id}`}>
                      View Details <span aria-hidden="true">→</span>
                    </Link>

                    <button
                      className="button button-secondary"
                      type="button"
                      disabled={removingId === product._id}
                      onClick={() => handleRemove(product._id)}
                    >
                      {removingId === product._id ? 'Removing...' : 'Remove from Wishlist'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Wishlist
