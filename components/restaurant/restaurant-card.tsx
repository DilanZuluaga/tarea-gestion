import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Star, Bike } from 'lucide-react'
import type { Restaurant } from '@/lib/types'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative h-48 w-full bg-gradient-to-br from-orange-100 to-pink-100">
          {restaurant.image_url && (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          )}
          {restaurant.rating && (
            <Badge className="absolute top-2 right-2 bg-white text-black">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
              {restaurant.rating}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {restaurant.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {restaurant.categories?.slice(0, 3).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{restaurant.delivery_time_min} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Bike className="w-4 h-4" />
              <span>S/ {restaurant.delivery_fee?.toFixed(2)}</span>
            </div>
          </div>

          {restaurant.minimum_order && restaurant.minimum_order > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Pedido mínimo: S/ {restaurant.minimum_order.toFixed(2)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
