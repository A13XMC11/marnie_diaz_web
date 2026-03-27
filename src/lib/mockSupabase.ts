// ============================================================
// MOCK SUPABASE CLIENT — simulates Supabase API without network
// Activates automatically when VITE_SUPABASE_URL is placeholder
// ============================================================

import { DEMO_DATA, DEMO_USER, DEMO_SESSION } from './mockData'

const DEMO_EMAIL = 'admin@marniediaz.com'
const DEMO_PASSWORD = 'demo1234'
const SESSION_KEY = 'demo_session'

type AnyObject = Record<string, unknown>

// ── Auth callbacks store ──────────────────────────────────
const authListeners: Array<(event: string, session: typeof DEMO_SESSION | null) => void> = []
let _currentSession: typeof DEMO_SESSION | null = null

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    _currentSession = raw ? JSON.parse(raw) : null
  } catch { _currentSession = null }
  return _currentSession
}

function saveSession(s: typeof DEMO_SESSION | null) {
  _currentSession = s
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  else localStorage.removeItem(SESSION_KEY)
  authListeners.forEach(cb => cb(s ? 'SIGNED_IN' : 'SIGNED_OUT', s))
}

// ── Query Builder ─────────────────────────────────────────
class MockQueryBuilder {
  private table: string
  private _filters: Array<{ col: string; val: unknown }> = []
  private _orders: Array<{ col: string; asc: boolean }> = []
  private _limit: number | null = null
  private _single = false
  private _data: AnyObject[]

  constructor(table: string) {
    this.table = table
    this._data = (DEMO_DATA[table] ?? []) as AnyObject[]
  }

  select(_cols?: string) { return this }

  eq(col: string, val: unknown) {
    this._filters.push({ col, val })
    return this
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this._orders.push({ col, asc: opts?.ascending !== false })
    return this
  }

  limit(n: number) {
    this._limit = n
    return this
  }

  single() { this._single = true; return this }

  private _apply(): AnyObject[] {
    let rows = [...this._data]
    for (const { col, val } of this._filters) {
      rows = rows.filter(r => r[col] === val)
    }
    if (this._orders.length > 0) {
      rows.sort((a, b) => {
        for (const { col, asc } of this._orders) {
          const av = String(a[col] ?? '')
          const bv = String(b[col] ?? '')
          const cmp = asc ? av.localeCompare(bv) : bv.localeCompare(av)
          if (cmp !== 0) return cmp
        }
        return 0
      })
    }
    if (this._limit !== null) rows = rows.slice(0, this._limit)
    return rows
  }

  // Inline insert/update/delete helpers called as sub-operations
  private _insertPayload: AnyObject | null = null
  private _updatePayload: AnyObject | null = null
  private _deleteFlag = false

  insert(payload: AnyObject | AnyObject[]) {
    const rows = Array.isArray(payload) ? payload : [payload]
    rows.forEach(row => {
      const newRow = { ...row, id: `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`, created_at: new Date().toISOString() }
      ;(DEMO_DATA[this.table] as AnyObject[]).push(newRow)
    })
    return { data: null, error: null }
  }

  update(payload: AnyObject) {
    this._updatePayload = payload
    return this
  }

  delete() {
    this._deleteFlag = true
    return this
  }

  // Execute (called by await or .then())
  then(resolve: (result: { data: unknown; error: null }) => void, reject?: (e: unknown) => void): Promise<{data: unknown; error: null}> {
    return new Promise<{data: unknown; error: null}>((res, rej) => {
      try {
        if (this._deleteFlag) {
          const table = DEMO_DATA[this.table] as AnyObject[]
          this._filters.forEach(({ col, val }) => {
            const idx = table.findIndex(r => r[col] === val)
            if (idx !== -1) table.splice(idx, 1)
          })
          const result = { data: null, error: null }
          resolve(result)
          return res(result)
        }
        if (this._updatePayload) {
          const table = DEMO_DATA[this.table] as AnyObject[]
          this._filters.forEach(({ col, val }) => {
            const row = table.find(r => r[col] === val)
            if (row) Object.assign(row, this._updatePayload)
          })
          const result = { data: null, error: null }
          resolve(result)
          return res(result)
        }
        if (this._insertPayload) {
          const newRow = { ...this._insertPayload, id: `demo-${Date.now()}`, created_at: new Date().toISOString() }
          ;(DEMO_DATA[this.table] as AnyObject[]).push(newRow)
          const result = { data: newRow, error: null }
          resolve(result)
          return res(result)
        }
        const rows = this._apply()
        const result = { data: this._single ? (rows[0] ?? null) : rows, error: null }
        resolve(result)
        return res(result)
      } catch (e) {
        reject?.(e)
        rej(e)
      }
    })
  }
}

// ── Mock client ───────────────────────────────────────────
export const mockSupabase = {
  auth: {
    getSession: async () => {
      const session = loadSession()
      return { data: { session }, error: null }
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        saveSession(DEMO_SESSION)
        return { data: { session: DEMO_SESSION, user: DEMO_USER }, error: null }
      }
      return { data: { session: null, user: null }, error: { message: 'Credenciales incorrectas' } }
    },
    signOut: async () => {
      saveSession(null)
      return { error: null }
    },
    onAuthStateChange: (callback: (event: string, session: typeof DEMO_SESSION | null) => void) => {
      authListeners.push(callback)
      // immediately fire with current state
      const session = loadSession()
      setTimeout(() => callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session), 0)
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const idx = authListeners.indexOf(callback)
              if (idx !== -1) authListeners.splice(idx, 1)
            }
          }
        }
      }
    },
  },
  from: (table: string) => new MockQueryBuilder(table),
}
