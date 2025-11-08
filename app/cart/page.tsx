'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CartItem } from '@/components/cart/cart-item'
import { useCart } from '@/lib/hooks/use-cart'
import { useUser } from '@/lib/hooks/use-user'

export default function CartPage() {
  const router = useRouter()
  const { cart, updateQuantity, removeItem, clearCart } = useCart()
  const { user } = useUser()

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push('/')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-6 text-center">
                Agrega productos de tus restaurantes favoritos
              </p>
              <Button onClick={() => router.push('/')}>
                Explorar restaurantes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Seguir comprando
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Tu pedido</CardTitle>
                {cart.restaurant && (
                  <p className="text-sm text-muted-foreground">
                    {cart.restaurant.name}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {cart.items.map((item) => (
                    <CartItem
                      key={item.product.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="w-full"
                  >
                    Vaciar carrito
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>S/ {cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>S/ {cart.deliveryFee.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>S/ {cart.total.toFixed(2)}</span>
                </div>

                {cart.restaurant?.minimum_order && cart.subtotal < cart.restaurant.minimum_order && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm text-orange-800">
                      Pedido mínimo: S/ {cart.restaurant.minimum_order.toFixed(2)}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Faltan S/ {(cart.restaurant.minimum_order - cart.subtotal).toFixed(2)}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={
                    cart.restaurant?.minimum_order
                      ? cart.subtotal < cart.restaurant.minimum_order
                      : false
                  }
                >
                  Continuar al pago
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Tiempo estimado de entrega: {cart.restaurant?.delivery_time_min} min
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
