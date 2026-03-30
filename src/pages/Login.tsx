import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { supabase, DEMO_MODE } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import LogoMarnieDiaz from '../assets/LogoMarnieDiaz.png'

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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f4f8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: 'relative',
    }}>
      {/* Logo en esquina superior izquierda de la página */}
      <div style={{ position: 'fixed', top: '20px', left: '24px', zIndex: 10 }}>
        <img
          src={LogoMarnieDiaz}
          alt="Marnie Díaz Odontología"
          style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Banner demo ENCIMA de la card */}
        {DEMO_MODE && (
          <div style={{
            backgroundColor: '#fefce8',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '16px',
            color: '#92400e',
            fontSize: '13px',
            lineHeight: '1.5',
          }}>
            <strong>Modo Demo activo.</strong>{' '}
            <button
              type="button"
              onClick={() => { setEmail('admin@marniediaz.com'); setPassword('demo1234') }}
              style={{
                background: 'none',
                border: 'none',
                color: '#92400e',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
              }}
            >
              Autocompletar credenciales de prueba
            </button>
          </div>
        )}

        {/* Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '40px 48px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {/* Encabezado */}
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 6px 0' }}>
            Bienvenida de nuevo
          </p>
          <h1 style={{
            color: '#111827',
            fontSize: '28px',
            fontWeight: 700,
            margin: '0',
            lineHeight: '1.2',
          }}>
            Panel Administrativo
          </h1>

          <div style={{ height: '28px' }} />

          {/* Campo correo */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '6px',
            }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tucorreo@marniediaz.com"
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1.5px solid #d1d5db',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
                fontFamily: 'inherit',
                colorScheme: 'light',
              }}
              onFocus={e => (e.target.style.borderColor = '#1a6fa8')}
              onBlur={e => (e.target.style.borderColor = '#d1d5db')}
            />
          </div>

          {/* Campo contraseña */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '6px',
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1.5px solid #d1d5db',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
                fontFamily: 'inherit',
                colorScheme: 'light',
              }}
              onFocus={e => (e.target.style.borderColor = '#1a6fa8')}
              onBlur={e => (e.target.style.borderColor = '#d1d5db')}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#dc2626',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div style={{ height: '24px' }} />

          {/* Botón principal */}
          <LoginButton loading={loading} onClick={handleSubmit} />

          <div style={{ height: '12px' }} />

          {/* Botón volver */}
          <Link
            to="/"
            style={{
              display: 'block',
              width: '100%',
              padding: '13px',
              borderRadius: '8px',
              border: '1.5px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontSize: '15px',
              fontWeight: 500,
              textAlign: 'center',
              textDecoration: 'none',
              boxSizing: 'border-box',
              transition: 'background-color 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff')}
          >
            ← Volver al sitio público
          </Link>
        </div>
      </div>
    </div>
  )
}

function LoginButton({ loading, onClick }: { loading: boolean; onClick: (e: React.FormEvent) => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="submit"
      disabled={loading}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '13px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: hovered ? '#0d3d5c' : '#1a6fa8',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.65 : 1,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
    >
      {loading ? (
        <>
          <span style={{
            display: 'inline-block',
            width: '14px',
            height: '14px',
            border: '2px solid rgba(255,255,255,0.4)',
            borderTopColor: '#ffffff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          Iniciando sesión...
        </>
      ) : 'Iniciar sesión'}
    </button>
  )
}
