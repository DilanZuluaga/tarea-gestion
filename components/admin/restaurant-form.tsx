'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { useToast } from '@/lib/hooks/use-toast'
import { createRestaurant, updateRestaurant, type RestaurantFormData } from '@/lib/actions/restaurant'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  address: z.string().min(1, 'La dirección es requerida'),
  phone: z.string().optional(),
  image_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  categories: z.string(),
  delivery_fee: z.string().min(1, 'Requerido'),
  delivery_time_min: z.string().min(1, 'Requerido'),
  minimum_order: z.string().min(1, 'Requerido'),
  rating: z.string().optional(),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

type Props = {
  restaurant?: any
  isEditing?: boolean
}

export function RestaurantForm({ restaurant, isEditing = false }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: restaurant ? {
      name: restaurant.name,
      description: restaurant.description || '',
      address: restaurant.address,
      phone: restaurant.phone || '',
      image_url: restaurant.image_url || '',
      categories: restaurant.categories?.join(', ') || '',
      delivery_fee: restaurant.delivery_fee?.toString() || '0',
      delivery_time_min: restaurant.delivery_time_min?.toString() || '30',
      minimum_order: restaurant.minimum_order?.toString() || '0',
      rating: restaurant.rating?.toString() || '0',
      is_active: restaurant.is_active ?? true,
    } : {
      name: '',
      description: '',
      address: '',
      phone: '',
      image_url: '',
      categories: '',
      delivery_fee: '5',
      delivery_time_min: '30',
      minimum_order: '15',
      rating: '0',
      is_active: true,
    },
  })

  const isActive = watch('is_active')

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    try {
      const restaurantData: RestaurantFormData = {
        name: data.name,
        description: data.description,
        address: data.address,
        phone: data.phone,
        image_url: data.image_url,
        categories: data.categories
          ? data.categories.split(',').map(c => c.trim()).filter(c => c.length > 0)
          : [],
        delivery_fee: parseFloat(data.delivery_fee),
        delivery_time_min: parseInt(data.delivery_time_min),
        minimum_order: parseFloat(data.minimum_order),
        rating: data.rating ? parseFloat(data.rating) : 0,
        is_active: data.is_active,
      }

      const result = isEditing
        ? await updateRestaurant(restaurant.id, restaurantData)
        : await createRestaurant(restaurantData)

      if (result.success) {
        toast({
          title: isEditing ? 'Restaurante actualizado' : 'Restaurante creado',
          description: `El restaurante se ha ${isEditing ? 'actualizado' : 'creado'} correctamente`,
        })
        router.push('/admin/restaurants')
        router.refresh()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/restaurants">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold">
            {isEditing ? 'Editar Restaurante' : 'Nuevo Restaurante'}
          </h2>
          <p className="text-gray-600">
            {isEditing ? 'Modifica los datos del restaurante' : 'Completa el formulario para agregar un nuevo restaurante'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Pizza Italia"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+51 999 999 999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Las mejores pizzas artesanales de la ciudad..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Av. Larco 1234, Miraflores"
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de Imagen</Label>
              <Input
                id="image_url"
                {...register('image_url')}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {errors.image_url && (
                <p className="text-sm text-red-600">{errors.image_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categories">Categorías (separadas por comas)</Label>
              <Input
                id="categories"
                {...register('categories')}
                placeholder="Pizza, Italiana, Pasta"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="delivery_fee">Costo de Delivery (S/) *</Label>
                <Input
                  id="delivery_fee"
                  type="number"
                  step="0.01"
                  {...register('delivery_fee')}
                />
                {errors.delivery_fee && (
                  <p className="text-sm text-red-600">{errors.delivery_fee.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_time_min">Tiempo de Delivery (min) *</Label>
                <Input
                  id="delivery_time_min"
                  type="number"
                  {...register('delivery_time_min')}
                />
                {errors.delivery_time_min && (
                  <p className="text-sm text-red-600">{errors.delivery_time_min.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum_order">Pedido Mínimo (S/) *</Label>
                <Input
                  id="minimum_order"
                  type="number"
                  step="0.01"
                  {...register('minimum_order')}
                />
                {errors.minimum_order && (
                  <p className="text-sm text-red-600">{errors.minimum_order.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...register('rating')}
                />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => setValue('is_active', checked)}
                  />
                  <span className="text-sm font-medium">
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/restaurants">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Actualizar' : 'Crear'} Restaurante
          </Button>
        </div>
      </form>
    </div>
  )
}
