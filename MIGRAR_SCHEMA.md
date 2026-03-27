# 🔄 Migración del Schema en Supabase

Sigue estos pasos para revertir el schema antiguo y aplicar el nuevo.

## ⚠️ ADVERTENCIA

Este proceso **eliminará todas las tablas y datos actuales**. Si tienes datos importantes:
1. **Descarga un backup** primero (ver abajo)
2. O copia manualmente los datos que necesites

## Opción 1: Migración Automática (Recomendado)

### Paso 1: Descargar Backup de Datos (Opcional pero Recomendado)

En Supabase Dashboard:
1. Ve a **SQL Editor → New Query**
2. Ejecuta esto para descargar datos de pacientes:
```sql
SELECT * FROM public.pacientes;
```
3. Haz clic en **"Download"** (ícono de descarga)

### Paso 2: Ejecutar Script de Migración

1. Abre **SQL Editor** en Supabase Dashboard
2. Haz clic en **"New Query"**
3. Abre el archivo `schema_migrate.sql` en tu editor
4. Copia **TODO el contenido**
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en **"RUN"** (o `Ctrl+Enter`)
7. ✅ Espera a que se ejecute sin errores

### Paso 3: Verificar Nuevas Tablas

En **Table Editor**, deberías ver:
- [ ] `pacientes` (con columnas actualizadas)
- [ ] `citas`
- [ ] `procedimientos`
- [ ] `pagos`
- [ ] `odontograma`
- [ ] `fichas_clinicas` ✨ (nueva tabla)

### Paso 4: Recargar la App

```bash
npm run dev
```

Si ves "Modo Demo", recarga el navegador (`Cmd+Shift+R` o `Ctrl+Shift+R`)

---

## Opción 2: Migración Manual (Si Tienes Datos Importantes)

Si quieres migrar datos específicos:

### Paso 1: Respaldar Datos Actuales

En **SQL Editor → New Query**, ejecuta:

```sql
-- Guardar datos actuales en variables
SELECT
  id, nombre, apellido, cedula, fecha_nacimiento,
  telefono, email, direccion, alergias, antecedentes
FROM public.pacientes;
```

Descarga esto como CSV:
1. Haz clic en el ícono de descarga
2. Guarda como `pacientes_backup.csv`

### Paso 2: Eliminar Tablas Antiguas (Con Cuidado)

```sql
-- SOLO ejecuta esto si ya tienes backup
ALTER TABLE IF EXISTS public.odontograma    DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pagos          DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.procedimientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.citas          DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pacientes      DISABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS public.odontograma;
DROP TABLE IF EXISTS public.pagos;
DROP TABLE IF EXISTS public.procedimientos;
DROP TABLE IF EXISTS public.citas;
DROP TABLE IF EXISTS public.pacientes;
```

### Paso 3: Crear Nuevas Tablas

Copia el contenido de `schema.sql` (sin las líneas DROP) y ejecuta en SQL Editor.

### Paso 4: Restaurar Datos

```sql
INSERT INTO public.pacientes
  (id, nombre, apellido, cedula, fecha_nacimiento, telefono, email, direccion, alergias, antecedentes)
VALUES
  ('uuid-aqui', 'Juan', 'García', '1234567890', '1990-05-15', '0987654321', 'juan@example.com', 'Calle 1', 'Ninguna', 'Ninguno');
```

---

## 🆘 Problemas Comunes

### "Relation already exists"
Significa que algunas tablas todavía existen. Solución:
1. En **SQL Editor → New Query**
2. Ejecuta solo las líneas `DROP TABLE IF EXISTS`:
```sql
DROP TABLE IF EXISTS public.fichas_clinicas;
DROP TABLE IF EXISTS public.odontograma;
DROP TABLE IF EXISTS public.pagos;
DROP TABLE IF EXISTS public.procedimientos;
DROP TABLE IF EXISTS public.citas;
DROP TABLE IF EXISTS public.pacientes;
```
3. Luego ejecuta nuevamente el script de migración

### "Column already exists"
Algunos índices o columnas ya existen. Solución:
- Esto es normal, puedes ignorar estos errores
- Las líneas `IF NOT EXISTS` lo manejan automáticamente

### App muestra "Modo Demo" después de migrar
Soluciones:
1. Recarga el navegador (`Cmd+Shift+R`)
2. Verifica que `.env.local` tiene valores correctos
3. Reinicia el servidor: `Ctrl+C` y `npm run dev`

---

## ✅ Checklist Final

Después de la migración:

- [ ] No hay errores en SQL Editor
- [ ] Todas las 6 tablas aparecen en Table Editor
- [ ] La app abre sin "Modo Demo"
- [ ] Puedes loguear con tu usuario
- [ ] Dashboard carga sin errores
- [ ] Puedes crear un nuevo paciente

---

## 📝 Notas

- El script `schema_migrate.sql` es **idempotente** — puedes ejecutarlo varias veces sin problemas
- Los datos anteriores se pierden (usa `schema_backup.sql` primero si lo necesitas)
- Las políticas RLS se recrean automáticamente

¿Necesitas ayuda? Revisa [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para más detalles.
