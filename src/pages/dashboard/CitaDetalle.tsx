import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Cita {
  id: string
  paciente_id: string
  fecha: string
  hora: string
  motivo: string
  estado: 'programada' | 'confirmada' | 'completada' | 'cancelada'
  notas: string
  pacientes: { nombre: string; apellido: string; cedula?: string; alergias?: string }
}

interface Ficha {
  id: string
  fecha: string
  motivo_consulta: string
}

interface Procedimiento {
  id: string
  tipo: string
  descripcion: string
  costo: number
  fecha: string
  estado: string
}

interface Pago {
  id: string
  monto: number
  fecha: string
  metodo_pago: string
  estado: string
  notas: string
}

const ESTADO_COLORS = {
  programada: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmada: 'bg-amber-50 text-amber-700 border-amber-200',
  completada: 'bg-green-50 text-green-700 border-green-200',
  cancelada: 'bg-red-50 text-red-700 border-red-200',
}

export default function CitaDetalle() {
  const { citaId } = useParams()
  const navigate = useNavigate()
  const [cita, setCita] = useState<Cita | null>(null)
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showProcedimientoForm, setShowProcedimientoForm] = useState(false)
  const [showPagoForm, setShowPagoForm] = useState(false)

  const fetchData = async () => {
    if (!citaId) return
    try {
      setLoading(true)
      setError('')

      // Fetch cita with paciente join
      const { data: citaData, error: citaError } = await supabase
        .from('citas')
        .select('*, pacientes(nombre, apellido, cedula, alergias)')
        .eq('id', citaId)
        .single()

      if (citaError || !citaData) {
        setError('No se encontró la cita')
        return
      }
      setCita(citaData as Cita)

      // Buscar ficha por cita_id
      const { data: fichaData } = await supabase
        .from('fichas_clinicas')
        .select('id, fecha, motivo_consulta')
        .eq('cita_id', citaId)
        .maybeSingle()

      if (fichaData) {
        setFicha(fichaData as Ficha)
      } else {
        // Fallback: buscar por paciente_id + fecha (fichas creadas desde perfil del paciente)
        const cita = citaData as Cita
        const { data: fichaByFecha } = await supabase
          .from('fichas_clinicas')
          .select('id, fecha, motivo_consulta')
          .eq('paciente_id', cita.paciente_id)
          .eq('fecha', cita.fecha)
          .maybeSingle()
        if (fichaByFecha) setFicha(fichaByFecha as Ficha)
      }

      // Fetch procedimientos
      const { data: procData } = await supabase
        .from('procedimientos')
        .select('*')
        .eq('cita_id', citaId)
        .order('fecha')

      setProcedimientos((procData || []) as Procedimiento[])

      // Fetch pagos
      const { data: pagoData } = await supabase
        .from('pagos')
        .select('*')
        .eq('cita_id', citaId)
        .order('fecha')

      setPagos((pagoData || []) as Pago[])
    } catch (err) {
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [citaId])

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!cita) return
    try {
      const { error: dbError } = await supabase
        .from('citas')
        .update({ estado: nuevoEstado })
        .eq('id', citaId)

      if (dbError) {
        setError('Error al cambiar estado')
        return
      }

      setCita({ ...cita, estado: nuevoEstado as any })
    } catch (err) {
      setError('Error al cambiar estado')
    }
  }

  const handleSaveProcedimiento = async (formData: any) => {
    if (!cita) return
    try {
      const payload = {
        paciente_id: cita.paciente_id,
        cita_id: citaId,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        costo: parseFloat(formData.costo) || 0,
        fecha: formData.fecha || cita.fecha,
        estado: formData.estado || 'realizado',
      }

      const { error: dbError } = await supabase.from('procedimientos').insert(payload)

      if (dbError) {
        setError('Error al guardar procedimiento')
        return
      }

      setShowProcedimientoForm(false)
      fetchData()
    } catch (err) {
      setError('Error al guardar procedimiento')
    }
  }

  const handleSavePago = async (formData: any) => {
    if (!cita) return
    try {
      const payload = {
        paciente_id: cita.paciente_id,
        cita_id: citaId,
        monto: parseFloat(formData.monto) || 0,
        fecha: formData.fecha || cita.fecha,
        metodo_pago: formData.metodo_pago || 'efectivo',
        estado: formData.estado || 'pagado',
        notas: formData.notas || '',
      }

      const { error: dbError } = await supabase.from('pagos').insert(payload)

      if (dbError) {
        setError('Error al guardar pago')
        return
      }

      setShowPagoForm(false)
      fetchData()
    } catch (err) {
      setError('Error al guardar pago')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-azure rounded-full animate-spin" />
          <p className="mt-3 text-gray-500">Cargando cita...</p>
        </div>
      </div>
    )
  }

  if (!cita) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error || 'No se encontró la cita'}
        </div>
      </div>
    )
  }

  const totalProcedimientos = procedimientos.reduce((sum, p) => sum + p.costo, 0)
  const totalPagos = pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0)
  const pendiente = totalProcedimientos - totalPagos

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-azure transition-colors mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Link
                to={`/dashboard/pacientes/${cita.paciente_id}`}
                className="text-2xl font-serif font-bold text-deep hover:text-azure transition-colors"
              >
                {cita.pacientes.nombre} {cita.pacientes.apellido}
              </Link>
              {cita.pacientes.alergias && (
                <p className="text-sm text-red-600 mt-1">⚠️ Alergia: {cita.pacientes.alergias}</p>
              )}
            </div>
            <div className={`px-4 py-2 rounded-full border text-sm font-medium ${ESTADO_COLORS[cita.estado]}`}>
              {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fecha</p>
              <p className="font-medium text-gray-800">{new Date(cita.fecha).toLocaleDateString('es-EC', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hora</p>
              <p className="font-medium text-gray-800">{cita.hora}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Motivo</p>
              <p className="font-medium text-gray-800">{cita.motivo}</p>
            </div>
          </div>

          {/* Acciones de estado */}
          <div className="flex gap-2">
            {cita.estado === 'programada' && (
              <button
                onClick={() => handleCambiarEstado('confirmada')}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm font-medium transition-colors"
              >
                ✓ Confirmar
              </button>
            )}
            {(cita.estado === 'programada' || cita.estado === 'confirmada') && (
              <button
                onClick={() => handleCambiarEstado('completada')}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
              >
                ✓ Completar
              </button>
            )}
            {cita.estado !== 'cancelada' && (
              <button
                onClick={() => handleCambiarEstado('cancelada')}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                ✕ Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Sección Ficha Clínica */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-serif font-bold text-deep mb-4">📋 Ficha Clínica</h2>
        {ficha ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ficha registrada el {new Date(ficha.fecha).toLocaleDateString('es-EC')}</p>
              <p className="font-medium text-gray-800">{ficha.motivo_consulta}</p>
            </div>
            <Link
              to={`/dashboard/pacientes/${cita.paciente_id}/fichas/${ficha.id}`}
              className="text-azure hover:text-deep font-medium transition-colors"
            >
              Ver ficha →
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-gray-600">No hay ficha clínica para esta visita</p>
            <Link
              to={`/dashboard/pacientes/${cita.paciente_id}/fichas/nueva?cita_id=${citaId}&motivo=${encodeURIComponent(cita.motivo)}&fecha=${cita.fecha}`}
              className="px-4 py-2 bg-azure hover:bg-deep text-white rounded-lg text-sm font-medium transition-colors"
            >
              Crear ficha de esta visita
            </Link>
          </div>
        )}
      </div>

      {/* Sección Procedimientos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-deep">🔧 Procedimientos</h2>
          <button
            onClick={() => setShowProcedimientoForm(!showProcedimientoForm)}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            + Agregar
          </button>
        </div>

        {showProcedimientoForm && (
          <ProcedimientoForm
            onSave={handleSaveProcedimiento}
            onCancel={() => setShowProcedimientoForm(false)}
            citaFecha={cita.fecha}
          />
        )}

        {procedimientos.length > 0 ? (
          <div className="space-y-3">
            {procedimientos.map((proc) => (
              <div key={proc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{proc.tipo}</p>
                  <p className="text-sm text-gray-600">{proc.descripcion}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(proc.fecha).toLocaleDateString('es-EC')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-deep">${proc.costo.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{proc.estado}</p>
                </div>
              </div>
            ))}
            <div className="text-right pt-3 border-t-2 border-gray-200">
              <p className="text-sm text-gray-600">Total procedimientos:</p>
              <p className="text-2xl font-bold text-deep">${totalProcedimientos.toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Sin procedimientos registrados</p>
        )}
      </div>

      {/* Sección Pagos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-deep">💳 Pagos</h2>
          <button
            onClick={() => setShowPagoForm(!showPagoForm)}
            className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
          >
            + Registrar pago
          </button>
        </div>

        {showPagoForm && (
          <PagoForm
            onSave={handleSavePago}
            onCancel={() => setShowPagoForm(false)}
            citaFecha={cita.fecha}
            montoSugerido={pendiente}
            procedimientosDescripcion={procedimientos.map((p) => p.tipo).join(', ')}
          />
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs text-green-700 uppercase font-medium mb-1">Pagado</p>
            <p className="text-xl font-bold text-green-700">${totalPagos.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs text-red-700 uppercase font-medium mb-1">Pendiente</p>
            <p className="text-xl font-bold text-red-700">${pendiente.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 uppercase font-medium mb-1">Total</p>
            <p className="text-xl font-bold text-blue-700">${totalProcedimientos.toFixed(2)}</p>
          </div>
        </div>

        {pagos.length > 0 ? (
          <div className="space-y-2">
            {pagos.map((pago) => (
              <div key={pago.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{pago.metodo_pago}</p>
                  <p className="text-xs text-gray-600">{pago.notas}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">${pago.monto.toFixed(2)}</p>
                  <p className={`text-xs font-medium ${pago.estado === 'pagado' ? 'text-green-600' : 'text-amber-600'}`}>
                    {pago.estado}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Sin pagos registrados</p>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────── */
/* Componentes de forma */
/* ─────────────────────────────────────── */

function ProcedimientoForm({
  onSave,
  onCancel,
  citaFecha,
}: {
  onSave: (data: any) => void
  onCancel: () => void
  citaFecha: string
}) {
  const [tipo, setTipo] = useState('Consulta')
  const [descripcion, setDescripcion] = useState('')
  const [costo, setCosto] = useState('0')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({ tipo, descripcion, costo, fecha: citaFecha, estado: 'realizado' })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de procedimiento</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-azure"
        >
          <option>Consulta</option>
          <option>Limpieza</option>
          <option>Endodoncia</option>
          <option>Extracción</option>
          <option>Blanqueamiento</option>
          <option>Carilla</option>
          <option>Corona</option>
          <option>Prótesis</option>
          <option>Implante</option>
          <option>Ortodoncia</option>
          <option>Armonía facial</option>
          <option>Otro</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          placeholder="Detalles del procedimiento"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-azure resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Costo ($)</label>
        <input
          type="number"
          step="0.01"
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-azure"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

function PagoForm({
  onSave,
  onCancel,
  citaFecha,
  montoSugerido,
  procedimientosDescripcion,
}: {
  onSave: (data: any) => void
  onCancel: () => void
  citaFecha: string
  montoSugerido: number
  procedimientosDescripcion: string
}) {
  const [monto, setMonto] = useState(montoSugerido.toString())
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [estado, setEstado] = useState('pagado')
  const [notas, setNotas] = useState(procedimientosDescripcion || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({ monto, metodo_pago: metodoPago, estado, notas, fecha: citaFecha })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Monto ($)</label>
          <input
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-azure font-bold"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Método</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-azure"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="cheque">Cheque</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-azure"
        >
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
          <option value="parcial">Parcial</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Descripción del pago"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-azure resize-none"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
