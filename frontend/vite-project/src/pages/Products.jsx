import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/api'

function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setHasError(false)

      try {
        const data = await getProducts({
          ...(search.trim() && { search: search.trim() }),
          ...(category && { category })
        })
        setProducts(data.products)
      } catch {
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [search, category])

  return (
    <main className="catalog-page">
      <Navbar />
      <section className="catalog-content">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">THE SHOPKART CATALOG</p>
            <h1>Find your next good thing.</h1>
          </div>
          <p className="catalog-copy">Useful objects, familiar favorites, and small upgrades for every day.</p>
        </div>

        <div className="catalog-filters">
          <label className="search-field">
            <span>Search products...</span>
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="category-field">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Books">Books</option>
              <option value="Home">Home</option>
            </select>
          </label>
        </div>

        {isLoading && <p className="catalog-message">Loading products...</p>}
        {!isLoading && hasError && <p className="catalog-message form-error">Something went wrong while loading products.</p>}
        {!isLoading && !hasError && products.length === 0 && <p className="catalog-message">No products found.</p>}
        {!isLoading && !hasError && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </section>
    </main>
  )
}

export default Products