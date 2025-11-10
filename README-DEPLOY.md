# 🚀 Guía de Deployment a Railway

Esta guía te llevará paso a paso para deployar tu aplicación de delivery tipo Rappi en Railway.

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener:

- ✅ Una cuenta en [Railway](https://railway.app) (puedes registrarte gratis)
- ✅ Una cuenta en [Supabase](https://supabase.com) con tu proyecto ya configurado
- ✅ Git instalado en tu máquina
- ✅ Tu código en un repositorio Git (GitHub, GitLab, o Bitbucket)

## 🗂️ Estructura de Archivos Creados

Este proyecto incluye los siguientes archivos para deployment:

- `Dockerfile` - Imagen Docker multi-stage optimizada (opcional)
- `.dockerignore` - Excluye archivos innecesarios del build
- `railway.toml` - Configuración de Railway (usa Nixpacks por defecto)
- `README-DEPLOY.md` - Esta guía

## 📝 Paso 1: Preparar las Variables de Entorno en Supabase

### 1.1 Obtener las credenciales de Supabase

1. Ve a tu [Dashboard de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia los siguientes valores:
   - **Project URL**: Tu URL de Supabase
   - **anon/public key**: Tu API Key pública

### 1.2 Configurar OAuth Providers (Opcional)

Si usas Google o GitHub login:

1. Ve a **Authentication** → **Providers**
2. Habilita Google y/o GitHub
3. Configura los Client ID y Secret de cada proveedor
4. **IMPORTANTE**: En "Redirect URLs", agrega temporalmente:
   ```
   https://your-railway-app.railway.app/auth/callback
   ```
   (Reemplazarás esto con tu URL real después del deployment)

## 🚂 Paso 2: Crear Proyecto en Railway

### 2.1 Crear nuevo proyecto

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu GitHub
5. Selecciona el repositorio de tu proyecto

### 2.2 Railway detectará automáticamente

Railway usará **Nixpacks** para detectar automáticamente que es un proyecto Next.js y configurará:
- Build command: `yarn build`
- Start command: `yarn start`
- Puerto: `3000` (configurable vía `$PORT`)

## ⚙️ Paso 3: Configurar Variables de Entorno

### 3.1 Agregar variables en Railway

1. En tu proyecto de Railway, ve a la pestaña **"Variables"**
2. Click en **"New Variable"**
3. Agrega las siguientes variables:

```bash
# REQUERIDAS - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# REQUERIDA - Site URL (usa la variable de Railway)
NEXT_PUBLIC_SITE_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# OPCIONALES - Node Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 3.2 Ejemplo de valores

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMDAwMDAsImV4cCI6MTk5NTU3NjAwMH0.ejemplo_de_token_largo
NEXT_PUBLIC_SITE_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### 3.3 Guardar y redesplegar

1. Click en **"Add"** o **"Save"** para cada variable
2. Railway automáticamente redesployará tu aplicación

## 🔗 Paso 4: Configurar OAuth Redirects en Supabase

### 4.1 Obtener tu URL de Railway

1. En Railway, ve a **"Settings"** → **"Domains"**
2. Copia tu dominio público (ej: `tu-app.up.railway.app`)

### 4.2 Actualizar Supabase

1. Ve a tu proyecto en Supabase
2. **Authentication** → **URL Configuration**
3. Agrega en **"Redirect URLs"**:
   ```
   https://tu-app.up.railway.app/auth/callback
   ```

4. En **"Site URL"**, configura:
   ```
   https://tu-app.up.railway.app
   ```

### 4.3 Actualizar OAuth Providers

Si usas Google o GitHub:

1. Ve a **Authentication** → **Providers**
2. Para cada proveedor habilitado, actualiza las Redirect URIs:
   - **Google Cloud Console**: Agrega `https://tu-app.up.railway.app/auth/callback`
   - **GitHub OAuth App**: Agrega la misma URL en "Authorization callback URL"

## ✅ Paso 5: Verificar el Deployment

### 5.1 Monitorear el build

1. En Railway, ve a la pestaña **"Deployments"**
2. Observa los logs en tiempo real
3. El build debería completarse en 2-5 minutos

### 5.2 Verificar que la app funciona

1. Click en tu dominio de Railway para abrir la app
2. Verifica que:
   - ✅ La página principal carga correctamente
   - ✅ Puedes hacer login/registro
   - ✅ Los restaurantes se muestran correctamente
   - ✅ Puedes agregar productos al carrito
   - ✅ El proceso de checkout funciona
   - ✅ Las órdenes se crean y actualizan en tiempo real

### 5.3 Comandos útiles de verificación

En la pestaña "Logs" de Railway, puedes filtrar por:
- **Build logs**: Para ver el proceso de construcción
- **Deploy logs**: Para ver errores de runtime
- **Application logs**: Para ver logs de tu aplicación

## 🐛 Troubleshooting

### Problema: "Failed to fetch" o errores de CORS

**Solución**: Verifica en Supabase:
1. Ve a **Settings** → **API**
2. En "API Settings", verifica que tu dominio de Railway esté permitido
3. Si no existe una configuración de CORS explícita, debería funcionar por defecto

### Problema: OAuth no funciona

**Solución**:
1. Verifica que agregaste la Redirect URL correcta en Supabase
2. Verifica que `NEXT_PUBLIC_SITE_URL` esté configurada correctamente
3. Verifica que los OAuth providers estén habilitados en Supabase
4. Verifica las credenciales de OAuth (Client ID, Secret)

### Problema: Variables de entorno no se aplican

**Solución**:
1. Railway require que las variables con prefijo `NEXT_PUBLIC_` estén disponibles en build time
2. Redesploya manualmente: Settings → "Redeploy"
3. Verifica en los logs que las variables se estén leyendo correctamente

### Problema: Build falla con "Module not found"

**Solución**:
1. Verifica que `yarn.lock` esté commiteado en Git
2. Verifica que todas las dependencias estén en `package.json`
3. Limpia la caché: Settings → "Clear Build Cache" → Redeploy

### Problema: App funciona pero imágenes no cargan

**Solución**:
1. Verifica `next.config.js` tiene configurado `images.remotePatterns` para Supabase
2. Verifica que las URLs de imágenes en la base de datos sean correctas
3. Verifica la configuración de Storage en Supabase (debe ser público)

### Problema: Realtime subscriptions no funcionan

**Solución**:
1. Verifica que Realtime esté habilitado en Supabase
2. Ve a **Database** → **Replication** y habilita las tablas necesarias:
   - `orders`
   - `order_status_history`
3. Verifica que las políticas de RLS permitan las suscripciones

## 🔧 Configuración Avanzada

### Usar Dockerfile en lugar de Nixpacks

Si prefieres usar Docker:

1. En Railway, ve a **Settings**
2. En "Build Configuration", selecciona **"Docker"**
3. Railway usará el `Dockerfile` incluido
4. Redeploya la aplicación

**Nota**: Nixpacks es más rápido y eficiente para Next.js.

### Configurar dominio personalizado

1. En Railway, ve a **Settings** → **Domains**
2. Click en **"Custom Domain"**
3. Agrega tu dominio (ej: `app.midominio.com`)
4. Configura el DNS según las instrucciones de Railway
5. Actualiza `NEXT_PUBLIC_SITE_URL` con tu nuevo dominio
6. Actualiza las Redirect URLs en Supabase

### Configurar múltiples ambientes

Para tener staging y production:

1. Crea dos proyectos en Railway (staging, production)
2. Usa dos proyectos de Supabase diferentes
3. Configura variables de entorno específicas para cada ambiente
4. Usa branches de Git diferentes para cada ambiente

## 📊 Monitoreo y Logs

### Ver logs en tiempo real

```bash
# Opción 1: Railway CLI
railway logs

# Opción 2: Railway Dashboard
Ve a tu proyecto → Deployments → View Logs
```

### Métricas importantes

Railway muestra automáticamente:
- CPU usage
- Memory usage
- Network traffic
- Request count
- Response times

## 🎉 ¡Deployment Exitoso!

Tu aplicación de delivery ahora está corriendo en Railway. Algunas tareas post-deployment:

- [ ] Configura un dominio personalizado
- [ ] Configura alertas de monitoring
- [ ] Habilita backups automáticos en Supabase
- [ ] Configura un ambiente de staging
- [ ] Documenta las credenciales en un password manager
- [ ] Comparte la URL con tu equipo

## 🆘 Soporte

- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Issues del proyecto**: Reporta problemas en GitHub

## 📚 Recursos Adicionales

- [Railway Templates](https://railway.app/templates)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway CLI](https://docs.railway.app/develop/cli)

---

**¿Necesitas ayuda?** Abre un issue en el repositorio del proyecto.
