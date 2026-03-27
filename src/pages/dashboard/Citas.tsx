import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

interface Cita {
  id: string; paciente_id: string; fecha: string; hora: string
  motivo: string; estado: string; notas: string
  pacientes?: { nombre: string; apellido: string }
}
interface Paciente { id: string; nombre: string; apellido: string }

const ESTADOS = ['programada','confirmada','completada','cancelada'] as const
const emptyForm = { paciente_id:'', fecha:'', hora:'08:30', motivo:'', estado:'programada' as string, notas:'' }

export default function Citas() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Cita | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [c, p] = await Promise.all([
      supabase.from('citas').select('*, pacientes(nombre, apellido)').order('fecha', { ascending: false }).order('hora'),
      supabase.from('pacientes').select('id, nombre, apellido').order('apellido'),
    ])
    setCitas(c.data ?? [])
    setPacientes(p.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openNew = () => { setEditing(null); setForm({...emptyForm, fecha: new Date().toISOString().split('T')[0]}); setError(''); setShowModal(true) }
  const openEdit = (c: Cita) => { setEditing(c); setForm({ paciente_id:c.paciente_id, fecha:c.fecha, hora:c.hora, motivo:c.motivo, estado:c.estado, notas:c.notas }); setError(''); setShowModal(true) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error: dbError } = editing
      ? await supabase.from('citas').update(form).eq('id', editing.id)
      : await supabase.from('citas').insert(form)
    setSaving(false)
    if (dbError) { setError(dbError.message); return }
    setShowModal(false)
    fetchData()
  }

  const cambiarEstado = async (id: string, estado: string) => {
    const { error: dbError } = await supabase.from('citas').update({ estado }).eq('id', id)
    if (dbError) { alert(dbError.message); return }
    fetchData()
  }

  const filtered = citas.filter(c => filtroEstado === 'todos' || c.estado === filtroEstado)

  const estadoClasses: Record<string, string> = {
    programada: 'bg-yellow-100 text-yellow-700',
    confirmada: 'bg-blue-100 text-blue-700',
    completada: 'bg-green-100 text-green-700',
    cancelada: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-deep">Citas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Agenda y gestión de citas</p>
        </div>
        <button onClick={openNew} className="bg-azure hover:bg-deep text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-azure/30">
          + Nueva cita
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['todos', ...ESTADOS].map(e => (
          <button key={e} onClick={() => setFiltroEstado(e)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filtroEstado===e ? 'bg-azure text-white shadow-lg shadow-azure/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-azure'}`}>
            {e}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-azure border-t-transparent rounded-full animate-spin"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3">📅</div><p className="font-medium">No hay citas</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-azure/10 rounded-xl p-3 text-center min-w-[64px] flex-shrink-0">
                <div className="text-azure font-bold text-lg leading-none">{c.fecha.split('-')[2]}</div>
                <div className="text-azure/70 text-xs mt-0.5">{new Date(c.fecha+'T12:00').toLocaleString('es',{month:'short'}).toUpperCase()}</div>
                <div className="text-azure/60 text-xs">{c.hora?.slice(0,5)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800">{c.pacientes ? `${c.pacientes.nombre} ${c.pacientes.apellido}` : 'Paciente'}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${estadoClasses[c.estado] ?? 'bg-gray-100 text-gray-600'}`}>{c.estado}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{c.motivo || 'Sin motivo especificado'}</p>
                {c.notas && <p className="text-xs text-gray-400 mt-1 italic">{c.notas}</p>}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => openEdit(c)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-all">Editar</button>
                {c.estado !== 'completada' && c.estado !== 'cancelada' && (
                  <button onClick={() => cambiarEstado(c.id, c.estado === 'programada' ? 'confirmada' : 'completada')}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg transition-all">
                    {c.estado === 'programada' ? 'Confirmar' : 'Completar'}
                  </button>
                )}
                {c.estado !== 'cancelada' && (
                  <button onClick={() => { if (!confirm('¿Confirmar cancelación de esta cita?')) return; cambiarEstado(c.id, 'cancelada') }} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-all">Cancelar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-deep">{editing ? 'Editar cita' : 'Nueva cita'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Paciente *</label>
                <select required value={form.paciente_id} onChange={e=>setForm({...form,paciente_id:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white">
                  <option value="">Selecciona un paciente</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Fecha *</label><input type="date" required value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white"/></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Hora *</label><input type="time" required value={form.hora} onChange={e=>setForm({...form,hora:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white"/></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Motivo</label><input value={form.motivo} onChange={e=>setForm({...form,motivo:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white" placeholder="Ej: Revisión general, endodoncia..."/></div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Estado</label>
                <select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white">
                  {ESTADOS.map(e=><option key={e}>{e}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Notas</label><textarea value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure resize-none bg-white" placeholder="Observaciones adicionales..."/></div>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-azure hover:bg-deep text-white py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-60">{saving ? 'Guardando...' : (editing ? 'Actualizar' : 'Crear cita')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
