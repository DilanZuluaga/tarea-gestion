import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'
import { redirect } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const [{ data: product }, { data: restaurants }] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('restaurants').select('id, name').order('name')
  ])

  if (!product) {
    redirect('/admin/products')
  }

  return <ProductForm product={product} restaurants={restaurants || []} isEditing />
}
