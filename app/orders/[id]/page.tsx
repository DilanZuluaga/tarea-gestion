'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, CreditCard, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderTimeline } from '@/components/order/order-timeline'
import { useRealtimeOrder } from '@/lib/hooks/use-realtime-order'
import type { OrderStatus } from '@/lib/types'

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  in_transit: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { order, loading } = useRealtimeOrder(params.id as string)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pedido no encontrado</h1>
          <Button onClick={() => router.push('/orders')}>
            Ver mis pedidos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/orders')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a mis pedidos
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Pedido #{order.id.slice(0, 8)}
            </h1>
            <p className="text-muted-foreground">
              {new Date(order.created_at || '').toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
            {statusLabels[order.status] || order.status}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Order Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Seguimiento del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline currentStatus={order.status as OrderStatus} />

              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <Clock className="h-5 w-5" />
                    <p className="font-medium">
                      Tiempo estimado: {order.restaurant.delivery_time_min} min
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Restaurant */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold mb-1">{order.restaurant.name}</p>
                <p className="text-sm text-muted-foreground">
                  {order.restaurant.address}
                </p>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Dirección</p>
                    <p className="text-sm text-muted-foreground">
                      {order.delivery_address}
                    </p>
                  </div>
                </div>

                {order.delivery_instructions && (
                  <div>
                    <p className="font-medium mb-1 text-sm">Instrucciones</p>
                    <p className="text-sm text-muted-foreground">
                      {order.delivery_instructions}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Método de pago</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {order.payment_method}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.product?.name || 'Producto'}
                      </span>
                      <span>S/ {item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>S/ {order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>S/ {order.delivery_fee.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>S/ {order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
