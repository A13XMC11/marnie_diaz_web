# 🔒 SECURITY HARDENING GUIDE - Odontologia-Web

## Overview

This document outlines all security implementations and configurations for the Odontologia-Web project. Follow these steps carefully before deploying to production.

---

## ✅ COMPLETED SECURITY IMPLEMENTATIONS

### 1. Input Validation & Sanitization ✓
- **File**: `src/lib/validation.ts`
- **Status**: ✅ COMPLETE
- **Features**:
  - Zod schemas for all data models (Paciente, Cita, Pago, etc.)
  - Email, phone, date, numeric field validation
  - Automatic error formatting for user display
  - Type-safe input/output with `z.infer`

**Usage Example**:
```typescript
import { validateData, pacienteSchema } from '@/lib/validation'

const { valid, data, errors } = validateData(pacienteSchema, formData)
if (!valid) {
  // Show errors to user
  setFormErrors(errors)
} else {
  // Use validated data
  await savePaciente(data)
}
```

### 2. Security Utilities ✓
- **File**: `src/lib/security.ts`
- **Status**: ✅ COMPLETE
- **Features**:
  - Rate limiting (5 attempts per 15 minutes)
  - CSRF token generation and validation
  - Session timeout monitoring (15 minutes inactivity)
  - Sensitive data masking
  - Safe error message sanitization
  - Audit log entry creation
  - Secure session storage

**Usage Examples**:

**Rate Limiting**:
```typescript
import { checkLoginRateLimit, clearLoginRateLimit } from '@/lib/security'

const canLogin = checkLoginRateLimit(email)
if (!canLogin) {
  // Show error: too many attempts
  return
}
// ... login logic
clearLoginRateLimit(email) // On success
```

**CSRF Protection**:
```typescript
import { getOrCreateCsrfToken, verifyCsrfToken } from '@/lib/security'

// In form
const token = getOrCreateCsrfToken()
// Send with POST request as X-CSRF-Token header

// In server (validate before processing)
const isValid = verifyCsrfToken(tokenFromHeader)
```

**Session Timeout**:
```typescript
import { startSessionTimeout } from '@/lib/security'

startSessionTimeout(
  (secondsRemaining) => {
    // Show warning (60 seconds remaining)
    console.warn(`Session expires in ${secondsRemaining}s`)
  },
  () => {
    // Auto logout when expired
    signOut()
  }
)
```

### 3. Role-Based Access Control (RBAC) ✓
- **File**: `src/lib/roles.ts`
- **Status**: ✅ COMPLETE
- **Features**:
  - 4 user roles: ADMIN, DENTISTA, RECEPCIONISTA, PACIENTE
  - Permission matrix system
  - Access control functions
  - Role hierarchy validation

**Available Roles**:
- **ADMIN**: Full system access, user management
- **DENTISTA**: Manage patients, appointments, clinical records
- **RECEPCIONISTA**: Manage appointments and payments
- **PACIENTE**: View own profile and records

**Usage Example**:
```typescript
import { useAuth } from '@/hooks/useAuth'

function Dashboard() {
  const { hasPermission } = useAuth()

  if (!hasPermission('view_all_patients')) {
    return <AccessDenied />
  }

  return <PatientsList />
}
```

### 4. Enhanced Authentication Hook ✓
- **File**: `src/hooks/useAuth.tsx`
- **Status**: ✅ COMPLETE
- **Features**:
  - User role fetching from database
  - Permission checking helpers
  - Session timeout integration
  - Secure logout with cleanup
  - Automatic session state management

**New Properties**:
```typescript
const {
  session,      // Supabase session
  user,         // User object
  role,         // UserRole enum
  loading,      // Loading state
  signOut,      // Async logout
  hasPermission // (permission: string) => boolean
} = useAuth()
```

### 5. Login Security ✓
- **File**: `src/pages/Login.tsx`
- **Status**: ✅ COMPLETE
- **Features**:
  - Input validation (email format, required fields)
  - Rate limiting (5 attempts per 15 minutes)
  - User-friendly error messages
  - Error message sanitization
  - Safe credential handling

### 6. Vite Security Configuration ✓
- **File**: `vite.config.ts`
- **Status**: ✅ COMPLETE
- **Features**:
  - Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
  - CORS configuration
  - Source map removal in production
  - Console.log removal in production
  - Code minification and optimization

**Security Headers**:
```
X-Frame-Options: DENY                    // Prevent clickjacking
X-Content-Type-Options: nosniff          // Prevent MIME sniffing
X-XSS-Protection: 1; mode=block          // Enable XSS filter
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 📋 DATABASE SECURITY MIGRATIONS

### Migration 1: Enhanced RLS Policies
- **File**: `supabase/migrations/security_policies.sql`
- **Status**: 📝 READY TO APPLY

**What it does**:
1. Creates `user_roles` table for role management
2. Creates `dentistas` table for clinic association
3. Replaces overly-permissive RLS policies with role-based access
4. Implements proper access control per table:
   - `pacientes` - Admins access all, dentistas access own
   - `fichas_clinicas` - Auditable access logging
   - `pagos` - Financial data protection
   - `procedimientos` - Procedure tracking
   - `odontograma` - Tooth chart records
   - `citas` - Appointment scheduling

**How to apply**:
```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Create new query
# 3. Copy contents of supabase/migrations/security_policies.sql
# 4. Execute

# OR using Supabase CLI:
supabase migration up
```

### Migration 2: Audit Logging
- **File**: `supabase/migrations/audit_logging.sql`
- **Status**: 📝 READY TO APPLY

**What it does**:
1. Creates `audit_logs` table for tracking all changes
2. Creates triggers on sensitive tables:
   - `pacientes` - Track all patient data changes
   - `fichas_clinicas` - Track clinical record modifications
   - `pagos` - Track payment updates
   - `user_roles` - Track permission changes
   - `procedimientos` - Track procedure records
3. Automatic cleanup of logs older than 90 days
4. RLS policies limiting access to admins only

**Fields Tracked**:
- user_id: Who made the change
- action: INSERT, UPDATE, DELETE
- table_name: Which table
- record_id: Which record
- old_data: Previous values (JSONB)
- new_data: New values (JSONB)
- created_at: Timestamp

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Run `npm install` to install Zod and dependencies
- [ ] Update TypeScript config to `"strict": true` (optional but recommended)
- [ ] Disable demo mode in production environment
- [ ] Set production-level environment variables

### Supabase Configuration
- [ ] Apply `security_policies.sql` migration
- [ ] Apply `audit_logging.sql` migration
- [ ] Verify RLS is enabled on all tables:
  ```sql
  SELECT tablename FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  ```
- [ ] Test RLS policies with read/write operations
- [ ] Create admin user and assign role in `user_roles` table

### Environment Variables
Create `.env.production`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
# Remove DEMO_MODE or set to "false"
```

Never commit `.env` files. Use only environment-specific secrets.

### HTTPS & Domain
- [ ] Ensure HTTPS is enabled on your domain
- [ ] Configure domain in Supabase settings
- [ ] Set up SSL certificate (auto via Let's Encrypt or Vercel)
- [ ] Force HTTPS redirect in server configuration

### Build & Deploy
```bash
npm install
npm run build
# Deploy build/ folder to your hosting
```

---

## 🔐 PRODUCTION HARDENING

### 1. Rate Limiting
Currently implemented: 5 login attempts per 15 minutes

**For production scaling**, add server-side rate limiting:
- IP-based rate limiting
- Account lockout after failed attempts
- Distributed rate limiting (Redis)

### 2. Session Management
- Session timeout: 15 minutes inactivity
- Uses sessionStorage (cleared on browser close)
- CSRF token validation

**Recommendations**:
- Implement refresh token rotation
- Add device tracking
- Enable secure cookies (HttpOnly, Secure, SameSite)

### 3. Encryption
Current: Data in transit (TLS/HTTPS)

**Recommended for production**:
- Field-level encryption for PII (email, cedula)
- Health data encryption at rest
- Separate encryption keys per clinic

### 4. Backup & Recovery
**Supabase automatically handles**:
- Point-in-time recovery (7-30 days)
- Automated daily backups
- Replica databases

**You should**:
- Test recovery procedures monthly
- Document backup retention policy
- Plan for disaster recovery

### 5. Monitoring & Alerting
**Implement**:
- Error tracking (Sentry, Bugsnag)
- Performance monitoring (Datadog, New Relic)
- Security monitoring (log analysis)
- Alert on:
  - Multiple failed logins from same IP
  - Unusual data access patterns
  - RLS policy violations
  - Audit log access

### 6. Compliance
For healthcare applications handling patient data:

**HIPAA Compliance** (if US-based):
- [ ] Business Associate Agreement (BAA) with Supabase
- [ ] Encryption at rest and in transit
- [ ] Access controls and audit logging ✅
- [ ] Breach notification procedures
- [ ] Data retention policies
- [ ] Employee training

**GDPR Compliance** (if EU-based):
- [ ] Privacy policy and consent
- [ ] Right to access data exports
- [ ] Right to deletion (data erasure)
- [ ] Data processing agreements
- [ ] Audit logging for compliance

**Local Regulations**:
- Research local healthcare data protection laws
- Document compliance measures
- Regular audits

---

## 🛠️ MAINTENANCE

### Regular Tasks

**Weekly**:
- Monitor error logs
- Review failed login attempts
- Check disk usage

**Monthly**:
- Test backup restoration
- Review and export audit logs
- Update dependencies (`npm outdated`)

**Quarterly**:
- Security audit
- Penetration testing
- Compliance review

### Updating Dependencies
```bash
npm outdated                    # Check for updates
npm update                      # Safe updates (minor/patch)
npm audit                       # Check vulnerabilities
npm audit fix                   # Auto-fix vulns
```

---

## 📚 SECURITY BEST PRACTICES

### For Developers

1. **Never commit secrets**
   ```bash
   # Good
   const apiKey = process.env.API_KEY

   # Bad
   const apiKey = "sk-proj-xxxxx"
   ```

2. **Validate all inputs**
   ```typescript
   // Use Zod schemas
   const validated = pacienteSchema.parse(userInput)
   ```

3. **Use HTTPS everywhere**
   ```typescript
   // Good
   fetch('https://api.example.com/data')

   // Bad
   fetch('http://api.example.com/data')
   ```

4. **Handle errors safely**
   ```typescript
   // Don't expose DB errors
   if (error instanceof Error) {
     const safe = sanitizeErrorMessage(error)
     setError(safe)
   }
   ```

5. **Implement rate limiting**
   ```typescript
   if (!checkLoginRateLimit(email)) {
     return 'Too many attempts'
   }
   ```

### For Administrators

1. **Access Control**
   - Assign minimal required roles
   - Review access monthly
   - Audit admin actions regularly

2. **Password Policies**
   - Strong passwords (8+ chars, mixed case, numbers, symbols)
   - No password sharing
   - Regular password changes

3. **Backup Strategy**
   - Test restores monthly
   - Multiple backup locations
   - Encrypted backups

4. **Monitoring**
   - Review audit logs weekly
   - Set up alerts for anomalies
   - Track failed logins

---

## ❓ FREQUENTLY ASKED QUESTIONS

**Q: How do I add a new user?**
A: Use Supabase Auth → Users tab. Automatically create entry in `user_roles` table with appropriate role.

**Q: How do I view audit logs?**
A: Only ADMIN role can access. Query `audit_logs` table from Supabase Dashboard.

**Q: How do I reset a user's password?**
A: In Supabase → Auth → Users → Click user → "Reset password" (sends email).

**Q: Can I export patient data?**
A: Query `pacientes` table with appropriate filters. For GDPR exports, include all related data (fichas, pagos, citas).

**Q: How do I rotate API keys?**
A: Supabase Dashboard → Settings → API Keys → "Rotate key" (can cause downtime if used in production).

---

## 🆘 INCIDENT RESPONSE

### If Credentials Are Exposed

1. **Immediately**:
   ```bash
   # Rotate Supabase keys
   # 1. Go to Supabase Dashboard
   # 2. Settings → API Keys
   # 3. Click "Rotate" on compromised key
   # 4. Update .env in production
   ```

2. **Within 1 hour**:
   - Audit access logs for suspicious activity
   - Review who had access to exposed credentials
   - Reset admin password

3. **Within 24 hours**:
   - Document incident
   - Notify affected parties if data accessed
   - Update security procedures

### If Suspicious Activity Detected

1. Check audit logs:
   ```sql
   SELECT * FROM audit_logs
   WHERE created_at > NOW() - INTERVAL '1 hour'
   ORDER BY created_at DESC
   ```

2. Review failed login attempts

3. If compromised:
   - Revoke user sessions
   - Reset password
   - Enable 2FA on account (future)

---

## 📞 SUPPORT & RESOURCES

- **Supabase Docs**: https://supabase.com/docs
- **OWASP Top 10**: https://owasp.org/Top10/
- **TypeScript Security**: https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html
- **Zod Validation**: https://zod.dev

---

**Last Updated**: 2026-03-29
**Version**: 1.0
**Status**: COMPLETE ✅
