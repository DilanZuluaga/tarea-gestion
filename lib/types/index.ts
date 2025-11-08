import { Tables } from './database.types'

// Export database types
export * from './database.types'

// Type aliases for easier use
export type Profile = Tables<'profiles'>
export type Restaurant = Tables<'restaurants'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type OrderStatusHistory = Tables<'order_status_history'>

// Extended types with relationships
export type RestaurantWithProducts = Restaurant & {
  products: Product[]
}

export type OrderWithDetails = Order & {
  restaurant: Restaurant
  order_items: (OrderItem & {
    product: Product | null
  })[]
}

export type OrderWithHistory = Order & {
  order_status_history: OrderStatusHistory[]
}

// Order status type
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled'

// Cart item type
export type CartItem = {
  product: Product
  quantity: number
  special_instructions?: string
}

// Cart state type
export type Cart = {
  restaurant: Restaurant | null
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
}
