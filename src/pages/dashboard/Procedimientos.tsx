'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { validateData, procedimientoSchema } from '../../lib/validation'
import { sanitizeErrorMessage } from '../../lib/security'

const formatDate = (dateStr: string) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })

interface Procedimiento {
  id: string; paciente_id: string; tipo: string; descripcion: string
  costo: number; fecha: string; estado: string
  pacientes?: { nombre: string; apellido: string }
}
interface Paciente { id: string; nombre: string; apellido: string }

const TIPOS = ['Consulta','Limpieza','Endodoncia','Extracción','Blanqueamiento','Carilla','Corona','Prótesis','Implante','Ortodoncia','Armonía facial','Otro']
const emptyForm = { paciente_id:'', tipo:'Consulta', descripcion:'', costo:0, fecha:new Date().toISOString().split('T')[0], estado:'realizado' }

export default function Procedimientos() {
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Procedimiento | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [filtroPaciente, setFiltroPaciente] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [pr, p] = await Promise.all([
      supabase.from('procedimientos').select('*, pacientes(nombre, apellido)').order('fecha', { ascending: false }),
      supabase.from('pacientes').select('id, nombre, apellido').order('apellido'),
    ])
    setProcedimientos(pr.data ?? [])
    setPacientes(p.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openNew = () => { setEditing(null); setForm({...emptyForm, fecha: new Date().toISOString().split('T')[0]}); setError(''); setShowModal(true) }
  const openEdit = (pr: Procedimiento) => { setEditing(pr); setForm({ paciente_id:pr.paciente_id, tipo:pr.tipo, descripcion:pr.descripcion, costo:pr.costo, fecha:pr.fecha, estado:pr.estado }); setError(''); setShowModal(true) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setFieldErrors({})

    const { valid, data: validatedData, errors: validationErrors } = validateData(procedimientoSchema, form)

    if (!valid) {
      setFieldErrors(validationErrors || {})
      setSaving(false)
      return
    }

    try {
      const estadoAnterior = editing?.estado
      const { error: dbError } = editing
        ? await supabase.from('procedimientos').update(validatedData).eq('id', editing.id)
        : await supabase.from('procedimientos').insert(validatedData)
      setSaving(false)
      if (dbError) {
        setError(sanitizeErrorMessage(dbError))
        return
      }
      // Crear pago pendiente automático:
      // - Al crear nuevo procedimiento con costo > 0
      // - Al editar y cambiar estado a "realizado"
      const debeCrearPago =
        (!editing && Number(form.costo) > 0) ||
        (editing && form.estado === 'realizado' && estadoAnterior !== 'realizado')
      if (debeCrearPago && form.paciente_id) {
        await supabase.from('pagos').insert({
          paciente_id: form.paciente_id,
          cita_id: null,
          monto: Number(form.costo) || 0,
          fecha: new Date().toISOString().split('T')[0],
          metodo_pago: 'efectivo',
          estado: 'pendiente',
          notas: `Pago por ${form.tipo}${form.descripcion ? ' - ' + form.descripcion : ''}`,
        })
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      setSaving(false)
      setError(sanitizeErrorMessage(err))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este procedimiento?')) return
    await supabase.from('procedimientos').delete().eq('id', id)
    fetchData()
  }

  const filtered = procedimientos.filter(p => !filtroPaciente || p.paciente_id === filtroPaciente)
  const totalCosto = filtered.reduce((s, p) => s + (p.costo ?? 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-deep">Procedimientos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tratamientos realizados por paciente</p>
        </div>
        <button onClick={openNew} className="bg-azure hover:bg-deep text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-azure/30">
          + Nuevo procedimiento
        </button>
      </div>

      {/* Filtro paciente + stats */}
      <div className="flex gap-4 mb-5 flex-wrap items-center">
        <select value={filtroPaciente} onChange={e=>setFiltroPaciente(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white">
          <option value="">Todos los pacientes</option>
          {pacientes.map(p => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
        </select>
        {filtroPaciente && (
          <div className="bg-azure/10 border border-azure/20 text-azure rounded-xl px-4 py-2 text-sm font-medium">
            Total: <span className="font-bold">${totalCosto.toFixed(2)}</span>
          </div>
        )}
        <div className="ml-auto text-xs text-gray-400">{filtered.length} procedimientos</div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-azure border-t-transparent rounded-full animate-spin"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3">🔬</div><p className="font-medium">Sin procedimientos registrados</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Paciente','Tipo','Fecha','Costo','Estado',''].map(h => <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(pr => (
                <tr key={pr.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-800">{pr.pacientes ? `${pr.pacientes.nombre} ${pr.pacientes.apellido}` : '—'}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-800">{pr.tipo}</div>
                    {pr.descripcion && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{pr.descripcion}</div>}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{formatDate(pr.fecha)}</td>
                  <td className="px-5 py-4 font-bold text-deep">${pr.costo?.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pr.estado==='realizado'?'bg-green-100 text-green-700':pr.estado==='cancelado'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{pr.estado}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(pr)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-all">Editar</button>
                      <button onClick={() => handleDelete(pr.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-all">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-deep">{editing ? 'Editar procedimiento' : 'Nuevo procedimiento'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Paciente *</label>
                <select required value={form.paciente_id} onChange={e=>setForm({...form,paciente_id:e.target.value})} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white ${fieldErrors.paciente_id ? 'border-red-300' : 'border-gray-200'}`}>
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(p=><option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
                </select>
                {fieldErrors.paciente_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.paciente_id[0]}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tipo *</label>
                  <select required value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white ${fieldErrors.tipo ? 'border-red-300' : 'border-gray-200'}`}>
                    {TIPOS.map(t=><option key={t}>{t}</option>)}
                  </select>
                  {fieldErrors.tipo && <p className="text-red-500 text-xs mt-1">{fieldErrors.tipo[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Fecha *</label>
                  <input type="date" required value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white ${fieldErrors.fecha ? 'border-red-300' : 'border-gray-200'}`}/>
                  {fieldErrors.fecha && <p className="text-red-500 text-xs mt-1">{fieldErrors.fecha[0]}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Descripción</label>
                <textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} rows={2} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure resize-none bg-white ${fieldErrors.descripcion ? 'border-red-300' : 'border-gray-200'}`}/>
                {fieldErrors.descripcion && <p className="text-red-500 text-xs mt-1">{fieldErrors.descripcion[0]}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Costo ($)</label>
                  <input type="number" min="0" step="0.01" value={form.costo || ''} onChange={e=>setForm({...form,costo:parseFloat(e.target.value)||0})} className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-azure bg-white ${fieldErrors.costo ? 'border-red-300' : 'border-gray-200'}`}/>
                  {fieldErrors.costo && <p className="text-red-500 text-xs mt-1">{fieldErrors.costo[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Estado</label>
                  <select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white ${fieldErrors.estado ? 'border-red-300' : 'border-gray-200'}`}>
                    {['planificado','realizado','cancelado'].map(e=><option key={e}>{e}</option>)}
                  </select>
                  {fieldErrors.estado && <p className="text-red-500 text-xs mt-1">{fieldErrors.estado[0]}</p>}
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-azure hover:bg-deep text-white py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-60">{saving ? 'Guardando...' : (editing ? 'Actualizar' : 'Crear')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
