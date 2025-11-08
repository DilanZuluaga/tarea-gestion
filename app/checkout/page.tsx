'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/hooks/use-cart'
import { useUser } from '@/lib/hooks/use-user'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    instructions: '',
    paymentMethod: 'cash',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !cart.restaurant) {
      return
    }

    setLoading(true)

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: cart.restaurant.id,
          subtotal: cart.subtotal,
          delivery_fee: cart.deliveryFee,
          total: cart.total,
          delivery_address: formData.address,
          delivery_instructions: formData.instructions || null,
          payment_method: formData.paymentMethod,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      toast({
        title: 'Pedido creado',
        description: 'Tu pedido ha sido creado exitosamente',
      })

      clearCart()
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: 'Error',
        description: 'No se pudo crear el pedido. Intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!cart.restaurant || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center mb-4">Tu carrito está vacío</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Ir a inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/cart')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al carrito
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección de entrega *</Label>
                    <Input
                      id="address"
                      placeholder="Ej: Av. Principal 123, Dpto 404"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">
                      Instrucciones de entrega (opcional)
                    </Label>
                    <Textarea
                      id="instructions"
                      placeholder="Ej: Tocar el timbre, segundo piso"
                      value={formData.instructions}
                      onChange={(e) =>
                        setFormData({ ...formData, instructions: e.target.value })
                      }
                      rows={3}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Método de pago *</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) =>
                        setFormData({ ...formData, paymentMethod: value })
                      }
                      disabled={loading}
                    >
                      <SelectTrigger id="paymentMethod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="card">Tarjeta</SelectItem>
                        <SelectItem value="yape">Yape</SelectItem>
                        <SelectItem value="plin">Plin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Confirmar pedido'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">{cart.restaurant.name}</p>
                  <div className="space-y-1">
                    {cart.items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span>
                          S/ {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

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

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Tiempo estimado: {cart.restaurant.delivery_time_min} min
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
