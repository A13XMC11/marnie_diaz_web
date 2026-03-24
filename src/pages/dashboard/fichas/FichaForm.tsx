import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import OdontogramaSVG from '../../../components/odontograma/OdontogramaSVG'
import { getDefaultOdontograma } from '../../../components/odontograma/odontogramaUtils'
import type {
  FichaClinica, SignosVitales, ExamenEstomatognatico,
  IndicadoresSaludBucal, DienteOdontograma
} from '../../../types/fichas'

interface Paciente { id: string; nombre: string; apellido: string; antecedentes: string }

const AREAS_EXAMEN: { key: keyof ExamenEstomatognatico; label: string }[] = [
  { key: 'labios', label: '1. Labios' },
  { key: 'mejillas', label: '2. Mejillas' },
  { key: 'maxilar_superior', label: '3. Maxilar Superior' },
  { key: 'maxilar_inferior', label: '4. Maxilar Inferior' },
  { key: 'lengua', label: '5. Lengua' },
  { key: 'paladar', label: '6. Paladar' },
  { key: 'piso', label: '7. Piso de boca' },
  { key: 'carrillos', label: '8. Carrillos' },
  { key: 'glandulas_salivales', label: '9. Glándulas salivales' },
  { key: 'orofaringe', label: '10. Orofaringe' },
  { key: 'atm', label: '11. ATM' },
  { key: 'ganglios', label: '12. Ganglios' },
]

function SectionHeader({ number, title, icon }: { number: string; title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 bg-gradient-to-br from-azure to-deep text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
        {number}
      </div>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-serif text-lg font-semibold text-deep">{title}</h2>
      </div>
    </div>
  )
}

export default function FichaForm() {
  const { id: pacienteId, fichaId } = useParams()
  const navigate = useNavigate()
  const isNew = !fichaId

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Section 1 — Datos de consulta
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [motivoConsulta, setMotivoConsulta] = useState('')
  const [enfermedadActual, setEnfermedadActual] = useState('')
  const [antecedentesVisita, setAntecedentesVisita] = useState('')

  // Section 2 — Signos vitales
  const [signosVitales, setSignosVitales] = useState<SignosVitales>({
    presion_arterial: '', frecuencia_cardiaca: 0, frecuencia_respiratoria: 0,
    temperatura_bucal: 0, temperatura_axilar: 0, peso: 0, talla: 0,
  })

  // Section 3 — Examen estomatognático
  const [examen, setExamen] = useState<ExamenEstomatognatico>({
    labios: '', mejillas: '', maxilar_superior: '', maxilar_inferior: '',
    lengua: '', paladar: '', piso: '', carrillos: '',
    glandulas_salivales: '', orofaringe: '', atm: '', ganglios: '',
  })

  // Section 4 — Odontograma
  const [dientes, setDientes] = useState<DienteOdontograma[]>(getDefaultOdontograma())

  // Section 5 — Indicadores de salud bucal
  const [indicadores, setIndicadores] = useState<IndicadoresSaludBucal>({
    ihos: 0, indice_placa: 0, indice_calculo: 0, indice_sangrado: 0,
    enfermedad_periodontal: '', maloclusion: '', fluorosis: '',
    cpo: { cariados: 0, perdidos: 0, obturados: 0 },
    ceo: { cariados: 0, perdidos: 0, obturados: 0 },
  })

  // Section 6 — Observaciones
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    if (!pacienteId) return

    // Load patient data
    supabase.from('pacientes').select('*').eq('id', pacienteId).single()
      .then(({ data }: { data: Paciente | null }) => {
        if (data) {
          setPaciente(data)
          setAntecedentesVisita(data.antecedentes ?? '')
        }
      })

    // Load current odontogram
    supabase.from('odontograma').select('*').eq('paciente_id', pacienteId)
      .then(({ data }: { data: any[] | null }) => {
        if (data && data.length > 0) {
          const base = getDefaultOdontograma()
          for (const record of data) {
            if (record.superficies) {
              const idx = base.findIndex(d => d.numero === record.diente_numero)
              if (idx >= 0) base[idx] = { numero: record.diente_numero, superficies: record.superficies, notas: record.notas }
            }
          }
          setDientes(base)
        }
      })

    // If editing, load existing ficha
    if (!isNew && fichaId) {
      supabase.from('fichas_clinicas').select('*').eq('id', fichaId).single()
        .then(({ data }: { data: FichaClinica | null }) => {
          if (data) {
            setFecha(data.fecha)
            setMotivoConsulta(data.motivo_consulta)
            setEnfermedadActual(data.enfermedad_actual)
            setAntecedentesVisita(data.antecedentes_visita)
            if (data.signos_vitales) setSignosVitales(data.signos_vitales)
            if (data.examen_estomatognatico) setExamen(data.examen_estomatognatico)
            if (data.odontograma_snapshot) setDientes(data.odontograma_snapshot)
            if (data.indicadores_salud) setIndicadores(data.indicadores_salud)
            setObservaciones(data.observaciones)
          }
        })
    }
  }, [pacienteId, fichaId, isNew])

  const handleSave = async () => {
    if (!motivoConsulta.trim()) { setError('El motivo de consulta es obligatorio.'); return }
    setSaving(true); setError('')

    const payload = {
      paciente_id: pacienteId,
      fecha, motivo_consulta: motivoConsulta, enfermedad_actual: enfermedadActual,
      antecedentes_visita: antecedentesVisita, signos_vitales: signosVitales,
      examen_estomatognatico: examen, odontograma_snapshot: dientes,
      indicadores_salud: indicadores, observaciones,
    }

    const { error: dbError } = isNew
      ? await supabase.from('fichas_clinicas').insert(payload)
      : await supabase.from('fichas_clinicas').update(payload).eq('id', fichaId)

    setSaving(false)
    if (dbError) { setError('Error al guardar. Intenta de nuevo.'); return }
    navigate(`/dashboard/pacientes/${pacienteId}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-azure transition-colors mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-2xl font-serif font-bold text-deep">{isNew ? 'Nueva Ficha Clínica' : 'Editar Ficha'}</h1>
          {paciente && (
            <p className="text-sm text-gray-500 mt-0.5">
              Paciente: {paciente.nombre} {paciente.apellido}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-azure hover:bg-deep text-white font-medium px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-azure/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Guardando...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 3v4H9V3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v6m-3-3h6" />
            </svg>Guardar ficha</>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      <div className="space-y-6">
        {/* ── SECCIÓN 1: Datos de Consulta ─────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader number="1" title="Datos de Consulta" icon={
            <svg className="w-5 h-5 text-azure" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          } />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Fecha de consulta</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure transition-colors bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Motivo de consulta <span className="text-red-400">*</span>
              </label>
              <textarea value={motivoConsulta} onChange={e => setMotivoConsulta(e.target.value)} rows={2}
                placeholder="¿Por qué acude el paciente?" required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure transition-colors resize-none bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Enfermedad o problema actual</label>
              <textarea value={enfermedadActual} onChange={e => setEnfermedadActual(e.target.value)} rows={3}
                placeholder="Síntomas, cronología, localización, características, intensidad, causa aparente..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure transition-colors resize-none bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Antecedentes personales y familiares</label>
              <textarea value={antecedentesVisita} onChange={e => setAntecedentesVisita(e.target.value)} rows={2}
                placeholder="Alergias, enfermedades crónicas, medicación actual..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure transition-colors resize-none bg-white" />
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 2: Signos Vitales ─────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader number="2" title="Signos Vitales y Mediciones" icon={
            <svg className="w-5 h-5 text-azure" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          } />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Presión arterial', key: 'presion_arterial', type: 'text', placeholder: '120/80' },
              { label: 'Frec. cardíaca (bpm)', key: 'frecuencia_cardiaca', type: 'number', placeholder: '72' },
              { label: 'Frec. respiratoria (rpm)', key: 'frecuencia_respiratoria', type: 'number', placeholder: '16' },
              { label: 'Temp. bucal (°C)', key: 'temperatura_bucal', type: 'number', placeholder: '36.5' },
              { label: 'Temp. axilar (°C)', key: 'temperatura_axilar', type: 'number', placeholder: '36.6' },
              { label: 'Peso (kg)', key: 'peso', type: 'number', placeholder: '65' },
              { label: 'Talla (cm)', key: 'talla', type: 'number', placeholder: '170' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                <input
                  type={type}
                  value={(signosVitales as any)[key] || ''}
                  onChange={e => setSignosVitales(prev => ({ ...prev, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure transition-colors bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── SECCIÓN 3: Examen Estomatognático ────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader number="3" title="Examen del Sistema Estomatognático" icon={
            <svg className="w-5 h-5 text-azure" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } />
          <p className="text-xs text-gray-500 mb-4">Describir la patología de la región afectada anotando el número</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AREAS_EXAMEN.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                <textarea
                  value={examen[key]}
                  onChange={e => setExamen(prev => ({ ...prev, [key]: e.target.value }))}
                  rows={2}
                  placeholder="Normal"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure transition-colors resize-none bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── SECCIÓN 4: Odontograma ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader number="4" title="Odontograma" icon={
            <svg className="w-5 h-5 text-azure" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } />
          <p className="text-xs text-gray-500 mb-4">
            Haz clic en las superficies del diente para registrar el estado.
            <span className="ml-2 font-medium text-red-600">Rojo = Patología actual</span>
            <span className="ml-2 font-medium text-blue-600">Azul = Tratamientos realizados</span>
          </p>
          <OdontogramaSVG
            dientes={dientes}
            mode="edit"
            onDientesChange={setDientes}
          />
        </div>

        {/* ── SECCIÓN 5: Indicadores de Salud Bucal ─────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader number="5" title="Indicadores de Salud Bucal" icon={
            <svg className="w-5 h-5 text-azure" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          } />

          {/* Indices grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'IHOS (0–3)', key: 'ihos' },
              { label: 'Índice placa (%)', key: 'indice_placa' },
              { label: 'Índice cálculo (%)', key: 'indice_calculo' },
              { label: 'Índice sangrado (%)', key: 'indice_sangrado' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                <input type="number" step="0.1"
                  value={(indicadores as any)[key] || ''}
                  onChange={e => setIndicadores(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure transition-colors bg-white"
                />
              </div>
            ))}
          </div>

          {/* Text descriptors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Enfermedad periodontal', key: 'enfermedad_periodontal' },
              { label: 'Maloclusión', key: 'maloclusion' },
              { label: 'Fluorosis', key: 'fluorosis' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                <input type="text"
                  value={(indicadores as any)[key]}
                  onChange={e => setIndicadores(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder="Descripción"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure transition-colors bg-white"
                />
              </div>
            ))}
          </div>

          {/* CPO/ceo table */}
          <div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-3">Índices de Caries</p>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                    <th className="px-4 py-2 text-left">Índice</th>
                    <th className="px-4 py-2 text-center">C — Cariados</th>
                    <th className="px-4 py-2 text-center">P — Perdidos</th>
                    <th className="px-4 py-2 text-center">O — Obturados</th>
                    <th className="px-4 py-2 text-center bg-gray-100">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { key: 'cpo', label: 'CPO (permanentes)' },
                    { key: 'ceo', label: 'ceo (temporales)' },
                  ].map(({ key, label }) => {
                    const val = indicadores[key as 'cpo' | 'ceo']
                    const total = val.cariados + val.perdidos + val.obturados
                    return (
                      <tr key={key} className="bg-white">
                        <td className="px-4 py-2 font-medium text-gray-700">{label}</td>
                        {(['cariados', 'perdidos', 'obturados'] as const).map(field => (
                          <td key={field} className="px-4 py-2 text-center">
                            <input
                              type="number" min="0"
                              value={val[field] || ''}
                              onChange={e => setIndicadores(prev => ({
                                ...prev,
                                [key]: { ...prev[key as 'cpo' | 'ceo'], [field]: parseInt(e.target.value) || 0 }
                              }))}
                              className="w-16 text-center border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-azure transition-colors bg-white"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center font-bold text-deep bg-gray-50">{total}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 6: Observaciones ───────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader number="6" title="Observaciones y Plan de Tratamiento" icon={
            <svg className="w-5 h-5 text-azure" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
          } />
          <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={5}
            placeholder="Diagnóstico, plan de tratamiento, recomendaciones, próxima cita..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure transition-colors resize-none bg-white"
          />
        </div>

        {/* Bottom actions */}
        <div className="flex gap-3 pb-6">
          <button onClick={() => navigate(-1)}
            className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-2 bg-azure hover:bg-deep text-white py-3 px-8 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-azure/30 disabled:opacity-60 disabled:transform-none">
            {saving ? 'Guardando...' : isNew ? 'Guardar ficha clínica' : 'Actualizar ficha'}
          </button>
        </div>
      </div>
    </div>
  )
}
