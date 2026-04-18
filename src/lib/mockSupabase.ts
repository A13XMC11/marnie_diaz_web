// ============================================================
// MOCK SUPABASE CLIENT — simulates Supabase API without network
// Activates automatically when VITE_SUPABASE_URL is placeholder
// ============================================================

import { DEMO_DATA, DEMO_USER, DEMO_SESSION } from './mockData'

// ── Persistencia en localStorage ──────────────────────────
const PERSIST_TABLES = ['pacientes', 'citas', 'procedimientos', 'pagos', 'fichas_clinicas', 'odontograma']
// Mapeo de nombre de tabla → clave en localStorage
const PERSIST_KEY_MAP: Record<string, string> = { fichas_clinicas: 'demo_fichas' }
const getStorageKey = (table: string) => PERSIST_KEY_MAP[table] ?? `demo_${table}`

// Hidrata DEMO_DATA desde localStorage al cargar el módulo
PERSIST_TABLES.forEach(table => {
  try {
    const saved = localStorage.getItem(getStorageKey(table))
    if (saved) DEMO_DATA[table] = JSON.parse(saved)
  } catch { /* ignorar */ }
})

function persistTable(table: string) {
  try {
    if (PERSIST_TABLES.includes(table)) {
      localStorage.setItem(getStorageKey(table), JSON.stringify(DEMO_DATA[table]))
    }
  } catch { /* ignorar */ }
}

const DEMO_EMAIL = 'admin@marniediaz.com'
const DEMO_PASSWORD = 'demo1234'
const SESSION_KEY = 'demo_session_tab'  // sessionStorage only — expires when tab closes

// Clean up any leftover localStorage session keys from previous implementations
try {
  localStorage.removeItem('demo_session')
  localStorage.removeItem('demo_remember')
} catch { /* ignorar */ }

type AnyObject = Record<string, unknown>

// ── Auth callbacks store ──────────────────────────────────
const authListeners: Array<(event: string, session: typeof DEMO_SESSION | null) => void> = []
let _currentSession: typeof DEMO_SESSION | null = null

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) { _currentSession = JSON.parse(raw); return _currentSession }
    _currentSession = null
  } catch { _currentSession = null }
  return _currentSession
}

function saveSession(s: typeof DEMO_SESSION | null) {
  _currentSession = s
  try {
    if (s) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  } catch { /* ignorar */ }
  authListeners.forEach(cb => cb(s ? 'SIGNED_IN' : 'SIGNED_OUT', s))
}

// ── Query Builder ─────────────────────────────────────────
type FilterOp = 'eq' | 'neq' | 'gte' | 'lte' | 'lt' | 'gt' | 'in'
class MockQueryBuilder {
  private table: string
  private _filters: Array<{ col: string; val: unknown; op: FilterOp }> = []
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
    this._filters.push({ col, val, op: 'eq' })
    return this
  }

  neq(col: string, val: unknown) {
    this._filters.push({ col, val, op: 'neq' })
    return this
  }

  gte(col: string, val: unknown) {
    this._filters.push({ col, val, op: 'gte' })
    return this
  }

  lte(col: string, val: unknown) {
    this._filters.push({ col, val, op: 'lte' })
    return this
  }

  lt(col: string, val: unknown) {
    this._filters.push({ col, val, op: 'lt' })
    return this
  }

  gt(col: string, val: unknown) {
    this._filters.push({ col, val, op: 'gt' })
    return this
  }

  in(col: string, val: unknown[]) {
    this._filters.push({ col, val, op: 'in' })
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
  maybeSingle() { this._single = true; return this }

  private _apply(): AnyObject[] {
    let rows = [...(DEMO_DATA[this.table] ?? [])] as AnyObject[]
    for (const { col, val, op } of this._filters) {
      rows = rows.filter(r => {
        const rv = r[col]
        switch (op) {
          case 'eq':  return rv === val
          case 'neq': return rv !== val
          case 'gte': return rv >= val
          case 'lte': return rv <= val
          case 'lt':  return rv <  val
          case 'gt':  return rv >  val
          case 'in':  return Array.isArray(val) && val.includes(rv)
          default:    return rv === val
        }
      })
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
    // Poblar join de pacientes para filas que tengan paciente_id pero no pacientes
    if (this.table !== 'pacientes') {
      const pacientesList = (DEMO_DATA['pacientes'] ?? []) as AnyObject[]
      rows = rows.map(row => {
        if (row['pacientes'] || !row['paciente_id']) return row
        const p = pacientesList.find(p => p['id'] === row['paciente_id'])
        if (!p) return row
        return { ...row, pacientes: { nombre: p['nombre'], apellido: p['apellido'], cedula: p['cedula'], alergias: p['alergias'], telefono: p['telefono'], email: p['email'] } }
      })
    }
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
    persistTable(this.table)
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
          persistTable(this.table)
          const result = { data: null, error: null }
          resolve(result)
          return res(result)
        }
        if (this._updatePayload) {
          const table = DEMO_DATA[this.table] as AnyObject[]
          const updatedRows: AnyObject[] = []
          this._filters.forEach(({ col, val }) => {
            const row = table.find(r => r[col] === val)
            if (row) { Object.assign(row, this._updatePayload); updatedRows.push(row) }
          })
          persistTable(this.table)
          const result = { data: updatedRows.length === 1 ? updatedRows[0] : updatedRows, error: null }
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
    signInWithPassword: async ({ email, password }: { email: string; password: string; options?: Record<string, unknown> }) => {
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
