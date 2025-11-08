'use client'

import { useEffect, useState } from 'react'
import type { Cart, CartItem, Product, Restaurant } from '@/lib/types'

const CART_STORAGE_KEY = 'rappi-xd-cart'

export function useCart() {
  const [mounted, setMounted] = useState(false)
  const [cart, setCart] = useState<Cart>({
    restaurant: null,
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart, mounted])

  const calculateTotals = (items: CartItem[], deliveryFee: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const total = subtotal + deliveryFee
    return { subtotal, total }
  }

  const addItem = (product: Product, restaurant: Restaurant, quantity: number = 1) => {
    setCart(prevCart => {
      // If cart has items from a different restaurant, clear it
      if (prevCart.restaurant && prevCart.restaurant.id !== restaurant.id) {
        const deliveryFee = restaurant.delivery_fee || 0
        const newItems: CartItem[] = [{ product, quantity }]
        const { subtotal, total } = calculateTotals(newItems, deliveryFee)

        return {
          restaurant,
          items: newItems,
          subtotal,
          deliveryFee,
          total,
        }
      }

      // Add or update item in cart
      const existingItemIndex = prevCart.items.findIndex(
        item => item.product.id === product.id
      )

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        // Update existing item
        if (quantity === 0) {
          // Remove item if quantity is 0
          newItems = prevCart.items.filter((_, index) => index !== existingItemIndex)
        } else {
          newItems = prevCart.items.map((item, index) =>
            index === existingItemIndex ? { ...item, quantity } : item
          )
        }
      } else {
        // Add new item
        newItems = [...prevCart.items, { product, quantity }]
      }

      const deliveryFee = restaurant.delivery_fee || 0
      const { subtotal, total } = calculateTotals(newItems, deliveryFee)

      return {
        restaurant: newItems.length > 0 ? restaurant : null,
        items: newItems,
        subtotal,
        deliveryFee: newItems.length > 0 ? deliveryFee : 0,
        total: newItems.length > 0 ? total : 0,
      }
    })
  }

  const removeItem = (productId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.product.id !== productId)
      const deliveryFee = prevCart.deliveryFee
      const { subtotal, total } = calculateTotals(newItems, deliveryFee)

      return {
        restaurant: newItems.length > 0 ? prevCart.restaurant : null,
        items: newItems,
        subtotal,
        deliveryFee: newItems.length > 0 ? deliveryFee : 0,
        total: newItems.length > 0 ? total : 0,
      }
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const newItems = prevCart.items
        .map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
        .filter(item => item.quantity > 0)

      const deliveryFee = prevCart.deliveryFee
      const { subtotal, total } = calculateTotals(newItems, deliveryFee)

      return {
        restaurant: newItems.length > 0 ? prevCart.restaurant : null,
        items: newItems,
        subtotal,
        deliveryFee: newItems.length > 0 ? deliveryFee : 0,
        total: newItems.length > 0 ? total : 0,
      }
    })
  }

  const clearCart = () => {
    setCart({
      restaurant: null,
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
    })
    if (mounted) {
      localStorage.removeItem(CART_STORAGE_KEY)
    }
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
  }
}
