import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { getProduct } from '../services/api'

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true)
      setHasError(false)

      try {
        setProduct(await getProduct(id))
      } catch {
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (isAddingToCart || product.stock === 0) {
      return
    }

    setIsAddingToCart(true)

    try {
      await addToCart(product._id)
    } catch {
      // Keep error handling simple and consistent with the rest of the app.
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <main className="catalog-page">
      <Navbar />
      {isLoading && <p className="catalog-message">Loading products...</p>}
      {!isLoading && hasError && <p className="catalog-message form-error">Something went wrong while loading products.</p>}
      {!isLoading && !hasError && product && (
        <section className="product-details">
          <img className="product-details-image" src={product.image} alt={product.name} />
          <div className="product-details-content">
            <Link className="back-link" to="/products">← Back to products</Link>
            <p className="product-category">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="product-details-description">{product.description}</p>
            <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
            <p className={product.stock > 0 ? 'stock-status' : 'stock-status out-of-stock'}>
              {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
            </p>
            <button className="button button-primary" type="button" disabled={product.stock === 0 || isAddingToCart} onClick={handleAddToCart}>
              {isAddingToCart ? 'Adding...' : 'Add to Cart'} <span aria-hidden="true">+</span>
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

export default ProductDetails