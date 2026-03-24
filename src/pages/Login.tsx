import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase, DEMO_MODE } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/dashboard/pacientes" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
      setLoading(false)
    } else {
      navigate('/dashboard/pacientes')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ice via-white to-accent/30 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-azure/10 border border-accent/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-deep to-azure p-8 text-center">
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-white font-serif text-2xl font-semibold">Panel Administrativo</h1>
            <p className="text-white/60 text-sm mt-1">Marnie Díaz Odontología & Estética</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {DEMO_MODE && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">✨ Modo Demo Activo</p>
                <p className="text-xs text-amber-700 mb-3">Usa estas credenciales de prueba:</p>
                <button
                  type="button"
                  onClick={() => { setEmail('admin@marniediaz.com'); setPassword('demo1234') }}
                  className="w-full bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg p-2.5 text-xs text-left transition-colors"
                >
                  <div className="font-mono text-amber-800">admin@marniediaz.com</div>
                  <div className="font-mono text-amber-800">demo1234</div>
                  <div className="text-amber-600 mt-1">← Click para autocompletar</div>
                </button>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-700 outline-none focus:border-azure transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-700 outline-none focus:border-azure transition-colors bg-white"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-azure hover:bg-deep text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg hover:shadow-azure/30"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : 'Iniciar sesión'}
            </button>

            <p className="text-center text-xs text-gray-400 pt-2">
              <a href="/" className="text-azure hover:text-deep transition-colors">← Volver al sitio público</a>
            </p>
          </form>
        </div>

        {DEMO_MODE && (
          <p className="text-center text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mt-4 font-medium">
            🛠 Modo demo — sin conexión real a Supabase
          </p>
        )}
        {!DEMO_MODE && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Acceso exclusivo para administración clínica
          </p>
        )}
      </div>
    </div>
  )
}
