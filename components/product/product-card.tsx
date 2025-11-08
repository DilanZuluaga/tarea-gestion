'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-react'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0)

  const handleIncrement = () => {
    const newQuantity = quantity + 1
    setQuantity(newQuantity)
    onAddToCart(product, newQuantity)
  }

  const handleDecrement = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1
      setQuantity(newQuantity)
      onAddToCart(product, newQuantity)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="flex-1 p-4">
          <h3 className="font-semibold mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.description}
          </p>
          <p className="font-bold text-orange-600">
            S/ {product.price.toFixed(2)}
          </p>
        </div>

        <div className="relative w-32 h-32 flex-shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100" />
          )}

          {quantity > 0 ? (
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full shadow-lg border-2 border-background flex items-center">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-l-full"
                onClick={handleDecrement}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-2 font-semibold">{quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-r-full"
                onClick={handleIncrement}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="icon"
              className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full shadow-lg"
              onClick={handleIncrement}
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
