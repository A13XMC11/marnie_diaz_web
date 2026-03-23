import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

interface Paciente { id: string; nombre: string; apellido: string }
interface Diente { id?: string; paciente_id?: string; diente_numero: number; estado: string; notas: string; fecha: string }

const DIENTES_FDI = [
  [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28],
  [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
]
const ESTADOS = ['sano','caries','obturado','extraccion','corona','puente','implante','fractura','otro'] as const
const ESTADO_COLORS: Record<string, string> = {
  sano:'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
  caries:'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
  obturado:'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  extraccion:'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300',
  corona:'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
  puente:'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
  implante:'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200',
  fractura:'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
  otro:'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
}

export default function Odontograma() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState('')
  const [odontograma, setOdontograma] = useState<Record<number, Diente>>({})
  const [loading, setLoading] = useState(false)
  const [selectedDiente, setSelectedDiente] = useState<number | null>(null)
  const [dienteForm, setDienteForm] = useState<{estado:string; notas:string}>({estado:'sano',notas:''})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('pacientes').select('id, nombre, apellido').order('apellido').then(({data}) => setPacientes(data ?? []))
  }, [])

  const fetchOdontograma = useCallback(async (pid: string) => {
    setLoading(true)
    const { data } = await supabase.from('odontograma').select('*').eq('paciente_id', pid)
    const map: Record<number, Diente> = {}
    for (const d of (data ?? [])) map[d.diente_numero] = d
    setOdontograma(map)
    setLoading(false)
  }, [])

  const handleSelectPaciente = (id: string) => {
    setSelectedPaciente(id)
    setSelectedDiente(null)
    if (id) fetchOdontograma(id)
    else setOdontograma({})
  }

  const abrirDiente = (num: number) => {
    if (!selectedPaciente) return
    const existing = odontograma[num]
    setSelectedDiente(num)
    setDienteForm({ estado: existing?.estado ?? 'sano', notas: existing?.notas ?? '' })
  }

  const guardarDiente = async () => {
    if (!selectedPaciente || selectedDiente === null) return
    setSaving(true)
    const existing = odontograma[selectedDiente]
    const payload = { ...dienteForm, fecha: new Date().toISOString().split('T')[0] }
    if (existing?.id) {
      await supabase.from('odontograma').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('odontograma').insert({ paciente_id: selectedPaciente, diente_numero: selectedDiente, ...payload })
    }
    setSaving(false)
    setSelectedDiente(null)
    fetchOdontograma(selectedPaciente)
  }

  const stats = ESTADOS.map(e => ({
    label: e, count: Object.values(odontograma).filter(d => d.estado === e).length,
    cls: ESTADO_COLORS[e]
  })).filter(s => s.count > 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-deep">Odontograma</h1>
        <p className="text-sm text-gray-500 mt-0.5">Estado dental por diente (numeración FDI)</p>
      </div>

      {/* Select paciente */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Seleccionar paciente</label>
        <select
          value={selectedPaciente}
          onChange={e => handleSelectPaciente(e.target.value)}
          className="w-full md:w-96 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure"
        >
          <option value="">— Selecciona un paciente —</option>
          {pacientes.map(p => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
        </select>
      </div>

      {!selectedPaciente ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🦷</div>
          <p className="font-medium text-lg">Selecciona un paciente para ver su odontograma</p>
          <p className="text-sm mt-1">Haz clic en cualquier diente para registrar o actualizar su estado</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-azure border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          {/* Labels superior */}
          <div className="flex justify-between mb-2 px-2">
            <span className="text-xs font-medium text-gray-400">SUPERIOR DERECHO</span>
            <span className="text-xs font-medium text-gray-400">SUPERIOR IZQUIERDO</span>
          </div>

          {/* Arcadas */}
          <div className="space-y-3">
            {DIENTES_FDI.map((row, ri) => (
              <div key={ri}>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {row.map(num => {
                    const d = odontograma[num]
                    const estado = d?.estado ?? 'sano'
                    const cls = ESTADO_COLORS[estado] ?? ESTADO_COLORS.otro
                    return (
                      <button
                        key={num}
                        onClick={() => abrirDiente(num)}
                        title={`Diente ${num}${d ? ` — ${d.estado}` : ''}`}
                        className={`w-11 h-13 min-h-[52px] rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer font-medium ${cls} ${selectedDiente===num ? 'ring-2 ring-azure ring-offset-1 scale-110' : ''}`}
                      >
                        <span className="text-[10px] font-bold">{num}</span>
                        <span className="text-[8px] leading-tight w-full text-center px-0.5 truncate capitalize">{d?.estado ?? '—'}</span>
                      </button>
                    )
                  })}
                </div>
                {ri === 0 && (
                  <>
                    <div className="flex justify-center my-1.5">
                      <div className="h-px bg-gray-200 w-full max-w-xl relative">
                        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400 font-medium">MAXILAR</span>
                      </div>
                    </div>
                    <div className="flex justify-center my-1.5">
                      <div className="h-px bg-gray-200 w-full max-w-xl relative">
                        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400 font-medium">MANDÍBULA</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Labels inferior */}
          <div className="flex justify-between mt-2 px-2">
            <span className="text-xs font-medium text-gray-400">INFERIOR DERECHO</span>
            <span className="text-xs font-medium text-gray-400">INFERIOR IZQUIERDO</span>
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Resumen de estado dental</p>
              <div className="flex flex-wrap gap-2">
                {stats.map(({label, count, cls}) => (
                  <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-medium ${cls} capitalize`}>
                    {label} <span className="font-bold text-sm">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leyenda completa */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 mb-2">Leyenda</p>
            <div className="flex flex-wrap gap-2">
              {ESTADOS.map(e => (
                <span key={e} className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${ESTADO_COLORS[e]}`}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal editar diente */}
      {selectedDiente !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-deep text-lg">🦷 Diente {selectedDiente}</h3>
              <button onClick={() => setSelectedDiente(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Estado</label>
                <div className="grid grid-cols-3 gap-2">
                  {ESTADOS.map(e => (
                    <button key={e} onClick={() => setDienteForm({...dienteForm, estado:e})}
                      className={`py-2 px-2 rounded-lg text-xs font-medium capitalize border transition-all ${dienteForm.estado===e ? `${ESTADO_COLORS[e]} ring-2 ring-offset-1 ring-current` : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Notas</label>
                <textarea
                  value={dienteForm.notas}
                  onChange={e => setDienteForm({...dienteForm, notas:e.target.value})}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure resize-none"
                  placeholder="Observaciones, tratamiento indicado..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setSelectedDiente(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={guardarDiente} disabled={saving}
                className="flex-1 bg-azure text-white py-2.5 rounded-xl text-sm hover:bg-deep transition-all disabled:opacity-60">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
