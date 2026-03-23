import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Paciente {
  id: string; nombre: string; apellido: string; cedula: string
  fecha_nacimiento: string; telefono: string; email: string
  direccion: string; alergias: string; antecedentes: string
}
interface Cita { id: string; fecha: string; hora: string; motivo: string; estado: string; notas: string }
interface Procedimiento { id: string; tipo: string; descripcion: string; costo: number; fecha: string; estado: string }
interface Pago { id: string; monto: number; fecha: string; metodo_pago: string; estado: string; notas: string }
interface Diente { id?: string; paciente_id?: string; diente_numero: number; estado: string; notas: string; fecha: string }

const tabs = ['Datos', 'Citas', 'Procedimientos', 'Pagos', 'Odontograma'] as const
type Tab = typeof tabs[number]

const DIENTES_FDI = [
  [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28],
  [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
]
const ESTADO_COLORS: Record<string, string> = {
  sano:'bg-green-100 text-green-700 border-green-200',
  caries:'bg-red-100 text-red-700 border-red-200',
  obturado:'bg-blue-100 text-blue-700 border-blue-200',
  extraccion:'bg-gray-200 text-gray-700 border-gray-300',
  corona:'bg-yellow-100 text-yellow-700 border-yellow-200',
  puente:'bg-purple-100 text-purple-700 border-purple-200',
  implante:'bg-teal-100 text-teal-700 border-teal-200',
  fractura:'bg-orange-100 text-orange-700 border-orange-200',
  otro:'bg-gray-100 text-gray-600 border-gray-200',
}

export default function PacienteDetalle() {
  const { id } = useParams()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [citas, setCitas] = useState<Cita[]>([])
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [odontograma, setOdontograma] = useState<Record<number, Diente>>({})
  const [tab, setTab] = useState<Tab>('Datos')
  const [loading, setLoading] = useState(true)
  const [selectedDiente, setSelectedDiente] = useState<number | null>(null)
  const [dienteForm, setDienteForm] = useState<{estado:string; notas:string}>({estado:'sano',notas:''})
  const [savingDiente, setSavingDiente] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const [p, c, pr, pa, od] = await Promise.all([
      supabase.from('pacientes').select('*').eq('id', id).single(),
      supabase.from('citas').select('*').eq('paciente_id', id).order('fecha', { ascending: false }),
      supabase.from('procedimientos').select('*').eq('paciente_id', id).order('fecha', { ascending: false }),
      supabase.from('pagos').select('*').eq('paciente_id', id).order('fecha', { ascending: false }),
      supabase.from('odontograma').select('*').eq('paciente_id', id),
    ])
    setPaciente(p.data)
    setCitas(c.data ?? [])
    setProcedimientos(pr.data ?? [])
    setPagos(pa.data ?? [])
    const odMap: Record<number, Diente> = {}
    for (const d of (od.data ?? [])) odMap[d.diente_numero] = d
    setOdontograma(odMap)
    setLoading(false)
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  const abrirDiente = (num: number) => {
    const existing = odontograma[num]
    setSelectedDiente(num)
    setDienteForm({ estado: existing?.estado ?? 'sano', notas: existing?.notas ?? '' })
  }

  const guardarDiente = async () => {
    if (!id || selectedDiente === null) return
    setSavingDiente(true)
    const existing = odontograma[selectedDiente]
    if (existing?.id) {
      await supabase.from('odontograma').update({ ...dienteForm, fecha: new Date().toISOString().split('T')[0] }).eq('id', existing.id)
    } else {
      await supabase.from('odontograma').insert({ paciente_id: id, diente_numero: selectedDiente, ...dienteForm, fecha: new Date().toISOString().split('T')[0] })
    }
    setSavingDiente(false)
    setSelectedDiente(null)
    fetchAll()
  }

  const totalPagado = pagos.filter(p=>p.estado==='pagado').reduce((s,p)=>s+p.monto,0)
  const totalPendiente = pagos.filter(p=>p.estado==='pendiente').reduce((s,p)=>s+p.monto,0)

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-azure border-t-transparent rounded-full animate-spin"/></div>
  if (!paciente) return <div className="text-center py-20 text-gray-500">Paciente no encontrado</div>

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/dashboard/pacientes" className="hover:text-azure transition-colors">Pacientes</Link>
        <span>›</span>
        <span className="text-gray-800 font-medium">{paciente.nombre} {paciente.apellido}</span>
      </div>

      {/* Patient header */}
      <div className="bg-gradient-to-r from-deep to-azure rounded-2xl p-6 mb-6 text-white flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold font-serif">
          {paciente.nombre[0]}{paciente.apellido[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{paciente.nombre} {paciente.apellido}</h1>
          <p className="text-white/70 text-sm mt-0.5">CI: {paciente.cedula || 'Sin cédula'} · {paciente.telefono || 'Sin teléfono'}</p>
          {paciente.alergias && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/30 text-amber-100 text-xs px-3 py-1 rounded-full">
              ⚠ Alergia: {paciente.alergias}
            </div>
          )}
        </div>
        <div className="hidden md:flex gap-6 text-center">
          <div><div className="text-2xl font-bold">{citas.length}</div><div className="text-white/60 text-xs mt-0.5">Citas</div></div>
          <div><div className="text-2xl font-bold">{procedimientos.length}</div><div className="text-white/60 text-xs mt-0.5">Procedimientos</div></div>
          <div><div className="text-2xl font-bold text-green-300">${totalPagado.toFixed(0)}</div><div className="text-white/60 text-xs mt-0.5">Pagado</div></div>
          {totalPendiente > 0 && <div><div className="text-2xl font-bold text-amber-300">${totalPendiente.toFixed(0)}</div><div className="text-white/60 text-xs mt-0.5">Pendiente</div></div>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 min-w-max py-2 px-4 text-sm font-medium rounded-lg transition-all ${tab===t ? 'bg-white text-azure shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Datos */}
      {tab === 'Datos' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[['Nombre completo', `${paciente.nombre} ${paciente.apellido}`],['Cédula', paciente.cedula],['Fecha de nacimiento', paciente.fecha_nacimiento],['Teléfono', paciente.telefono],['Email', paciente.email],['Dirección', paciente.direccion]].map(([label,val])=>(
              <div key={label}><div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</div><div className="text-gray-800 text-sm font-medium">{val || '—'}</div></div>
            ))}
          </div>
          {paciente.alergias && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-1">⚠ Alergias</div>
              <div className="text-amber-800 text-sm">{paciente.alergias}</div>
            </div>
          )}
          {paciente.antecedentes && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-1">Antecedentes médicos</div>
              <div className="text-blue-800 text-sm whitespace-pre-line">{paciente.antecedentes}</div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Citas */}
      {tab === 'Citas' && (
        <div className="space-y-3">
          {citas.length === 0 ? <div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2">📅</div><p>Sin citas registradas</p></div> :
            citas.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4 shadow-sm">
                <div className="bg-azure/10 rounded-lg p-3 text-center min-w-[60px]">
                  <div className="text-azure font-bold text-sm">{c.fecha.split('-')[2]}</div>
                  <div className="text-azure/70 text-xs">{new Date(c.fecha+'T12:00').toLocaleString('es', {month:'short'}).toUpperCase()}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{c.motivo || 'Sin motivo'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.estado==='completada'?'bg-green-100 text-green-700':c.estado==='cancelada'?'bg-red-100 text-red-700':c.estado==='confirmada'?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-700'}`}>{c.estado}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">🕐 {c.hora}</p>
                  {c.notas && <p className="text-sm text-gray-600 mt-1 italic">"{c.notas}"</p>}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Tab: Procedimientos */}
      {tab === 'Procedimientos' && (
        <div className="space-y-3">
          {procedimientos.length === 0 ? <div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2">🔬</div><p>Sin procedimientos registrados</p></div> :
            procedimientos.map(pr => (
              <div key={pr.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4 shadow-sm">
                <div><div className="font-semibold text-gray-800">{pr.tipo}</div>
                  {pr.descripcion && <p className="text-sm text-gray-500 mt-0.5">{pr.descripcion}</p>}
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span>{pr.fecha}</span>
                    <span className={`px-2 py-0.5 rounded-full ${pr.estado==='realizado'?'bg-green-100 text-green-700':pr.estado==='cancelado'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{pr.estado}</span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="font-bold text-deep text-lg">${pr.costo?.toFixed(2)}</div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Tab: Pagos */}
      {tab === 'Pagos' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[['Total pagado', `$${totalPagado.toFixed(2)}`, 'text-green-600 bg-green-50 border-green-100'],['Pendiente', `$${totalPendiente.toFixed(2)}`, 'text-amber-600 bg-amber-50 border-amber-100'],['Transacciones', pagos.length, 'text-azure bg-blue-50 border-blue-100']].map(([l,v,cls])=>(
              <div key={l as string} className={`rounded-xl border p-4 ${cls}`}>
                <div className="text-xs font-medium uppercase tracking-wider opacity-70 mb-1">{l}</div>
                <div className="text-2xl font-bold">{v}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {pagos.length === 0 ? <div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2">💳</div><p>Sin pagos registrados</p></div> :
              pagos.map(pa => (
                <div key={pa.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg">💳</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{pa.metodo_pago}</div>
                    <div className="text-xs text-gray-400">{pa.fecha} {pa.notas && `· ${pa.notas}`}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-deep">${pa.monto?.toFixed(2)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pa.estado==='pagado'?'bg-green-100 text-green-700':pa.estado==='pendiente'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}`}>{pa.estado}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Tab: Odontograma */}
      {tab === 'Odontograma' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-5">Mapa dental — Click en un diente para registrar/editar estado</h3>
          <div className="space-y-4">
            {DIENTES_FDI.map((row, ri) => (
              <div key={ri} className="flex gap-2 flex-wrap justify-center">
                {row.map(num => {
                  const d = odontograma[num]
                  const cls = ESTADO_COLORS[d?.estado ?? 'sano']
                  return (
                    <button key={num} onClick={() => abrirDiente(num)}
                      className={`w-12 h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105 hover:shadow-md ${cls}`}>
                      <span className="text-[10px] font-bold">{num}</span>
                      <span className="text-[8px] leading-tight text-center px-0.5">{d?.estado?.slice(0,3) ?? '—'}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          {/* Leyenda */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {Object.entries(ESTADO_COLORS).map(([estado, cls]) => (
              <span key={estado} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cls}`}>{estado}</span>
            ))}
          </div>
        </div>
      )}

      {/* Modal editar diente */}
      {selectedDiente !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-deep text-lg mb-4">Diente {selectedDiente}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Estado</label>
                <select value={dienteForm.estado} onChange={e=>setDienteForm({...dienteForm,estado:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure">
                  {Object.keys(ESTADO_COLORS).map(e=><option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Notas</label>
                <textarea value={dienteForm.notas} onChange={e=>setDienteForm({...dienteForm,notas:e.target.value})} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure resize-none" placeholder="Observaciones..."/>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={()=>setSelectedDiente(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={guardarDiente} disabled={savingDiente} className="flex-1 bg-azure text-white py-2.5 rounded-xl text-sm hover:bg-deep transition-all disabled:opacity-60">{savingDiente ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
