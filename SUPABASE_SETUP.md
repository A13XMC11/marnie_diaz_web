# 🔧 Configuración de Supabase

Guía completa para configurar la base de datos de Marnie Díaz Odontología en Supabase.

## 📋 Pasos Iniciales

### 1. Crear Proyecto Supabase
- Ve a [supabase.com](https://supabase.com)
- Inicia sesión o crea una cuenta
- Haz clic en "New Project"
- Configura:
  - **Name**: `marnie-diaz-odonto`
  - **Password**: Guarda la contraseña en lugar seguro
  - **Region**: Elige la más cercana a tu ubicación
  - **Pricing Plan**: Free (para desarrollo)

### 2. Crear Tablas de Base de Datos

Una vez creado el proyecto:
1. Abre **SQL Editor** en el sidebar izquierdo
2. Haz clic en **"New Query"**
3. Copia TODO el contenido de `schema.sql` en tu proyecto
4. Pégalo en el SQL Editor
5. Haz clic en **"RUN"**
6. ✅ Las tablas se crearán automáticamente

## 🔑 Configurar Variables de Entorno

### 1. Obtener URLs de Supabase
En el proyecto Supabase:
- Ve a **Settings → API**
- Copia:
  - **Project URL** (supabase URL)
  - **anon public** (API Key pública)

### 2. Crear archivo `.env.local`
En la raíz del proyecto:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Reemplaza con tus valores reales.

## 👤 Configurar Autenticación

### 1. Habilitar Email/Password
En Supabase Dashboard:
1. Ve a **Authentication → Providers**
2. Asegúrate que **Email** esté habilitado
3. Ve a **Settings → Email**
4. Habilita "Confirm email" (opcional, pero recomendado)

### 2. Crear Cuenta Admin
En **Authentication → Users**:
1. Haz clic en **"Invite"**
2. Ingresa email: `admin@marnie.local`
3. Establece una contraseña temporal
4. El usuario recibirá un email de confirmación (o acepta automáticamente en modo desarrollo)

**Nota**: En desarrollo, puedes desactivar la confirmación de email en Settings para pruebas rápidas.

## 📊 Datos de Demostración (Opcional)

Si quieres cargar datos de prueba:

1. En **SQL Editor → New Query**, ejecuta:

```sql
-- Inserta pacientes de demostración
INSERT INTO public.pacientes (nombre, apellido, cedula, fecha_nacimiento, sexo, grupo_sanguineo, ocupacion, telefono, email)
VALUES
  ('Ana', 'García López', '1234567890', '1990-05-15', 'femenino', 'O+', 'Abogada', '0987654321', 'ana@example.com'),
  ('Carlos', 'Rodríguez Martínez', '0987654321', '1985-08-22', 'masculino', 'A+', 'Ingeniero', '0998765432', 'carlos@example.com'),
  ('María', 'López Fernández', '5555666677', '1988-03-10', 'femenino', 'B+', 'Doctora', '0988776655', 'maria@example.com');
```

## 🔒 Seguridad en Producción

Antes de ir a producción:

1. **Row Level Security (RLS)**: Ya está configurado en `schema.sql`
2. **Permisos**: Solo usuarios autenticados pueden acceder
3. **Variables de Entorno**: Nunca hardcodees las keys en el código
4. **Restricciones de CORS**: Configura en Supabase si necesario

## 🔍 Verificar Configuración

Para confirmar que todo está correcto:

1. Abre la app en `http://localhost:5173`
2. Intenta loguear con las credenciales creadas
3. Ve a **Dashboard** y verifica que carga sin errores
4. Crea un paciente nuevo y verifica que se guarde

## 📚 Tablas Disponibles

### pacientes
- Información demográfica
- Campos MSP Ecuador: sexo, grupo_sanguineo, ocupacion

### citas
- Programación de citas
- Estados: programada, confirmada, completada, cancelada, inasistencia

### procedimientos
- Procedimientos dentales realizados
- Vinculados a paciente y cita

### pagos
- Historial de pagos
- Estados: pagado, pendiente, parcial
- Vinculados a paciente y cita

### fichas_clinicas
- Historiales de consultas
- Diagnóstico, tratamiento, instrucciones
- Indicadores de salud (CPO)

### odontograma
- Estado dental por diente (11-48)
- Estados: sano, caries, obturado, corona, puente, implante, etc.

## 🆘 Solucionar Problemas

### Error: "Unable to connect"
- Verifica que las variables de entorno están correctas
- Asegúrate que VITE_SUPABASE_URL no tiene espacios

### Error: "Invalid API key"
- Copia nuevamente las keys desde Settings → API
- Confirma que estés usando la `anon public` key, no la `service_role` key

### Tablas no aparecen
- Abre SQL Editor y ejecuta:
  ```sql
  SELECT * FROM information_schema.tables WHERE table_schema = 'public';
  ```
- Si no aparecen, vuelve a ejecutar `schema.sql`

## 📞 Soporte
Para ayuda adicional, consulta:
- [Documentación de Supabase](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
