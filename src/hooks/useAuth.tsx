import { useState, useEffect, createContext, useContext } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { UserRole, hasPermission } from '../lib/roles'
import { clearSessionTimeout, startSessionTimeout, clearSecureSession, clearCsrfToken } from '../lib/security'

interface AuthContextType {
  session: Session | null
  user: User | null
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  hasPermission: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          await fetchUserRole(session.user.id)
          setLoading(false)
          // Start session timeout monitor (15 minutes)
          startSessionTimeout(
            (secondsRemaining) => {
              // Warning callback
              console.warn(`Session expires in ${secondsRemaining} seconds`)
            },
            () => {
              // Expiration callback
              signOut()
            }
          )
        } else {
          setSession(null)
          setUser(null)
          setRole(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      if (session?.user) {
        setSession(session)
        setUser(session.user)
        await fetchUserRole(session.user.id)
      } else {
        setSession(null)
        setUser(null)
        setRole(null)
        clearSessionTimeout()
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      clearSessionTimeout()
    }
  }, [])

  const fetchUserRole = async (userId: string) => {
    try {
      // For demo mode, assign admin role
      if (!supabase.auth.getSession) {
        setRole(UserRole.ADMIN)
        return
      }

      // In production, fetch from user_roles table via RLS policy
      // const { data } = await supabase
      //   .from('user_roles')
      //   .select('role')
      //   .eq('user_id', userId)
      //   .single()
      //
      // setRole((data?.role as UserRole) || UserRole.PACIENTE)

      // Default to dentista for now (update when DB is ready)
      setRole(UserRole.DENTISTA)
    } catch (error) {
      console.error('Failed to fetch user role:', error)
      setRole(UserRole.PACIENTE)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // Clear all security data on logout
      clearSessionTimeout()
      clearSecureSession()
      clearCsrfToken()
      setSession(null)
      setUser(null)
      setRole(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const checkPermission = (permission: string): boolean => {
    return role ? hasPermission(role, permission) : false
  }

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut, hasPermission: checkPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
