# ✅ Checklist de Configuración Inicial

Sigue estos pasos para tener Marnie Díaz funcionando completamente.

## Fase 1: Crear Proyecto Supabase

- [ ] Crear cuenta en [supabase.com](https://supabase.com)
- [ ] Crear nuevo proyecto con nombre: `marnie-diaz-odonto`
- [ ] Guardar la **contraseña de base de datos** en lugar seguro
- [ ] Esperar a que el proyecto esté "Ready"

## Fase 2: Configurar Base de Datos

- [ ] Abre **SQL Editor** en Supabase Dashboard
- [ ] Haz clic en **"New Query"**
- [ ] Abre el archivo `schema.sql` del proyecto
- [ ] Copia TODO el contenido y pégalo en el SQL Editor
- [ ] Haz clic en **"RUN"** o presiona `Ctrl+Enter`
- [ ] Espera a que se ejecute sin errores ✅

### Verificación
En **Table Editor**, deberías ver estas tablas:
- [ ] `pacientes`
- [ ] `citas`
- [ ] `procedimientos`
- [ ] `pagos`
- [ ] `odontograma`
- [ ] `fichas_clinicas`

## Fase 3: Obtener Credenciales

- [ ] Ve a **Settings → API** en Supabase Dashboard
- [ ] Copia **Project URL** (comienza con `https://`)
- [ ] Copia **anon public** key (comienza con `eyJh...`)

**Importante**: Nunca compartas estas credenciales públicamente

## Fase 4: Configurar Variables de Entorno

- [ ] En la raíz del proyecto, crea archivo `.env.local`
- [ ] Agrega estas líneas:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- [ ] Reemplaza con tus valores reales (sin espacios)
- [ ] **NO commits esto** — `.env.local` está en `.gitignore`

## Fase 5: Configurar Autenticación

### Habilitar Email/Password
- [ ] Ve a **Authentication → Providers**
- [ ] Confirma que **Email** esté habilitado
- [ ] Si necesitas confirmar email: ve a **Settings → Email**

### Crear Usuario Admin
- [ ] Ve a **Authentication → Users**
- [ ] Haz clic en **"Invite user"**
- [ ] Email: `admin@tuempresa.com` (tu email actual)
- [ ] Haz clic en **"Send invite"**
- [ ] En desarrollo, acepta la invitación automáticamente o:
  - [ ] Desactiva "Confirm email" en Settings → Email para pruebas sin verificación

## Fase 6: Instalar Dependencias Locales

```bash
npm install
```

- [ ] Confirma que completó sin errores

## Fase 7: Iniciar Desarrollo

```bash
npm run dev
```

- [ ] La app abre en `http://localhost:5173`
- [ ] Si ves "Modo Demo" en la esquina, las credenciales no están configuradas correctamente

## Fase 8: Prueba de Login

- [ ] Ve a **http://localhost:5173**
- [ ] Haz clic en "Ir al Dashboard" o "Login"
- [ ] Usa las credenciales creadas (email y contraseña)
- [ ] ✅ Deberías entrar al Dashboard

## Fase 9: Cargar Datos de Prueba (Opcional)

Si quieres pacientes de ejemplo:

- [ ] En Supabase SQL Editor → New Query
- [ ] Ejecuta el script de datos en `SUPABASE_SETUP.md` (sección "Datos de Demostración")
- [ ] Deberías ver 3 pacientes en Pacientes → Listado

## Fase 10: Configurar Auth0 (Opcional - Para Autenticación Avanzada)

Si quieres login con Google/GitHub:

- [ ] Crea aplicación en Auth0 / Google Cloud / GitHub
- [ ] Obtén Client ID y Client Secret
- [ ] En Supabase → Authentication → Providers
- [ ] Configura el provider elegido
- [ ] Añade URLs de callback

## ✨ ¡Listo!

Ahora tienes:
- ✅ Base de datos configurada
- ✅ Autenticación funcionando
- ✅ App corriendo en desarrollo
- ✅ Dashboard con KPIs
- ✅ Formularios de Pacientes, Citas, Procedimientos, etc.

## 🆘 Si Algo No Funciona

### "Modo Demo" está activo
- [ ] Verifica que `.env.local` existe en la raíz
- [ ] Verifica valores de `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- [ ] Recarga el navegador (`Cmd+Shift+R` o `Ctrl+Shift+R`)

### "Invalid API key"
- [ ] Copia nuevamente desde Settings → API
- [ ] Asegúrate usar **anon public** (no service_role)
- [ ] No hay espacios al inicio o final

### Tablas no existen
- [ ] En SQL Editor, ejecuta nuevamente `schema.sql`
- [ ] En Table Editor, haz clic en "Refresh"

### Login no funciona
- [ ] Confirma que creaste usuario en Authentication → Users
- [ ] Verifica email y contraseña son correctos
- [ ] Si requiere verificación: revisa spam email

## 📞 Links Útiles

- [Documentación Supabase](https://supabase.com/docs)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/tables)
- [Authentication Setup](https://supabase.com/docs/guides/auth)
- [Repositorio GitHub](https://github.com/A13XMC11/marnie_diaz_web)

---

**Última actualización**: 2024
**Estado**: ✅ Listo para producción (con configuración de seguridad adicional)
