import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Users,
  PackageSearch,
  ChevronRight,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-pink-600 text-white py-2">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
          <Shield className="h-4 w-4" />
          <p className="text-sm font-semibold">MODO ADMINISTRADOR</p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-600">Gestiona tu plataforma de delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-orange-600">Admin</Badge>
                <p className="text-sm font-medium">{profile?.full_name || 'Admin'}</p>
              </div>
              <p className="text-xs text-gray-500">{profile?.email}</p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                Volver al Sitio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-2">
            <nav className="bg-white rounded-lg p-4 space-y-1">
              <NavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
                Dashboard
              </NavLink>
              <NavLink href="/admin/orders" icon={<ShoppingBag className="h-4 w-4" />}>
                Pedidos
              </NavLink>
              <NavLink href="/admin/restaurants" icon={<Store className="h-4 w-4" />}>
                Restaurantes
              </NavLink>
              <NavLink href="/admin/products" icon={<PackageSearch className="h-4 w-4" />}>
                Productos
              </NavLink>
              <NavLink href="/admin/users" icon={<Users className="h-4 w-4" />}>
                Usuarios
              </NavLink>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="min-h-[600px]">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

function NavLink({
  href,
  icon,
  children
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors group"
    >
      {icon}
      <span className="flex-1">{children}</span>
      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  )
}
