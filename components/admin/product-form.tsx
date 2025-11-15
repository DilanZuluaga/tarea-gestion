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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/lib/hooks/use-toast'
import { createProduct, updateProduct, type ProductFormData } from '@/lib/actions/product'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.string().min(1, 'El precio es requerido'),
  category: z.string().min(1, 'La categoría es requerida'),
  restaurant_id: z.string().min(1, 'Selecciona un restaurante'),
  image_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  is_available: z.boolean().default(true),
})

type FormData = z.infer<typeof formSchema>

type Props = {
  product?: any
  restaurants: Array<{ id: string; name: string }>
  isEditing?: boolean
}

export function ProductForm({ product, restaurants, isEditing = false }: Props) {
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
    defaultValues: product ? {
      name: product.name,
      description: product.description || '',
      price: product.price?.toString() || '0',
      category: product.category || '',
      restaurant_id: product.restaurant_id,
      image_url: product.image_url || '',
      is_available: product.is_available ?? true,
    } : {
      name: '',
      description: '',
      price: '0',
      category: '',
      restaurant_id: '',
      image_url: '',
      is_available: true,
    },
  })

  const isAvailable = watch('is_available')
  const selectedRestaurant = watch('restaurant_id')

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    try {
      const productData: ProductFormData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        restaurant_id: data.restaurant_id,
        image_url: data.image_url,
        is_available: data.is_available,
      }

      const result = isEditing
        ? await updateProduct(product.id, productData)
        : await createProduct(productData)

      if (result.success) {
        toast({
          title: isEditing ? 'Producto actualizado' : 'Producto creado',
          description: `El producto se ha ${isEditing ? 'actualizado' : 'creado'} correctamente`,
        })
        router.push('/admin/products')
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
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <p className="text-gray-600">
            {isEditing ? 'Modifica los datos del producto' : 'Completa el formulario para agregar un nuevo producto'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="restaurant_id">Restaurante *</Label>
              <Select
                value={selectedRestaurant}
                onValueChange={(value) => setValue('restaurant_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un restaurante" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.restaurant_id && (
                <p className="text-sm text-red-600">{errors.restaurant_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Pizza Margarita"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="Pizza, Bebida, Postre, etc."
                />
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe el producto..."
                rows={3}
              />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (S/) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price')}
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Disponibilidad</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={isAvailable}
                    onCheckedChange={(checked) => setValue('is_available', checked)}
                  />
                  <span className="text-sm font-medium">
                    {isAvailable ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Actualizar' : 'Crear'} Producto
          </Button>
        </div>
      </form>
    </div>
  )
}
