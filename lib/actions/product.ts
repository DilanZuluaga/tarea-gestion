'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  category: z.string().min(1, 'La categoría es requerida'),
  restaurant_id: z.string().uuid('ID de restaurante inválido'),
  image_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  is_available: z.boolean().default(true),
})

export type ProductFormData = z.infer<typeof productSchema>

export async function createProduct(data: ProductFormData) {
  try {
    const validated = productSchema.parse(data)
    const supabase = await createClient()

    const { error } = await supabase
      .from('products')
      .insert([{
        ...validated,
        image_url: validated.image_url || null,
        description: validated.description || null,
      }])

    if (error) throw error

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Error al crear el producto' }
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  try {
    const validated = productSchema.parse(data)
    const supabase = await createClient()

    const { error } = await supabase
      .from('products')
      .update({
        ...validated,
        image_url: validated.image_url || null,
        description: validated.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Error al actualizar el producto' }
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabase = await createClient()

    // Check if product is in any orders
    const { count } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', id)

    if (count && count > 0) {
      return {
        success: false,
        error: 'No se puede eliminar un producto que está en pedidos existentes.'
      }
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Error al eliminar el producto' }
  }
}
