"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CartItem {
  productId: string
  quantity: number
  notes?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (productId: string) => void
  removeFromCart: (productId: string) => void
  removeItemCompletely: (productId: string) => void
  clearCart: () => void
  getItemQuantity: (productId: string) => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Load cart from localStorage only on client side
    if (typeof window !== "undefined") {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]")
      setCart(savedCart)
    }
  }, [])

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart)
    if (isClient && typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(newCart))
      window.dispatchEvent(new CustomEvent("cartUpdated"))
    }
  }

  const addToCart = (productId: string) => {
    const existingItem = cart.find((item) => item.productId === productId)
    let newCart

    if (existingItem) {
      newCart = cart.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      newCart = [...cart, { productId, quantity: 1 }]
    }

    updateCart(newCart)
  }

  const removeFromCart = (productId: string) => {
    const existingItem = cart.find((item) => item.productId === productId)
    if (!existingItem) return

    let newCart
    if (existingItem.quantity === 1) {
      newCart = cart.filter((item) => item.productId !== productId)
    } else {
      newCart = cart.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
    }

    updateCart(newCart)
  }

  const removeItemCompletely = (productId: string) => {
    const newCart = cart.filter((item) => item.productId !== productId)
    updateCart(newCart)
  }

  const clearCart = () => {
    updateCart([])
  }

  const getItemQuantity = (productId: string) => {
    const item = cart.find((item) => item.productId === productId)
    return item ? item.quantity : 0
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        removeItemCompletely,
        clearCart,
        getItemQuantity,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
