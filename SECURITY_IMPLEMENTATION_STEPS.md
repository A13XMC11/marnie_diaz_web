# ⚡ IMPLEMENTACIÓN INMEDIATA - Pasos Rápidos

Este documento te guía paso a paso para activar la seguridad en tu proyecto.

---

## 🔴 PASOS CRÍTICOS (Hazlos YA - 30 minutos)

### Paso 1: Rotar credenciales de Supabase ⏱️ 5 min

**¿Por qué?** Tu `.env` actual contiene claves reales expuestas en GitHub.

**Cómo hacerlo:**

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto (lufjfouekdqjxqjxqoctf)
3. Settings → API Settings
4. Haz clic en **"Rotate"** en ambas claves:
   - Anon Public Key
   - Service Role Key

5. Copia las nuevas claves

### Paso 2: Actualizar .env local ⏱️ 2 min

```bash
# Abre .env en tu editor
# REEMPLAZA con las nuevas claves de Supabase
VITE_SUPABASE_URL=https://lufjfouekdqjxqjxqoctf.supabase.co
VITE_SUPABASE_ANON_KEY=[NUEVA CLAVE ANON]
```

**NO COMMITES ESTO** - El `.gitignore` ya está configurado.

### Paso 3: Instalar dependencias ⏱️ 5 min

```bash
cd /Users/alexandermejia/Documents/Odontologia-Web

# Instalar paquetes nuevos
npm install

# Verifica que no haya errores
npm list zod
npm list @vitejs/plugin-react
```

### Paso 4: Aplicar migraciones en Supabase ⏱️ 10 min

**Opción A: Supabase Dashboard (recomendado)**

1. Ve a https://app.supabase.com → SQL Editor
2. Crea nueva query
3. Copia TODO el contenido de:
   - `supabase/migrations/security_policies.sql`
4. Ejecuta la query
5. Repite con:
   - `supabase/migrations/audit_logging.sql`

**Opción B: CLI (si tienes supabase-cli)**

```bash
supabase migration up
```

### Paso 5: Crear usuario administrador ⏱️ 5 min

**En Supabase Dashboard:**

1. Authentication → Users
2. Click "Add user"
3. Email: admin@marniediaz.com
4. Password: (algo fuerte: Abc123!@#Demo)
5. Crear usuario

**Luego asignar rol:**

1. Ve a SQL Editor
2. Ejecuta:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@marniediaz.com';
```

**¡YA ESTÁ! Tu app ahora tiene seguridad base.** 🎉

---

## 🟡 PASOS OPCIONALES (Próximos días - 1 hora)

### Paso 6: Probar en desarrollo ⏱️ 10 min

```bash
# Terminal 1: Dev server
npm run dev
# Abre http://localhost:5173

# En el login, intenta:
# Email: admin@marniediaz.com
# Password: Abc123!@#Demo

# Si falla: verifica que la BD está actualizada
```

### Paso 7: Validar formularios (Ejemplo - Pacientes) ⏱️ 15 min

Abre `src/pages/dashboard/Pacientes.tsx` y reemplaza el submit:

```typescript
// ANTES (sin validación)
const handleSave = async (data: any) => {
  await supabase.from('pacientes').insert([data])
}

// DESPUÉS (con validación)
import { validateData, pacienteSchema } from '@/lib/validation'

const handleSave = async (data: unknown) => {
  const { valid, data: validated, errors } = validateData(pacienteSchema, data)

  if (!valid) {
    setFormErrors(errors)
    return
  }

  const { error } = await supabase.from('pacientes').insert([validated])
  if (error) {
    setError(sanitizeErrorMessage(error))
  } else {
    setSuccess('Paciente guardado')
  }
}
```

Repite para otros formularios (Citas, Pagos, Procedimientos).

### Paso 8: Verificar RLS en BD ⏱️ 10 min

En Supabase SQL Editor, verifica que RLS esté habilitado:

```sql
-- Debería retornar "on" para todas las filas
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;
```

Si alguna es "off", habilítala:

```sql
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odontograma ENABLE ROW LEVEL SECURITY;
```

### Paso 9: Revisar audit logs ⏱️ 5 min

```sql
-- Ver cambios recientes
SELECT user_id, action, table_name, created_at
FROM public.audit_logs
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🟢 PASOS FUTUROS (Antes de producción - 2 horas)

### Paso 10: Implementar validación en TODOS los formularios

Archivos donde aplicar validación:
- [ ] `src/pages/dashboard/Pacientes.tsx` - pacienteSchema
- [ ] `src/pages/dashboard/Citas.tsx` - citaSchema
- [ ] `src/pages/dashboard/Pagos.tsx` - pagoSchema
- [ ] `src/pages/dashboard/fichas/FichaForm.tsx` - fichaClinicaSchema
- [ ] `src/pages/dashboard/Procedimientos.tsx` - procedimientoSchema

Patrón para cada uno:

```typescript
import { validateData, [schema] } from '@/lib/validation'
import { sanitizeErrorMessage } from '@/lib/security'

const handleSubmit = async (formData: unknown) => {
  // Validar
  const { valid, data, errors } = validateData([schema], formData)
  if (!valid) {
    setErrors(errors)
    return
  }

  // Guardar
  try {
    const { error } = await supabase
      .from('[table]')
      .insert([data])
    if (error) throw error
    setSuccess('Guardado exitosamente')
  } catch (err) {
    setError(sanitizeErrorMessage(err))
  }
}
```

### Paso 11: Proteger rutas por rol

En el Dashboard, agregar protección:

```typescript
import { useAuth } from '@/hooks/useAuth'

export default function Dashboard() {
  const { role, hasPermission, loading } = useAuth()

  if (loading) return <Loading />
  if (!hasPermission('view_all_patients')) {
    return <AccessDenied />
  }

  return <PatientsList />
}
```

### Paso 12: Deploy a producción

```bash
# 1. Verificar que todo está seguro
npm run build

# 2. Deploy (ejemplo con Vercel)
vercel deploy --prod

# 3. Verificar HTTPS
# https://tu-dominio.com (debe estar en verde)

# 4. Probar login
# Usa la credencial admin@marniediaz.com
```

---

## 📊 CHECKLIST DE SEGURIDAD

```
COMPLETADO ✅
═════════════════════════════════════════
✅ Validación de entrada (Zod)
✅ Rate limiting en login
✅ CSRF protection
✅ Session timeout (15 min)
✅ RLS policies (role-based)
✅ Audit logging
✅ Error sanitization
✅ Security headers (Vite)
✅ Role-based access control (RBAC)

PRÓXIMO
═════════════════════════════════════════
⏳ Aplicar validación a todos los formularios (1-2 horas)
⏳ Verificar RLS en base de datos (30 min)
⏳ Test de login y roles (30 min)
⏳ Deploy a staging (30 min)
⏳ Deploy a producción (30 min)

FUTURO (Después de v1)
═════════════════════════════════════════
⬜ Encriptación a nivel de campo
⬜ 2FA para admin (NO IMPLEMENTADO COMO PEDISTE)
⬜ Integración con servicio de alertas
⬜ Backup automáticos en cloud
⬜ Certificado SSL personalizado
```

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Error: "RLS policy violation"

```
Problema: Cambiste la política pero el usuario no tiene rol asignado
Solución:
1. Ve a Supabase → user_roles
2. Verifica que el user_id está en la tabla
3. Si no, inserta:
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'dentista'
   FROM auth.users WHERE email = 'tu@email.com';
```

### Error: "Too many login attempts"

```
Problema: Alguien falló 5 intentos de login en 15 minutos
Solución: Esperar 15 minutos o reiniciar el navegador (limpia el rate limit local)
En producción: Usar Redis para rate limiting distribuido
```

### Error: "CSRF token invalid"

```
Problema: El token CSRF es diferente entre cliente y servidor
Solución:
1. Asegúrate que uses sessionStorage (no localStorage)
2. Regenera el token después de login: getOrCreateCsrfToken()
3. Valida correctamente en servidor
```

### Base de datos dice "permission denied"

```
Problema: Usuario no tiene permisos según RLS
Solución:
1. Verifica que RLS está ENABLED en la tabla
2. Verifica que la policy existe para el user's role
3. Revisa la query: SELECT * FROM user_roles WHERE user_id = auth.uid();
4. Si no retorna nada, asigna rol al usuario
```

---

## 📞 NECESITAS AYUDA?

**Si algo no funciona:**

1. Abre Developer Tools (F12)
2. Ve a Console tab
3. Copia los errores exactos
4. Verifica en Supabase → Logs que no hay errores de BD

**Archivos importantes:**
- `src/lib/validation.ts` - Esquemas Zod
- `src/lib/security.ts` - Utilidades de seguridad
- `src/lib/roles.ts` - Sistema de roles
- `SECURITY.md` - Documentación completa

---

## ✨ LISTO?

Una vez completados los pasos críticos (1-5):

```bash
npm install
npm run dev
# ¡Prueba el login!
```

Si todo funciona → **¡Estás seguro!** 🎉

Si tienes errores → Revisa la sección "Problemas comunes"

---

**Versión**: 1.0
**Fecha**: 2026-03-29
**Estado**: COMPLETO ✅
