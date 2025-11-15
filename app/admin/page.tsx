import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { ShoppingBag, Store, Package, Users, TrendingUp, DollarSign } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: totalOrders },
    { count: totalRestaurants },
    { count: totalProducts },
    { count: totalUsers },
    { data: todayOrders },
    { data: recentOrders }
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('restaurants').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('total')
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase
      .from('orders')
      .select('*, restaurants(name), profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const todayRevenue = todayOrders?.reduce((sum, order) => sum + parseFloat(order.total as string), 0) || 0
  const todayOrderCount = todayOrders?.length || 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-600">Resumen general de la plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pedidos"
          value={totalOrders || 0}
          icon={<ShoppingBag className="h-5 w-5" />}
          trend="+12%"
          trendUp
        />
        <StatCard
          title="Restaurantes"
          value={totalRestaurants || 0}
          icon={<Store className="h-5 w-5" />}
        />
        <StatCard
          title="Productos"
          value={totalProducts || 0}
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Usuarios"
          value={totalUsers || 0}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ingresos Hoy</p>
              <p className="text-2xl font-bold">S/ {todayRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pedidos Hoy</p>
              <p className="text-2xl font-bold">{todayOrderCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pedidos Recientes</h3>
        <div className="space-y-3">
          {recentOrders && recentOrders.length > 0 ? (
            recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{order.restaurants?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    {order.profiles?.full_name || order.profiles?.email || 'Usuario'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">S/ {parseFloat(order.total as string).toFixed(2)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No hay pedidos registrados</p>
          )}
        </div>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp
}: {
  title: string
  value: number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold">{value}</p>
        {trend && (
          <span className={`text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    in_transit: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const labels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    in_transit: 'En camino',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  )
}
