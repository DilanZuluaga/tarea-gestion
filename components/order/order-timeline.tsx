import { Check, Clock, ChefHat, Bike, Package } from 'lucide-react'
import type { OrderStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface OrderTimelineProps {
  currentStatus: OrderStatus
}

const statusSteps: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'pending', label: 'Pedido recibido', icon: Clock },
  { status: 'confirmed', label: 'Confirmado', icon: Check },
  { status: 'preparing', label: 'Preparando', icon: ChefHat },
  { status: 'in_transit', label: 'En camino', icon: Bike },
  { status: 'delivered', label: 'Entregado', icon: Package },
]

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const currentIndex = statusSteps.findIndex((step) => step.status === currentStatus)

  return (
    <div className="relative">
      {statusSteps.map((step, index) => {
        const Icon = step.icon
        const isCompleted = index <= currentIndex
        const isActive = index === currentIndex
        const isLast = index === statusSteps.length - 1

        return (
          <div key={step.status} className="relative flex items-start pb-8 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-5 top-10 h-full w-0.5',
                  isCompleted ? 'bg-orange-500' : 'bg-gray-300'
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2',
                isCompleted
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-gray-300 bg-white text-gray-400'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="ml-4 flex-1">
              <p
                className={cn(
                  'font-medium',
                  isActive ? 'text-orange-600' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {isActive && (
                <p className="text-sm text-muted-foreground mt-1">
                  Estado actual
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
