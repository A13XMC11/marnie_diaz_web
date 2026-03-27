import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DEMO_MODE } from '../lib/supabase'

// SVG icon components
const Icons = {
  Pacientes: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Citas: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  ),
  Procedimientos: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  Pagos: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  Odontograma: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Home: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  SignOut: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  Tooth: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
}

const navItems = [
  { to: 'pacientes',      Icon: Icons.Pacientes,      label: 'Pacientes' },
  { to: 'citas',          Icon: Icons.Citas,          label: 'Citas' },
  { to: 'procedimientos', Icon: Icons.Procedimientos, label: 'Procedimientos' },
  { to: 'pagos',          Icon: Icons.Pagos,          label: 'Pagos' },
  { to: 'odontograma',    Icon: Icons.Odontograma,    label: 'Odontograma' },
]

// Breadcrumb component
function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.replace('/dashboard/', '').split('/')
  const crumbs: { label: string; path?: string }[] = [{ label: 'Inicio', path: '/dashboard' }]

  const segmentLabels: Record<string, string> = {
    pacientes: 'Pacientes', citas: 'Citas', procedimientos: 'Procedimientos',
    pagos: 'Pagos', odontograma: 'Odontograma', fichas: 'Fichas', nueva: 'Nueva ficha',
  }

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const label = segmentLabels[seg] ?? seg
    const isLast = i === segments.length - 1
    const path = isLast ? undefined : `/dashboard/${segments.slice(0, i + 1).join('/')}`
    crumbs.push({ label, path })
  }

  if (crumbs.length <= 2) return null

  return (
    <nav className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-300">›</span>}
          {crumb.path ? (
            <Link to={crumb.path} className="text-gray-400 hover:text-azure transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'AD'

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-gradient-to-b from-[#0d3d5c] via-[#0f4a6e] to-[#091f2e]
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-azure to-sky rounded-xl flex items-center justify-center shadow-lg shadow-azure/30">
              <Icons.Tooth />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight tracking-wide">Marnie Díaz</p>
              <p className="text-sky/60 text-xs tracking-wide">Panel Administrativo</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={`/dashboard/${to}`}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-azure/90 text-white shadow-md shadow-azure/25 border-l-2 border-sky'
                    : 'text-white/55 hover:text-white hover:bg-white/6 border-l-2 border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <Icon />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-azure to-deep flex items-center justify-center text-white text-xs font-bold shadow-md">
              {initials}
            </div>
            <p className="text-white/60 text-xs truncate flex-1">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all duration-200"
          >
            <Icons.SignOut />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-3.5 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          {/* Mobile menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Icons.Menu />
          </button>

          {/* Breadcrumbs */}
          <div className="flex-1">
            <Breadcrumbs />
          </div>

          {/* Demo badge */}
          {DEMO_MODE && (
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
              Modo Demo
            </div>
          )}

          {/* Public site */}
          <Link
            to="/"
            className="text-xs text-gray-400 hover:text-azure font-medium flex items-center gap-1.5 transition-colors"
          >
            <Icons.Home />
            Sitio público
          </Link>

          {/* User avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-azure to-deep flex items-center justify-center text-white text-xs font-bold shadow-md hover:shadow-lg transition-shadow"
            >
              {initials}
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-10 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 w-48">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); handleSignOut() }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Icons.SignOut />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
