import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "RappiXD - Delivery App",
  description: "Delivery application prototype built with Next.js and Supabase",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
