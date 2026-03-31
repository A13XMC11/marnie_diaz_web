# 🔐 Seguridad - Checklist de Producción

Antes de desplegar a producción, verifica todos estos items.

## ✅ Seguridad de Código

- [ ] **No hay credenciales hardcodeadas**
  ```bash
  git grep -E "password|secret|key|token" -- '*.ts' '*.tsx' '*.js' '*.json' | grep -v .env | grep -v node_modules
  ```

- [ ] **Todas las variables de entorno están en `.env.local` (nunca commiteadas)**
  ```bash
  git ls-files | grep .env
  ```

- [ ] **CSRF tokens** están implementados en formularios
  - Ver: `src/lib/security.ts` → `getOrCreateCsrfToken()`

- [ ] **Validación de inputs** en todos los formularios
  - Ver: `src/lib/validation.ts` → Zod schemas

- [ ] **Error handling** no expone datos sensibles
  - Ver: `src/lib/security.ts` → `sanitizeErrorMessage()`

## 🔒 Seguridad de Sesión & Autenticación

- [ ] **Rate limiting** en login (5 intentos/15 min)
  - Implementado: `src/lib/security.ts` → `checkLoginRateLimit()`

- [ ] **Session timeout** en 15 minutos
  - Implementado: `src/lib/security.ts` → `startSessionTimeout()`

- [ ] **Logout seguro** limpia todas las cookies y tokens
  - Implementado: `src/hooks/useAuth.tsx`

## 🌐 Headers de Seguridad

- [ ] **HSTS** - Force HTTPS
  - Ver: `vite.config.ts` → `Strict-Transport-Security`

- [ ] **CSP** - Content Security Policy
  - Ver: `vite.config.ts` → `Content-Security-Policy`

- [ ] **X-Frame-Options** - Prevent clickjacking
  - Ver: `vite.config.ts` → `X-Frame-Options: DENY`

- [ ] **X-Content-Type-Options** - Prevent MIME sniffing
  - Ver: `vite.config.ts`

- [ ] **Permissions-Policy** - Disable dangerous APIs
  - Ver: `vite.config.ts`

## 🔐 Base de Datos & Acceso

- [ ] **RLS Policies** están activas en Supabase
  - Ver: `supabase/migrations/security_policies.sql`

- [ ] **Audit logging** registra cambios
  - Ver: `supabase/migrations/audit_logging.sql`

- [ ] **Roles & Permisos** están correctamente configurados
  - 4 roles: ADMIN, DENTISTA, RECEPCIONISTA, PACIENTE

- [ ] **Solo usar ANON key** en cliente (nunca service_role)
  ```env
  VITE_SUPABASE_ANON_KEY=ey...  # Public key (ANON)
  # NEVER EXPOSE SERVICE_ROLE_KEY
  ```

## 🔄 Backups & Recuperación

- [ ] **Backup automático** está configurado
  ```bash
  # Run manual backup
  npx tsx scripts/backup-supabase.ts
  ```

- [ ] **Plan de restauración** documentado
  - Ubicación: `backups/` (gitignored)

- [ ] **Supabase automated backups** habilitados
  - Settings → Backups → Enable automated backups

## 📊 Monitoreo & Alertas

- [ ] **Error monitoring** está implementado
  - Ver: `src/lib/monitoring.ts`

- [ ] **Security events** se registran
  - `logSecurityEvent()` para actividades sospechosas

- [ ] **Rate limit alerts** están configurados
  - `logRateLimitEvent()` cuando se dispara el límite

- [ ] **Logs centralizados** (Sentry/DataDog opcional)
  - Preparado en `src/lib/monitoring.ts`

## 🛡️ GDPR & Compliance

- [ ] **Derecho al olvido** implementado
  - Ver: `src/lib/security.ts` → `deletePatientData()`

- [ ] **Data portability** disponible
  - Ver: `src/lib/security.ts` → `exportPatientData()`

- [ ] **Anonymization** de datos sensibles
  - Ver: `src/lib/security.ts` → `anonymizePatientData()`

- [ ] **Privacy Policy** publicada
  - Usuario conoce qué datos se recopilan

- [ ] **Consent tracking** para datos médicos
  - Documentar consentimiento del paciente

## 📋 Checklist Final de Deployment

### Antes de Deploy

- [ ] Todas las variables de entorno están configuradas en Vercel
- [ ] `.env.local` está en `.gitignore`
- [ ] No hay `console.log` en código de producción
  - Removidos automáticamente en build
- [ ] Sourcemaps están deshabilitados
  - `sourcemap: false` en `vite.config.ts`
- [ ] Bundle está minificado
  - `minify: 'terser'`

### En Vercel Dashboard

- [ ] **Project Settings → Environment Variables**
  ```
  VITE_SUPABASE_URL = https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY = eyJ...
  ```

- [ ] **Security → Custom Headers** (opcional)
  - Vercel aplica automáticamente muchos headers

- [ ] **Domains → SSL/TLS**
  - Auto-renovación habilitada

- [ ] **Analytics** habilitado
  - Web Analytics + Speed Insights

### Después del Deploy

- [ ] Test de HTTPS en el dominio
  ```bash
  curl -I https://tu-dominio.com
  ```

- [ ] Verificar headers de seguridad
  ```bash
  curl -I https://tu-dominio.com | grep -E "Strict-Transport|X-Frame|CSP"
  ```

- [ ] Testear login y sesión timeout
  - Verificar que HSTS funciona
  - Verificar que logout limpia todo

- [ ] Validar formularios con datos inválidos
  - Emails, teléfonos, etc.

- [ ] Revisar Supabase logs
  - Supabase Dashboard → Logs

- [ ] Configurar monitoring en producción
  - Sentry / DataDog / Custom backend

## 🚨 Respuesta a Incidentes

Si encuentras una vulnerabilidad:

1. **STOP** - No la expongas públicamente
2. **Documenta** - Anota exactamente qué pasó
3. **Notifica** - Contacta al equipo de seguridad
4. **Remedia** - Arregla el issue rápido
5. **Rotea** - Cambia credenciales comprometidas
6. **Revisa** - Busca otros problemas similares

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/Top10/)
- [Supabase Security](https://supabase.com/docs/guides/getting-started/security)
- [Vercel Security Best Practices](https://vercel.com/docs/security)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

**Status**: ✅ Lista para producción cuando todos los items estén checked
