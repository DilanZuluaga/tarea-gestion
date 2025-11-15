import { createClient } from '@/lib/supabase/server'
import { RestaurantForm } from '@/components/admin/restaurant-form'
import { redirect } from 'next/navigation'

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !restaurant) {
    redirect('/admin/restaurants')
  }

  return <RestaurantForm restaurant={restaurant} isEditing />
}
