import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(true)
  const [cartError, setCartError] = useState(false)

  const refreshCart = async () => {
    try {
      setCartLoading(true)
      setCartError(false)

      const response = await api.get('/cart')
      setCartItems(response.data.cart || [])
    } catch (error) {
      if (error.response?.status === 401) {
        setCartItems([])
        setCartError(false)
        return
      }

      setCartItems([])
      setCartError(true)
    } finally {
      setCartLoading(false)
    }
  }

  const clearCart = () => {
    setCartItems([])
    setCartError(false)
    setCartLoading(false)
  }

  const addToCart = async (productId) => {
    const response = await api.post(`/cart/${productId}`)
    await refreshCart()
    return response.data
  }

  const updateQuantity = async (productId, quantity) => {
    const response = await api.patch(`/cart/${productId}`, { quantity })
    await refreshCart()
    return response.data
  }

  const removeFromCart = async (productId) => {
    const response = await api.delete(`/cart/${productId}`)
    await refreshCart()
    return response.data
  }

  useEffect(() => {
    refreshCart()
  }, [])

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + (item.quantity || 0), 0),
    [cartItems]
  )

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + ((item.product?.price || 0) * (item.quantity || 0)), 0),
    [cartItems]
  )

  const value = {
    cartItems,
    cartLoading,
    cartError,
    cartCount,
    subtotal,
    refreshCart,
    clearCart,
    addToCart,
    updateQuantity,
    removeFromCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}
