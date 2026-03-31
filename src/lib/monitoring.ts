/**
 * Monitoring & Alerting for Production
 * Tracks critical events, errors, and suspicious activities
 */

interface MonitoringEvent {
  type: 'error' | 'warning' | 'info' | 'security'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: Record<string, unknown>
  timestamp: string
  userId?: string
}

interface ErrorMetrics {
  totalErrors: number
  errorsByType: Map<string, number>
  lastErrors: MonitoringEvent[]
  maxRecentErrors: number
}

const metrics: ErrorMetrics = {
  totalErrors: 0,
  errorsByType: new Map(),
  lastErrors: [],
  maxRecentErrors: 50,
}

/**
 * Log monitoring event
 */
export const logEvent = (event: Omit<MonitoringEvent, 'timestamp'>): void => {
  const fullEvent: MonitoringEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  }

  // Track error counts
  if (event.type === 'error') {
    metrics.totalErrors++
    const count = metrics.errorsByType.get(event.message) || 0
    metrics.errorsByType.set(event.message, count + 1)
  }

  // Keep recent errors for analysis
  metrics.lastErrors.push(fullEvent)
  if (metrics.lastErrors.length > metrics.maxRecentErrors) {
    metrics.lastErrors.shift()
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    const prefix = `[${event.severity.toUpperCase()}]`
    const style = getSeverityStyle(event.severity)
    console.log(`%c${prefix} ${event.message}`, style, event.details || '')
  }

  // Send to backend/monitoring service in production
  if (import.meta.env.PROD) {
    sendToMonitoringService(fullEvent)
  }
}

/**
 * Get console style for severity level
 */
const getSeverityStyle = (severity: string): string => {
  const styles = {
    low: 'color: #0ea5e9; font-weight: bold;',
    medium: 'color: #f59e0b; font-weight: bold;',
    high: 'color: #ef4444; font-weight: bold;',
    critical: 'color: #dc2626; font-weight: bold; font-size: 14px;',
  }
  return styles[severity as keyof typeof styles] || styles.low
}

/**
 * Log security event
 */
export const logSecurityEvent = (
  message: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  details?: Record<string, unknown>
): void => {
  logEvent({
    type: 'security',
    severity,
    message,
    details,
  })
}

/**
 * Log authentication event
 */
export const logAuthEvent = (action: string, success: boolean, userId?: string): void => {
  logEvent({
    type: success ? 'info' : 'warning',
    severity: success ? 'low' : 'medium',
    message: `Authentication: ${action}`,
    details: { success, userId },
    userId,
  })
}

/**
 * Log API error
 */
export const logApiError = (
  endpoint: string,
  statusCode: number,
  error: string,
  userId?: string
): void => {
  const severity = statusCode >= 500 ? 'high' : statusCode === 401 ? 'medium' : 'low'

  logEvent({
    type: 'error',
    severity,
    message: `API Error: ${endpoint}`,
    details: { endpoint, statusCode, error },
    userId,
  })
}

/**
 * Log rate limit triggered
 */
export const logRateLimitEvent = (
  identifier: string,
  limit: number,
  timeWindow: string,
  userId?: string
): void => {
  logSecurityEvent(
    `Rate limit exceeded: ${identifier}`,
    'high',
    { limit, timeWindow, userId }
  )
}

/**
 * Log suspicious activity
 */
export const logSuspiciousActivity = (
  activity: string,
  userId?: string,
  details?: Record<string, unknown>
): void => {
  logSecurityEvent(activity, 'high', {
    userId,
    ...details,
  })
}

/**
 * Send event to monitoring service (Sentry, DataDog, etc)
 */
const sendToMonitoringService = async (event: MonitoringEvent): Promise<void> => {
  try {
    // Example: Send to Sentry
    if (window.__SENTRY__) {
      window.__SENTRY__.captureMessage(event.message, {
        level: event.severity === 'critical' ? 'fatal' : event.severity,
        tags: {
          type: event.type,
          userId: event.userId,
        },
        extra: event.details,
      })
    }

    // Example: Send to custom backend
    // await fetch('/api/monitoring', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // })
  } catch (error) {
    console.error('Failed to send monitoring event:', error)
  }
}

/**
 * Get current metrics
 */
export const getMetrics = () => ({
  totalErrors: metrics.totalErrors,
  errorsByType: Object.fromEntries(metrics.errorsByType),
  recentErrors: metrics.lastErrors,
  healthStatus: metrics.totalErrors === 0 ? 'healthy' : 'degraded',
})

/**
 * Reset metrics (useful for testing)
 */
export const resetMetrics = (): void => {
  metrics.totalErrors = 0
  metrics.errorsByType.clear()
  metrics.lastErrors = []
}

// Extend window interface for Sentry integration
declare global {
  interface Window {
    __SENTRY__?: {
      captureMessage: (message: string, context: unknown) => void
      captureException: (error: Error) => void
    }
  }
}

export type { MonitoringEvent }
