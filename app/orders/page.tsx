'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/lib/hooks/use-user'
import type { Order } from '@/lib/types'

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

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user && !userLoading) {
      router.push('/login')
      return
    }

    const fetchOrders = async () => {
      if (!user) return

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setOrders(data)
      }

      setLoading(false)
    }

    if (user) {
      fetchOrders()
    }
  }, [user, userLoading])

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>

        <h1 className="text-3xl font-bold mb-8">Mis pedidos</h1>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <span className="font-semibold">
                            Pedido #{order.id.slice(0, 8)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at || '').toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Badge
                        className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}
                      >
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold text-lg">S/ {order.total.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No tienes pedidos aún</h2>
              <p className="text-muted-foreground mb-6 text-center">
                Cuando realices un pedido, aparecerá aquí
              </p>
              <Button onClick={() => router.push('/')}>
                Explorar restaurantes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
