'use client'

import { Navbar } from './navbar'
import { useCart } from '@/lib/hooks/use-cart'

export function NavbarWrapper() {
  const { itemCount } = useCart()

  return <Navbar cartItemCount={itemCount} />
}
