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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Package, Plus, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { deleteProduct } from '@/lib/actions/product'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  is_available: boolean
  restaurant_id: string
  restaurants: {
    name: string
  } | null
}

type Restaurant = {
  id: string
  name: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [productsRes, restaurantsRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, restaurants(name)')
          .order('name'),
        supabase
          .from('restaurants')
          .select('id, name')
          .order('name')
      ])

      if (productsRes.error) throw productsRes.error
      if (restaurantsRes.error) throw restaurantsRes.error

      setProducts(productsRes.data || [])
      setRestaurants(restaurantsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function toggleAvailability(productId: string, currentStatus: boolean) {
    setUpdating(productId)
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', productId)

      if (error) throw error

      toast({
        title: 'Disponibilidad actualizada',
        description: `Producto ${!currentStatus ? 'disponible' : 'no disponible'}`,
      })

      await fetchData()
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el producto',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  async function handleDelete(productId: string, productName: string) {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"?`)) {
      return
    }

    setDeleting(productId)
    try {
      const result = await deleteProduct(productId)

      if (result.success) {
        toast({
          title: 'Producto eliminado',
          description: 'El producto se ha eliminado correctamente',
        })
        await fetchData()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el producto',
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

  const filteredProducts = selectedRestaurant === 'all'
    ? products
    : products.filter((p) => p.restaurant_id === selectedRestaurant)

  const availableCount = filteredProducts.filter((p) => p.is_available).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestión de Productos</h2>
          <p className="text-gray-600">Administra la disponibilidad de productos</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {availableCount} disponibles
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {filteredProducts.length} total
          </Badge>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filtrar por restaurante:</label>
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los restaurantes</SelectItem>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Restaurante</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Disponibilidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No hay productos para mostrar
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500 max-w-xs truncate">
                          {product.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{product.restaurants?.name || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="secondary">{product.category}</Badge>
                    ) : (
                      <span className="text-sm text-gray-400">Sin categoría</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    S/ {parseFloat(product.price.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={product.is_available}
                        onCheckedChange={() => toggleAvailability(product.id, product.is_available)}
                        disabled={updating === product.id}
                      />
                      <span className={`text-sm font-medium ${product.is_available ? 'text-green-600' : 'text-gray-400'}`}>
                        {product.is_available ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleting === product.id}
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
