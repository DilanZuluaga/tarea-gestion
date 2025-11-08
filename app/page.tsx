import { createClient } from '@/lib/supabase/server'
import { RestaurantCard } from '@/components/restaurant/restaurant-card'
import { NavbarWrapper } from '@/components/layout/navbar-wrapper'
import type { Restaurant } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <NavbarWrapper />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            ¿Qué quieres comer hoy?
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubre los mejores restaurantes cerca de ti
          </p>
        </div>

        {restaurants && restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant: Restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No hay restaurantes disponibles en este momento
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
