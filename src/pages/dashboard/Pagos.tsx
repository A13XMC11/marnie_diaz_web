import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

interface Pago {
  id: string; paciente_id: string; monto: number; fecha: string
  metodo_pago: string; estado: string; notas: string
  pacientes?: { nombre: string; apellido: string }
}
interface Paciente { id: string; nombre: string; apellido: string }

const METODOS = ['efectivo','transferencia','tarjeta','cheque','otro']
const emptyForm = { paciente_id:'', monto:0, fecha:new Date().toISOString().split('T')[0], metodo_pago:'efectivo', estado:'pagado', notas:'' }

export default function Pagos() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Pago | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filtroPaciente, setFiltroPaciente] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [pa, p] = await Promise.all([
      supabase.from('pagos').select('*, pacientes(nombre, apellido)').order('fecha', { ascending: false }),
      supabase.from('pacientes').select('id, nombre, apellido').order('apellido'),
    ])
    setPagos(pa.data ?? [])
    setPacientes(p.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openNew = () => { setEditing(null); setForm({...emptyForm, fecha:new Date().toISOString().split('T')[0]}); setShowModal(true) }
  const openEdit = (pa: Pago) => { setEditing(pa); setForm({ paciente_id:pa.paciente_id, monto:pa.monto, fecha:pa.fecha, metodo_pago:pa.metodo_pago, estado:pa.estado, notas:pa.notas }); setShowModal(true) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    if (editing) await supabase.from('pagos').update(form).eq('id', editing.id)
    else await supabase.from('pagos').insert(form)
    setSaving(false)
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este pago?')) return
    await supabase.from('pagos').delete().eq('id', id)
    fetchData()
  }

  const filtered = pagos.filter(p =>
    (!filtroPaciente || p.paciente_id === filtroPaciente) &&
    (filtroEstado === 'todos' || p.estado === filtroEstado)
  )

  const totalPagado = filtered.filter(p=>p.estado==='pagado').reduce((s,p)=>s+p.monto,0)
  const totalPendiente = filtered.filter(p=>p.estado==='pendiente').reduce((s,p)=>s+p.monto,0)

  const estadoClasses: Record<string,string> = {
    pagado:'bg-green-100 text-green-700', pendiente:'bg-amber-100 text-amber-700', parcial:'bg-blue-100 text-blue-700'
  }
  const metodoIcon: Record<string,string> = {
    efectivo:'💵', transferencia:'🏦', tarjeta:'💳', cheque:'📄', otro:'💰'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-deep">Pagos y Facturación</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registro de cobros y deudas pendientes</p>
        </div>
        <button onClick={openNew} className="bg-azure hover:bg-deep text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-azure/30">
          + Registrar pago
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          ['Total cobrado', `$${totalPagado.toFixed(2)}`, 'from-green-500 to-green-600', '💵'],
          ['Pendiente', `$${totalPendiente.toFixed(2)}`, 'from-amber-500 to-amber-600', '⏳'],
          ['Transacciones', filtered.length, 'from-azure to-deep', '📊'],
        ].map(([label, val, grad, icon]) => (
          <div key={label as string} className={`bg-gradient-to-br ${grad} rounded-2xl p-5 text-white`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-xs font-medium uppercase tracking-wider">{label}</span>
              <span className="text-2xl">{icon}</span>
            </div>
            <div className="text-3xl font-bold">{val}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={filtroPaciente} onChange={e=>setFiltroPaciente(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white">
          <option value="">Todos los pacientes</option>
          {pacientes.map(p => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
        </select>
        <div className="flex gap-2">
          {['todos','pagado','pendiente','parcial'].map(e => (
            <button key={e} onClick={() => setFiltroEstado(e)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filtroEstado===e ? 'bg-azure text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-azure'}`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-azure border-t-transparent rounded-full animate-spin"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3">💳</div><p className="font-medium">Sin pagos registrados</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(pa => (
            <div key={pa.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                {metodoIcon[pa.metodo_pago] ?? '💰'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800">{pa.pacientes ? `${pa.pacientes.nombre} ${pa.pacientes.apellido}` : '—'}</div>
                <div className="text-xs text-gray-400 mt-0.5 capitalize">{pa.metodo_pago} · {pa.fecha}</div>
                {pa.notas && <div className="text-xs text-gray-500 mt-0.5 italic">{pa.notas}</div>}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-deep">${pa.monto?.toFixed(2)}</div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium mt-1 inline-block ${estadoClasses[pa.estado] ?? 'bg-gray-100 text-gray-600'}`}>{pa.estado}</span>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0 ml-2">
                <button onClick={() => openEdit(pa)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-all">Editar</button>
                <button onClick={() => handleDelete(pa.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-all">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-deep">{editing ? 'Editar pago' : 'Registrar pago'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Paciente *</label>
                <select required value={form.paciente_id} onChange={e=>setForm({...form,paciente_id:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure">
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(p=><option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Monto ($) *</label><input type="number" min="0" step="0.01" required value={form.monto} onChange={e=>setForm({...form,monto:parseFloat(e.target.value)||0})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure"/></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Fecha *</label><input type="date" required value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Método</label>
                  <select value={form.metodo_pago} onChange={e=>setForm({...form,metodo_pago:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure capitalize">
                    {METODOS.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Estado</label>
                  <select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure">
                    {['pagado','pendiente','parcial'].map(e=><option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Notas</label><textarea value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure resize-none" placeholder="Concepto de pago, número de factura..."/></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-azure hover:bg-deep text-white py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-60">{saving?'Guardando...':(editing?'Actualizar':'Registrar pago')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
