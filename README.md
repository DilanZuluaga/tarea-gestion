# RappiXD - Aplicación de Delivery

Aplicación web tipo Rappi construida con Next.js 15, Supabase y shadcn/ui.

## Características Principales

- Autenticación con Supabase Auth (Email/Password + OAuth con Google y GitHub)
- Catálogo de restaurantes y productos
- Sistema de carrito de compras con persistencia en localStorage
- Checkout y creación de pedidos
- Seguimiento de pedidos en tiempo real con Supabase Realtime
- Auto-progresión simulada de estados de pedidos con Edge Functions
- UI moderna y responsiva con shadcn/ui y Tailwind CSS

## Tecnologías Utilizadas

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **UI:** shadcn/ui, Tailwind CSS
- **Gestión de paquetes:** Yarn

## Requisitos Previos

- Node.js 18+ instalado
- Yarn instalado globalmente
- Cuenta de Supabase (ya configurada)

## Instalación

1. Las dependencias ya están instaladas, pero si necesitas reinstalar:
```bash
yarn install
```

2. Las variables de entorno ya están configuradas en `.env.local`

## Ejecutar el Proyecto

Para iniciar el servidor de desarrollo:

```bash
yarn dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Otros Comandos

```bash
# Construir para producción
yarn build

# Iniciar en modo producción
yarn start

# Linting
yarn lint
```

## Estructura del Proyecto

```
rappi-xd/
├── app/                    # Páginas de Next.js (App Router)
│   ├── (auth)/            # Rutas de autenticación
│   │   ├── login/
│   │   └── signup/
│   ├── restaurant/[id]/   # Detalle de restaurante
│   ├── cart/              # Carrito de compras
│   ├── checkout/          # Proceso de pago
│   ├── orders/            # Lista y detalle de pedidos
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── ui/               # Componentes de shadcn/ui
│   ├── auth/             # Componentes de autenticación
│   ├── cart/             # Componentes del carrito
│   ├── layout/           # Componentes de layout (Navbar)
│   ├── order/            # Componentes de pedidos
│   ├── product/          # Componentes de productos
│   └── restaurant/       # Componentes de restaurantes
├── lib/                   # Utilidades y configuración
│   ├── hooks/            # Custom React hooks
│   ├── supabase/         # Configuración de Supabase
│   ├── types/            # Tipos de TypeScript
│   └── utils.ts          # Funciones de utilidad
└── middleware.ts          # Middleware de autenticación

## Base de Datos

### Tablas Creadas

- `profiles` - Perfiles de usuario
- `restaurants` - Restaurantes disponibles
- `products` - Productos de cada restaurante
- `orders` - Pedidos realizados
- `order_items` - Items de cada pedido
- `order_status_history` - Historial de cambios de estado

### Políticas RLS (Row Level Security)

- Los usuarios solo pueden ver y crear sus propios pedidos
- Todos pueden ver restaurantes y productos activos
- Los perfiles son privados para cada usuario

### Triggers

- Creación automática de perfil al registrarse
- Actualización de timestamps automática
- Registro de cambios de estado en el historial

## Funcionalidades

### 1. Autenticación
- Login/Signup con email y contraseña
- OAuth con Google y GitHub
- Middleware de protección de rutas

### 2. Catálogo de Restaurantes
- Visualización de restaurantes con filtros
- Información de delivery, tiempo estimado y calificaciones
- Categorización por tipo de comida

### 3. Productos y Carrito
- Vista de productos por restaurante
- Agregar/quitar productos del carrito
- Validación de pedido mínimo
- Persistencia del carrito en localStorage

### 4. Checkout
- Formulario de dirección de entrega
- Selección de método de pago
- Creación de pedido en la base de datos

### 5. Seguimiento en Tiempo Real
- Timeline visual del estado del pedido
- Actualizaciones en tiempo real con Supabase Realtime
- Historial de estados

### 6. Simulación de Estados
- Edge Function que auto-progresa los estados
- Progresión automática: pending → confirmed → preparing → in_transit → delivered
- Tiempos simulados para cada transición

## Datos de Prueba

La base de datos incluye 5 restaurantes con productos:

1. **Burger King** - Hamburguesas
2. **Pizza Italia** - Pizzas y pasta italiana
3. **Sushi Express** - Sushi y comida japonesa
4. **Tacos Locos** - Comida mexicana
5. **Pollo a la Brasa Don Luis** - Pollo a la brasa peruano

## Configuración de OAuth (Opcional)

Para habilitar OAuth con Google y GitHub:

1. Ve a tu proyecto de Supabase
2. Navega a Authentication → Providers
3. Habilita y configura los providers deseados
4. Agrega las URLs de callback: `http://localhost:3000/auth/callback`

## Edge Function (Auto-progresión)

La Edge Function `auto-progress-orders` se ejecuta automáticamente y progresa los estados de los pedidos según el tiempo transcurrido:

- **pending → confirmed:** 2 minutos
- **confirmed → preparing:** 5 minutos adicionales
- **preparing → in_transit:** 8 minutos adicionales
- **in_transit → delivered:** 15 minutos adicionales

## Licencia

Este proyecto es un prototipo educativo sin licencia específica.

## Autor

Desarrollado con Next.js, Supabase y shadcn/ui
