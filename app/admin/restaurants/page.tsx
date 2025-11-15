'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { Star, MapPin, Clock, Plus, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { deleteRestaurant } from '@/lib/actions/restaurant'

type Restaurant = {
  id: string
  name: string
  description: string | null
  address: string
  rating: number
  delivery_time_min: number
  delivery_fee: number
  minimum_order: number
  is_active: boolean
  categories: string[] | null
}

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchRestaurants()
  }, [])

  async function fetchRestaurants() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name')

      if (error) throw error
      setRestaurants(data || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los restaurantes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(restaurantId: string, currentStatus: boolean) {
    setUpdating(restaurantId)
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', restaurantId)

      if (error) throw error

      toast({
        title: 'Estado actualizado',
        description: `Restaurante ${!currentStatus ? 'activado' : 'desactivado'} correctamente`,
      })

      await fetchRestaurants()
    } catch (error) {
      console.error('Error updating restaurant:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del restaurante',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  async function handleDelete(restaurantId: string, restaurantName: string) {
    if (!confirm(`¿Estás seguro de eliminar "${restaurantName}"?`)) {
      return
    }

    setDeleting(restaurantId)
    try {
      const result = await deleteRestaurant(restaurantId)

      if (result.success) {
        toast({
          title: 'Restaurante eliminado',
          description: 'El restaurante se ha eliminado correctamente',
        })
        await fetchRestaurants()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el restaurante',
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
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

  const activeCount = restaurants.filter((r) => r.is_active).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestión de Restaurantes</h2>
          <p className="text-gray-600">Administra la disponibilidad de restaurantes</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {activeCount} activos
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {restaurants.length} total
          </Badge>
          <Link href="/admin/restaurants/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Restaurante
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurante</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Pedido Mín.</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No hay restaurantes registrados
                </TableCell>
              </TableRow>
            ) : (
              restaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-sm text-gray-500 max-w-xs truncate">
                        {restaurant.description || 'Sin descripción'}
                      </p>
                      {restaurant.categories && restaurant.categories.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {restaurant.categories.slice(0, 2).map((cat, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="max-w-xs truncate">{restaurant.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{restaurant.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{restaurant.delivery_time_min} min</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        S/ {parseFloat(restaurant.delivery_fee.toString()).toFixed(2)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    S/ {parseFloat(restaurant.minimum_order.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={restaurant.is_active}
                        onCheckedChange={() => toggleActive(restaurant.id, restaurant.is_active)}
                        disabled={updating === restaurant.id}
                      />
                      <span className={`text-sm font-medium ${restaurant.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                        {restaurant.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/restaurants/edit/${restaurant.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(restaurant.id, restaurant.name)}
                        disabled={deleting === restaurant.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
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
