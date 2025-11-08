import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa a tu cuenta de RappiXD
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <OAuthButtons />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>

          <LoginForm />

          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿No tienes una cuenta? </span>
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
