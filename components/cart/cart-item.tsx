'use client'

import { Button } from '@/components/ui/button'
import { Plus, Minus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '@/lib/types'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const handleIncrement = () => {
    onUpdateQuantity(item.product.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.product.id, item.quantity - 1)
    } else {
      onRemove(item.product.id)
    }
  }

  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-0">
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{item.product.name}</h3>
        <p className="text-sm text-muted-foreground">
          S/ {item.product.price.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={handleDecrement}
        >
          {item.quantity === 1 ? (
            <Trash2 className="h-4 w-4" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
        </Button>

        <span className="w-8 text-center font-semibold">{item.quantity}</span>

        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={handleIncrement}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="font-bold w-20 text-right">
        S/ {(item.product.price * item.quantity).toFixed(2)}
      </div>
    </div>
  )
}
