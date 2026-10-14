import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getCurrentCustomer } from '../services/api'

function Home() {
  const [customer, setCustomer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setCustomer(await getCurrentCustomer())
      } catch {
        navigate('/login', { replace: true })
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomer()
  }, [navigate])

  if (isLoading) {
    return <main className="loading-screen"><p>Loading your ShopKart...</p></main>
  }

  if (!customer) {
    return null
  }

  return (
    <main className="home-page">
      <Navbar />

      <section className="home-content">
        <p className="eyebrow">YOUR EVERYDAY MARKETPLACE</p>
        <h1>Make room for the good stuff.</h1>
        <p className="home-lede">
          Welcome back, {customer.fullName}. Your next great find is waiting.
        </p>

        <article className="profile-card">
          <div className="profile-avatar" aria-hidden="true">
            {customer.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="eyebrow">SHOPKART MEMBER</p>
            <h2>{customer.fullName}</h2>
          </div>

          <dl className="profile-details">
            <div>
              <dt>Email</dt>
              <dd>{customer.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{customer.phone}</dd>
            </div>
          </dl>
        </article>

        <Link className="button button-primary" to="/products">
          Start exploring <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  )
}

export default Home