'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/lib/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Order = {
  id: string
  created_at: string
  status: string
  total: number
  delivery_address: string
  profiles: {
    full_name: string | null
    email: string
  } | null
  restaurants: {
    name: string
  } | null
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  { value: 'preparing', label: 'Preparando', color: 'bg-purple-100 text-purple-800' },
  { value: 'in_transit', label: 'En camino', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Entregado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchOrders() {
    try {
      // Fetch orders with user_id and restaurant_id
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, status, total, delivery_address, user_id, restaurant_id')
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')

      // Fetch restaurants
      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('id, name')

      // Manually join the data
      const ordersWithRelations = (ordersData || []).map((order) => {
        const profile = profilesData?.find((p) => p.id === order.user_id)
        const restaurant = restaurantsData?.find((r) => r.id === order.restaurant_id)

        return {
          ...order,
          profiles: profile ? { full_name: profile.full_name, email: profile.email } : null,
          restaurants: restaurant ? { name: restaurant.name } : null,
        }
      })

      setOrders(ordersWithRelations as Order[])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdating(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: 'Estado actualizado',
        description: 'El estado del pedido se ha actualizado correctamente',
      })

      await fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestión de Pedidos</h2>
          <p className="text-gray-600">Administra todos los pedidos de la plataforma</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {orders.length} pedidos
        </Badge>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Restaurante</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No hay pedidos registrados
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {new Date(order.created_at).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {order.profiles?.full_name || 'Usuario'}
                      </p>
                      <p className="text-sm text-gray-500">{order.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{order.restaurants?.name || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {order.delivery_address}
                  </TableCell>
                  <TableCell className="font-semibold">
                    S/ {parseFloat(order.total.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                      disabled={updating === order.id}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <span className={`px-2 py-1 rounded text-xs ${status.color}`}>
                              {status.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
