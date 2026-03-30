/**
 * Security utilities for authentication, rate limiting, and CSRF protection
 */

// ============== RATE LIMITING ==============

interface RateLimitEntry {
  count: number
  resetTime: number
}

const loginAttempts = new Map<string, RateLimitEntry>()
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_RATE_LIMIT_MINUTES = 15

/**
 * Check if an email has exceeded login rate limit
 * @returns true if allowed to attempt login, false if rate limited
 */
export const checkLoginRateLimit = (email: string): boolean => {
  const now = Date.now()
  const attempt = loginAttempts.get(email)

  if (!attempt || now > attempt.resetTime) {
    // Reset if no previous attempt or timeout expired
    loginAttempts.set(email, {
      count: 1,
      resetTime: now + LOGIN_RATE_LIMIT_MINUTES * 60 * 1000,
    })
    return true
  }

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    // Blocked: too many attempts
    return false
  }

  // Increment counter
  attempt.count++
  loginAttempts.set(email, attempt)
  return true
}

/**
 * Get remaining time (in seconds) until login rate limit resets
 */
export const getLoginRateLimitResetTime = (email: string): number => {
  const attempt = loginAttempts.get(email)
  if (!attempt) return 0

  const now = Date.now()
  const remaining = attempt.resetTime - now
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0
}

/**
 * Clear rate limit for an email (use after successful login)
 */
export const clearLoginRateLimit = (email: string): void => {
  loginAttempts.delete(email)
}

// ============== CSRF PROTECTION ==============

const CSRF_TOKEN_KEY = 'csrf-token'
const CSRF_TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure CSRF token
 */
export const generateCsrfToken = (): string => {
  try {
    const array = new Uint8Array(CSRF_TOKEN_LENGTH)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
  } catch {
    // Fallback for environments without crypto.getRandomValues
    return generateFallbackToken()
  }
}

/**
 * Fallback token generation (less secure, use only if crypto unavailable)
 */
const generateFallbackToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Get or create CSRF token for current session
 */
export const getOrCreateCsrfToken = (): string => {
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY)
  if (!token) {
    token = generateCsrfToken()
    sessionStorage.setItem(CSRF_TOKEN_KEY, token)
  }
  return token
}

/**
 * Verify CSRF token from request
 */
export const verifyCsrfToken = (token: string): boolean => {
  const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY)
  return storedToken !== null && storedToken === token
}

/**
 * Clear CSRF token (on logout)
 */
export const clearCsrfToken = (): void => {
  sessionStorage.removeItem(CSRF_TOKEN_KEY)
}

// ============== SESSION TIMEOUT ==============

const SESSION_TIMEOUT_MINUTES = 15
const SESSION_WARNING_MINUTES = 14
let sessionTimeoutId: NodeJS.Timeout | null = null
let warningTimeoutId: NodeJS.Timeout | null = null

type SessionWarningCallback = (secondsRemaining: number) => void
type SessionExpireCallback = () => void

let warningCallback: SessionWarningCallback | null = null
let expireCallback: SessionExpireCallback | null = null

/**
 * Start session timeout monitor
 */
export const startSessionTimeout = (
  onWarning?: SessionWarningCallback,
  onExpire?: SessionExpireCallback
): void => {
  warningCallback = onWarning || null
  expireCallback = onExpire || null

  clearSessionTimeout() // Clear existing timeouts

  const warningTime = SESSION_WARNING_MINUTES * 60 * 1000
  const expireTime = SESSION_TIMEOUT_MINUTES * 60 * 1000

  // Warning: 1 minute before expiration
  warningTimeoutId = setTimeout(() => {
    if (warningCallback) {
      warningCallback(60) // 60 seconds remaining
    }
  }, warningTime)

  // Expire session after timeout
  sessionTimeoutId = setTimeout(() => {
    if (expireCallback) {
      expireCallback()
    }
  }, expireTime)

  // Reset on user activity
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
  const resetTimeout = () => {
    startSessionTimeout(onWarning, onExpire)
  }

  events.forEach((event) => {
    document.addEventListener(event, resetTimeout, { once: true })
  })
}

/**
 * Clear session timeout
 */
export const clearSessionTimeout = (): void => {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId)
    sessionTimeoutId = null
  }
  if (warningTimeoutId) {
    clearTimeout(warningTimeoutId)
    warningTimeoutId = null
  }
}

// ============== SENSITIVE DATA HANDLING ==============

/**
 * Safely sanitize error messages for display (prevent info leakage)
 */
export const sanitizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // For known errors, check if it's safe to display
    const message = error.message.toLowerCase()

    // Never expose database or internal errors
    if (message.includes('database') || message.includes('sql') || message.includes('constraint')) {
      return 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.'
    }

    // Safe errors to display
    if (message.includes('invalid') || message.includes('not found') || message.includes('already exists')) {
      return error.message
    }
  }

  return 'Ocurrió un error inesperado. Intenta nuevamente.'
}

/**
 * Mask sensitive data (e.g., show only last 4 digits)
 */
export const maskSensitiveData = (value: string, showChars: number = 4): string => {
  if (value.length <= showChars) return '*'.repeat(value.length)
  const hidden = '*'.repeat(value.length - showChars)
  return hidden + value.slice(-showChars)
}

// ============== AUDIT LOGGING ==============

export interface AuditLog {
  user_id: string
  action: string
  table_name?: string
  record_id?: string
  old_data?: Record<string, unknown>
  new_data?: Record<string, unknown>
  timestamp: string
}

/**
 * Create audit log entry (client-side preparation, server sends to DB)
 */
export const createAuditLog = (
  userId: string,
  action: string,
  tableName?: string,
  recordId?: string,
  oldData?: Record<string, unknown>,
  newData?: Record<string, unknown>
): AuditLog => {
  return {
    user_id: userId,
    action,
    table_name: tableName,
    record_id: recordId,
    old_data: oldData,
    new_data: newData,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Log sensitive operation to server
 */
export const logSensitiveOperation = async (log: AuditLog): Promise<void> => {
  try {
    // This would send to your backend which inserts into audit_logs table
    // For now, we just prepare the structure
    console.debug('[Audit]', log.action, log.table_name, log.record_id)
  } catch (error) {
    console.error('Failed to log audit event', error)
    // Don't throw - audit logging failures shouldn't break app
  }
}

// ============== SECURE STORAGE ==============

/**
 * Safely store sensitive data in sessionStorage (cleared on browser close)
 */
export const setSecureSessionItem = (key: string, value: string): void => {
  try {
    sessionStorage.setItem(`secure_${key}`, value)
  } catch (error) {
    console.error('Failed to store secure session item', error)
  }
}

/**
 * Retrieve sensitive data from sessionStorage
 */
export const getSecureSessionItem = (key: string): string | null => {
  try {
    return sessionStorage.getItem(`secure_${key}`)
  } catch (error) {
    console.error('Failed to retrieve secure session item', error)
    return null
  }
}

/**
 * Clear all secure session items
 */
export const clearSecureSession = (): void => {
  try {
    const keys = Object.keys(sessionStorage)
    keys.forEach((key) => {
      if (key.startsWith('secure_')) {
        sessionStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Failed to clear secure session', error)
  }
}
