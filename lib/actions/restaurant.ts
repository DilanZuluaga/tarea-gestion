'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const restaurantSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  address: z.string().min(1, 'La dirección es requerida'),
  phone: z.string().optional(),
  image_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  categories: z.array(z.string()).default([]),
  delivery_fee: z.number().min(0, 'La tarifa debe ser mayor o igual a 0'),
  delivery_time_min: z.number().min(0, 'El tiempo debe ser mayor a 0'),
  minimum_order: z.number().min(0, 'El monto mínimo debe ser mayor o igual a 0'),
  rating: z.number().min(0).max(5).default(0),
  is_active: z.boolean().default(true),
})

export type RestaurantFormData = z.infer<typeof restaurantSchema>

export async function createRestaurant(data: RestaurantFormData) {
  try {
    const validated = restaurantSchema.parse(data)
    const supabase = await createClient()

    const { error } = await supabase
      .from('restaurants')
      .insert([{
        ...validated,
        image_url: validated.image_url || null,
        description: validated.description || null,
        phone: validated.phone || null,
      }])

    if (error) throw error

    revalidatePath('/admin/restaurants')
    return { success: true }
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return { success: false, error: 'Error al crear el restaurante' }
  }
}

export async function updateRestaurant(id: string, data: RestaurantFormData) {
  try {
    const validated = restaurantSchema.parse(data)
    const supabase = await createClient()

    const { error } = await supabase
      .from('restaurants')
      .update({
        ...validated,
        image_url: validated.image_url || null,
        description: validated.description || null,
        phone: validated.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/restaurants')
    return { success: true }
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return { success: false, error: 'Error al actualizar el restaurante' }
  }
}

export async function deleteRestaurant(id: string) {
  try {
    const supabase = await createClient()

    // Check if restaurant has products
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', id)

    if (count && count > 0) {
      return {
        success: false,
        error: 'No se puede eliminar un restaurante con productos. Elimina los productos primero.'
      }
    }

    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/restaurants')
    return { success: true }
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return { success: false, error: 'Error al eliminar el restaurante' }
  }
}
