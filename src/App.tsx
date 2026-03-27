import { Routes, Route, Navigate } from 'react-router-dom'
import MarnieDiaz from './Odonto-Web.jsx'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Pacientes from './pages/dashboard/Pacientes'
import PacienteDetalle from './pages/dashboard/PacienteDetalle'
import Citas from './pages/dashboard/Citas'
import Procedimientos from './pages/dashboard/Procedimientos'
import Pagos from './pages/dashboard/Pagos'
import Odontograma from './pages/dashboard/Odontograma'
import CitaDetalle from './pages/dashboard/CitaDetalle'
import FichaForm from './pages/dashboard/fichas/FichaForm'
import FichaDetalle from './pages/dashboard/fichas/FichaDetalle'

export default function App() {
  return (
    <Routes>
      {/* Sitio público */}
      <Route path="/" element={<MarnieDiaz />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard protegido */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="pacientes" replace />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="pacientes/:id" element={<PacienteDetalle />} />
        <Route path="pacientes/:id/fichas/nueva" element={<FichaForm />} />
        <Route path="pacientes/:id/fichas/:fichaId" element={<FichaDetalle />} />
        <Route path="pacientes/:id/fichas/:fichaId/edit" element={<FichaForm />} />
        <Route path="citas" element={<Citas />} />
        <Route path="citas/:citaId" element={<CitaDetalle />} />
        <Route path="procedimientos" element={<Procedimientos />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="odontograma" element={<Odontograma />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}