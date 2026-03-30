'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

// Icons for KPI cards
const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8L5.586 19.414M13 17h8" />
  </svg>
)

const TrendDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8L5.586 4.586M13 7H5" />
  </svg>
)

const BarChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const DollarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 8.048M12 4.354L8.646 7.708M12 4.354l3.354 3.354M9 19.5h6a2 2 0 002-2V10.5a2 2 0 00-2-2H9a2 2 0 00-2 2v7a2 2 0 002 2z" />
  </svg>
)

interface KPI {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'amber' | 'red'
}

function KPICard({ title, value, change, icon, color }: KPI) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900',
    green: 'from-green-50 to-green-100 border-green-200 text-green-900',
    amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-900',
    red: 'from-red-50 to-red-100 border-red-200 text-red-900',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-4 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {change >= 0 ? <TrendUpIcon /> : <TrendDownIcon />}
              {Math.abs(change)}% vs mes anterior
            </div>
          )}
        </div>
        <div className="opacity-40 p-2">{icon}</div>
      </div>
    </div>
  )
}

interface ProcedureStats {
  tipo: string
  count: number
  total: number
}

interface CitaStats {
  estado: string
  count: number
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<Record<string, any>>({
    ingresosActual: 0,
    ingresosPrevio: 0,
    changeIngresos: '0',
    pagosPendientes: 0,
    pacientesConDeuda: 0,
    cpoPromedio: 0,
    procedimientosTop: [],
    citasEstado: [],
    pacientesNuevos: 0,
    citasConfirmadas: 0,
    citasInasistencias: 0,
    tiempoPromedioPago: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const now = new Date()
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

        // 1. Ingresos del mes actual vs mes anterior
        const { data: pagosActual } = await supabase
          .from('pagos')
          .select('monto')
          .eq('estado', 'pagado')
          .gte('created_at', currentMonth.toISOString())

        const { data: pagosPrevio } = await supabase
          .from('pagos')
          .select('monto')
          .eq('estado', 'pagado')
          .gte('created_at', previousMonth.toISOString())
          .lte('created_at', prevMonthEnd.toISOString())

        const ingresosActual = pagosActual?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0
        const ingresosPrevio = pagosPrevio?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0
        const changeIngresos = ingresosPrevio === 0 ? 0 : ((ingresosActual - ingresosPrevio) / ingresosPrevio) * 100

        // 2. Pagos pendientes total (pendiente + parcial)
        const { data: pagosPendientes } = await supabase
          .from('pagos')
          .select('monto')
          .in('estado', ['pendiente', 'parcial'])

        const totalPendiente = pagosPendientes?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0

        // 3. Pacientes con deuda > 30 días
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const { data: citasAntiquas } = await supabase
          .from('citas')
          .select('paciente_id')
          .lt('fecha', thirtyDaysAgo.toISOString())

        const pacientesConDeudaSet = new Set(citasAntiquas?.map((c) => c.paciente_id) || [])
        const pacientesConDeuda = pacientesConDeudaSet.size

        // 4. Ingresos por tipo de procedimiento (top 5)
        const { data: procedimientosData } = await supabase
          .from('procedimientos')
          .select('tipo, costo')
          .gte('created_at', currentMonth.toISOString())

        const procedimientosMap = new Map<string, { count: number; total: number }>()
        procedimientosData?.forEach((p) => {
          const current = procedimientosMap.get(p.tipo) || { count: 0, total: 0 }
          procedimientosMap.set(p.tipo, {
            count: current.count + 1,
            total: current.total + (p.costo || 0),
          })
        })

        const procedimientosTop = Array.from(procedimientosMap.entries())
          .map(([tipo, { count, total }]) => ({ tipo, count, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)

        // 5. CPO promedio de pacientes activos
        const { data: fichas } = await supabase.from('fichas_clinicas').select('indicadores_salud')

        const cpoCariados = fichas?.flatMap((f) => f.indicadores_salud?.cpo?.cariados || 0) || []
        const cpoPerdidos = fichas?.flatMap((f) => f.indicadores_salud?.cpo?.perdidos || 0) || []
        const cpoObturados = fichas?.flatMap((f) => f.indicadores_salud?.cpo?.obturados || 0) || []

        const cpoPromedio = fichas && fichas.length > 0
          ? (
              (cpoCariados.reduce((a, b) => a + b, 0) +
                cpoPerdidos.reduce((a, b) => a + b, 0) +
                cpoObturados.reduce((a, b) => a + b, 0)) /
              fichas.length
            ).toFixed(1)
          : 0

        // 6. Citas por estado
        const { data: citasData } = await supabase
          .from('citas')
          .select('estado')
          .gte('created_at', currentMonth.toISOString())

        const citasEstadoMap = new Map<string, number>()
        citasData?.forEach((c) => {
          citasEstadoMap.set(c.estado, (citasEstadoMap.get(c.estado) || 0) + 1)
        })

        const citasConfirmadas = citasEstadoMap.get('confirmada') || 0
        const citasInasistencias = citasEstadoMap.get('inasistencia') || 0

        // 7. Nuevos pacientes este mes
        const { data: pacientesNuevos } = await supabase
          .from('pacientes')
          .select('id')
          .gte('created_at', currentMonth.toISOString())

        const pacientesNuevosCount = pacientesNuevos?.length || 0

        // 8. Tiempo promedio entre cita y pago
        const { data: citasConPagos } = await supabase
          .from('citas')
          .select('fecha, id')
          .gte('created_at', currentMonth.toISOString())

        let tiemposPromedio: number | string = 0
        if (citasConPagos && citasConPagos.length > 0) {
          const tiempos = []
          for (const cita of citasConPagos) {
            const { data: pagosForCita } = await supabase
              .from('pagos')
              .select('created_at')
              .eq('cita_id', cita.id)
              .eq('estado', 'pagado')
              .order('created_at', { ascending: true })
              .limit(1)

            if (pagosForCita && pagosForCita.length > 0) {
              const citaDate = new Date(cita.fecha)
              const pagoDate = new Date(pagosForCita[0].created_at)
              const diffDays = (pagoDate.getTime() - citaDate.getTime()) / (1000 * 60 * 60 * 24)
              tiempos.push(diffDays)
            }
          }
          tiemposPromedio = tiempos.length > 0 ? Number((tiempos.reduce((a, b) => a + b, 0) / tiempos.length).toFixed(1)) : 0
        }

        setKpis({
          ingresosActual,
          ingresosPrevio,
          changeIngresos: changeIngresos.toFixed(1),
          pagosPendientes: totalPendiente,
          pacientesConDeuda,
          cpoPromedio,
          procedimientosTop,
          citasConfirmadas,
          citasInasistencias,
          pacientesNuevos: pacientesNuevosCount,
          tiempoPromedioPago: tiemposPromedio,
        })
      } catch (error) {
        console.error('Error fetching KPIs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchKPIs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-azure/20 border-t-azure animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 text-sm mt-1">Métricas y KPIs del mes actual</p>
      </div>

      {/* Financial KPIs */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">📊 Métricas Financieras</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Ingresos del Mes"
            value={`$${kpis.ingresosActual.toLocaleString('es-EC')}`}
            change={parseFloat(kpis.changeIngresos) || 0}
            icon={<DollarIcon />}
            color="green"
          />
          <KPICard
            title="Pagos Pendientes"
            value={`$${kpis.pagosPendientes.toLocaleString('es-EC')}`}
            icon={<DollarIcon />}
            color="amber"
          />
          <KPICard
            title="Pacientes con Deuda > 30d"
            value={kpis.pacientesConDeuda}
            icon={<UsersIcon />}
            color="red"
          />
        </div>
      </section>

      {/* Procedures and clinical KPIs */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">🦷 Métricas Clínicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-blue-900">Procedimientos Top 5</h3>
              <BarChartIcon />
            </div>
            <div className="space-y-2">
              {kpis.procedimientosTop && kpis.procedimientosTop.length > 0 ? (
                kpis.procedimientosTop.map((proc: ProcedureStats, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-blue-900">{proc.tipo}</p>
                      <p className="text-xs text-blue-700">{proc.count} procedimientos</p>
                    </div>
                    <p className="font-semibold text-blue-900">${proc.total.toLocaleString('es-EC')}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-blue-700">Sin datos</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-purple-900">Salud Bucal Promedio</h3>
              <BarChartIcon />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-purple-700">CPO Promedio</p>
                <p className="text-2xl font-bold text-purple-900">{kpis.cpoPromedio}</p>
              </div>
              <p className="text-xs text-purple-600">
                {kpis.cpoPromedio > 0
                  ? 'Indicador de salud de pacientes activos'
                  : 'Sin fichas clínicas registradas'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operational KPIs */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">📅 Métricas Operacionales</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            title="Citas Confirmadas"
            value={kpis.citasConfirmadas}
            icon={<CalendarIcon />}
            color="blue"
          />
          <KPICard
            title="Inasistencias"
            value={kpis.citasInasistencias}
            icon={<CalendarIcon />}
            color="red"
          />
          <KPICard
            title="Nuevos Pacientes"
            value={kpis.pacientesNuevos}
            icon={<UsersIcon />}
            color="green"
          />
          <KPICard
            title="Tiempo Promedio al Pago"
            value={`${kpis.tiempoPromedioPago} días`}
            icon={<CalendarIcon />}
            color="blue"
          />
        </div>
      </section>

      {/* Note about metrics */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <p>
          <strong>Nota:</strong> Las métricas se actualizan automáticamente y reflejan los datos del mes actual (
          {new Date().toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })})
        </p>
      </div>
    </div>
  )
}
