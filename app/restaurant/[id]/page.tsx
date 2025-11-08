'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Star, Bike, ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/product/product-card'
import { useCart } from '@/lib/hooks/use-cart'
import { useToast } from '@/lib/hooks/use-toast'
import type { Restaurant, Product } from '@/lib/types'

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { addItem, cart, itemCount } = useCart()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchRestaurantAndProducts = async () => {
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', params.id)
        .single()

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', params.id)
        .eq('is_available', true)
        .order('category')

      setRestaurant(restaurantData)
      setProducts(productsData || [])
      setLoading(false)
    }

    fetchRestaurantAndProducts()
  }, [params.id])

  const handleAddToCart = (product: Product, quantity: number) => {
    if (!restaurant) return

    // Check if trying to add from different restaurant
    if (cart.restaurant && cart.restaurant.id !== restaurant.id && quantity > 0) {
      toast({
        title: 'Carrito de otro restaurante',
        description: 'Solo puedes ordenar de un restaurante a la vez. Tu carrito actual será vaciado.',
        variant: 'destructive',
      })
    }

    addItem(product, restaurant, quantity)
  }

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Otros'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurante no encontrado</h1>
          <Button onClick={() => router.push('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {itemCount > 0 && (
            <Button onClick={() => router.push('/cart')}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ver carrito ({itemCount})
            </Button>
          )}
        </div>
      </div>

      {/* Restaurant Header */}
      <div className="relative h-64 w-full bg-gradient-to-br from-orange-100 to-pink-100">
        {restaurant.image_url && (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-white/90 mb-3">{restaurant.description}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              {restaurant.categories?.map((category) => (
                <Badge key={category} variant="secondary" className="bg-white/20 text-white border-white/30">
                  {category}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-6 text-sm">
              {restaurant.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{restaurant.rating}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{restaurant.delivery_time_min} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Bike className="w-4 h-4" />
                <span>S/ {restaurant.delivery_fee?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-8">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="space-y-4">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No hay productos disponibles en este momento
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Button for Mobile */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 md:hidden">
          <Button
            className="w-full shadow-lg"
            size="lg"
            onClick={() => router.push('/cart')}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Ver carrito ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </Button>
        </div>
      )}
    </div>
  )
}
