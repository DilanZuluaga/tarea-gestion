# 🛡️ Configuración del Panel Administrativo

Este documento explica cómo configurar y usar el panel administrativo de RappiXD.

## 📋 Tabla de Contenidos

1. [Asignar Rol de Admin](#asignar-rol-de-admin)
2. [Funcionalidades Disponibles](#funcionalidades-disponibles)
3. [Acceso al Panel](#acceso-al-panel)
4. [Guía de Uso](#guía-de-uso)

---

## 🔐 Asignar Rol de Admin

Para acceder al panel administrativo, primero debes asignar el rol de `admin` a un usuario.

### Opción 1: Desde Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Table Editor** → **profiles**
3. Encuentra el usuario al que quieres dar permisos de admin
4. Edita la fila y cambia el campo `role` de `customer` a `admin`
5. Guarda los cambios

### Opción 2: Usando SQL Editor

1. Ve a **SQL Editor** en Supabase Dashboard
2. Ejecuta el siguiente query (reemplaza el email):

```sql
-- Asignar rol de admin a un usuario por email
UPDATE profiles
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

### Opción 3: Desde el panel de usuarios (si ya eres admin)

1. Accede a `/admin/users`
2. Selecciona el rol deseado desde el dropdown

---

## 🚀 Funcionalidades Disponibles

El panel administrativo incluye 7 módulos principales:

### 1. **Dashboard** (`/admin`)
- **Descripción**: Resumen general de la plataforma
- **Métricas mostradas**:
  - Total de pedidos, restaurantes, productos y usuarios
  - Ingresos y pedidos del día
  - Últimos 5 pedidos realizados

### 2. **Gestión de Pedidos** (`/admin/orders`)
- **Descripción**: Administración del ciclo de vida de los pedidos
- **Funcionalidades**:
  - Ver todos los pedidos en tiempo real
  - Actualizar estado de pedidos (pendiente → entregado)
  - Filtrar y buscar pedidos
  - Información detallada: cliente, restaurante, dirección, total
- **Estados disponibles**:
  - ⏳ Pendiente
  - ✅ Confirmado
  - 👨‍🍳 Preparando
  - 🚚 En camino
  - ✔️ Entregado
  - ❌ Cancelado

### 3. **Gestión de Restaurantes** (`/admin/restaurants`)
- **Descripción**: Control de restaurantes de la plataforma
- **Funcionalidades**:
  - **Toggle de activación**: Activar/desactivar restaurantes
  - **Crear**: Agregar nuevos restaurantes
  - **Editar**: Modificar información existente
  - **Eliminar**: Borrar restaurantes (solo si no tienen productos)
- **Campos editables**:
  - Nombre, descripción, dirección, teléfono
  - Imagen (URL)
  - Categorías (separadas por comas)
  - Costo de delivery, tiempo estimado
  - Pedido mínimo, rating

### 4. **Gestión de Productos** (`/admin/products`)
- **Descripción**: Administración del catálogo de productos
- **Funcionalidades**:
  - **Toggle de disponibilidad**: Marcar productos como disponibles/agotados
  - **Filtrar por restaurante**: Ver productos de un restaurante específico
  - **Crear**: Agregar nuevos productos
  - **Editar**: Modificar productos existentes
  - **Eliminar**: Borrar productos (solo si no están en pedidos)
- **Campos editables**:
  - Nombre, descripción, categoría
  - Precio, imagen (URL)
  - Restaurante asociado
  - Disponibilidad

### 5. **Gestión de Usuarios** (`/admin/users`)
- **Descripción**: Administración de usuarios y roles
- **Funcionalidades**:
  - Ver todos los usuarios registrados
  - Asignar/cambiar roles
  - Ver número de pedidos por usuario
  - Información de contacto
- **Roles disponibles**:
  - 👤 **Cliente**: Usuario estándar
  - 🛡️ **Admin**: Acceso total al panel
  - 🍽️ **Dueño de Restaurante**: (Para futuras implementaciones)

---

## 🔑 Acceso al Panel

### Para Usuarios Admin

1. **Inicia sesión** con tu cuenta
2. Haz clic en tu **avatar** en la esquina superior derecha
3. Verás la opción **"Panel Admin"** (icono de escudo 🛡️)
4. Click en **Panel Admin** para acceder al dashboard

### URL Directa

Si ya estás autenticado como admin, puedes acceder directamente a:
```
http://localhost:3000/admin
```

### Protección de Rutas

El middleware automáticamente:
- ✅ Permite el acceso si tienes rol `admin`
- ❌ Redirige a la home si no eres admin
- 🔐 Redirige al login si no estás autenticado

---

## 📖 Guía de Uso

### Crear un Nuevo Restaurante

1. Ve a **Gestión de Restaurantes** (`/admin/restaurants`)
2. Click en **"Nuevo Restaurante"**
3. Completa el formulario:
   - Campos obligatorios: Nombre, Dirección, Costo delivery, Tiempo, Pedido mínimo
   - Campos opcionales: Descripción, Teléfono, Imagen, Categorías, Rating
4. Activa/desactiva el switch de **Estado** según necesites
5. Click en **"Crear Restaurante"**

### Crear un Nuevo Producto

1. Ve a **Gestión de Productos** (`/admin/products`)
2. Click en **"Nuevo Producto"**
3. Completa el formulario:
   - **Selecciona el restaurante** (obligatorio)
   - Nombre y Categoría (obligatorios)
   - Precio (obligatorio)
   - Descripción e Imagen (opcionales)
   - Toggle de disponibilidad
4. Click en **"Crear Producto"**

### Actualizar Estado de un Pedido

1. Ve a **Gestión de Pedidos** (`/admin/orders`)
2. Encuentra el pedido en la lista
3. Click en el **dropdown de estado**
4. Selecciona el nuevo estado
5. El cambio se guarda automáticamente
6. Los clientes verán el cambio en tiempo real

### Activar/Desactivar Restaurantes o Productos

1. Ve a la sección correspondiente
2. Usa el **switch toggle** en la columna "Estado" o "Disponibilidad"
3. El cambio se guarda automáticamente
4. Los restaurantes/productos inactivos no aparecen en la app

### Editar Restaurante o Producto

1. Ve a la lista de restaurantes o productos
2. Click en el **icono de lápiz** (✏️) en la columna "Acciones"
3. Modifica los campos necesarios
4. Click en **"Actualizar"**

### Eliminar Restaurante o Producto

1. Ve a la lista de restaurantes o productos
2. Click en el **icono de papelera** (🗑️) en la columna "Acciones"
3. Confirma la eliminación en el diálogo
4. **Nota**: No se pueden eliminar si tienen relaciones activas:
   - Restaurantes con productos
   - Productos en pedidos existentes

### Promover Usuario a Admin

1. Ve a **Gestión de Usuarios** (`/admin/users`)
2. Encuentra el usuario en la lista
3. Click en el **dropdown de rol**
4. Selecciona **"Admin"**
5. El usuario tendrá acceso inmediato al panel admin

---

## 🎨 Características de UX/UI

### Feedback Visual
- ✅ **Toasts de confirmación** en cada acción exitosa
- ❌ **Mensajes de error** claros y descriptivos
- ⏳ **Loading states** durante operaciones

### Tiempo Real
- 🔴 **Live updates** en pedidos (WebSocket)
- 🔄 **Auto-refresh** al actualizar datos

### Diseño Responsivo
- 📱 **Mobile-first**: Funciona en tablets y móviles
- 💻 **Desktop optimized**: Mejor experiencia en pantallas grandes

### Validaciones
- ✔️ **Formularios validados** con Zod
- 🚫 **Prevención de eliminaciones** con dependencias
- ⚠️ **Confirmaciones** antes de acciones destructivas

---

## 🔧 Notas Técnicas

### Base de Datos

La migración `add_role_to_profiles` creó:
- Campo `role` en tabla `profiles` (customer | admin | restaurant_owner)
- Índice en `role` para queries rápidas
- Políticas RLS para acceso admin a todas las tablas

### Arquitectura

- **Server Components**: Dashboard, layouts
- **Client Components**: Formularios, tablas interactivas
- **Server Actions**: Todas las mutaciones de datos
- **Realtime**: Suscripciones para actualización en vivo

### Seguridad

- ✅ Validación en servidor con Zod
- ✅ RLS policies en Supabase
- ✅ Middleware de autenticación
- ✅ Verificación de rol en cada request

---

## 🐛 Troubleshooting

### No veo la opción "Panel Admin"
- Verifica que tu rol en la base de datos sea `admin`
- Cierra sesión y vuelve a iniciar
- Limpia caché del navegador

### Error al crear/editar
- Verifica que todos los campos obligatorios estén llenos
- Revisa que las URLs de imágenes sean válidas
- Comprueba que no haya errores en consola

### No puedo eliminar un restaurante/producto
- Verifica que no tenga productos asociados (restaurantes)
- Verifica que no esté en pedidos (productos)
- Primero elimina las dependencias

---

## 📚 Próximas Mejoras

- [ ] Dashboard con gráficas de analytics
- [ ] Exportar reportes en PDF/Excel
- [ ] Notificaciones push para nuevos pedidos
- [ ] Gestión de cupones y promociones
- [ ] Subida de imágenes directa (no solo URLs)
- [ ] Roles granulares con permisos específicos
- [ ] Logs de auditoría de cambios

---

## 💡 Consejos

1. **Prueba primero**: Usa datos de prueba antes de producción
2. **Backups**: Siempre ten respaldos de la BD antes de eliminaciones masivas
3. **Comunicación**: Avisa a los usuarios si desactivas restaurantes populares
4. **Monitoreo**: Revisa el dashboard regularmente para detectar problemas
5. **Actualizaciones**: Mantén los estados de pedidos actualizados para mejor experiencia

---

## 🆘 Soporte

Si encuentras algún problema o tienes sugerencias:
1. Revisa los logs de consola del navegador
2. Verifica los logs de Supabase
3. Abre un issue en el repositorio
4. Contacta al equipo de desarrollo

---

**¡Listo para administrar tu plataforma de delivery! 🚀**
