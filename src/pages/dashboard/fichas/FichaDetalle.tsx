import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { supabase } from '../../../lib/supabase'
import OdontogramaSVG from '../../../components/odontograma/OdontogramaSVG'
import FichaPDF from '../../../components/pdf/FichaPDF'
import { getDefaultOdontograma } from '../../../components/odontograma/odontogramaUtils'
import type { FichaClinica } from '../../../types/fichas'

const AREAS_LABELS: Record<string, string> = {
  labios: '1. Labios', mejillas: '2. Mejillas', maxilar_superior: '3. Maxilar Superior',
  maxilar_inferior: '4. Maxilar Inferior', lengua: '5. Lengua', paladar: '6. Paladar',
  piso: '7. Piso de boca', carrillos: '8. Carrillos',
  glandulas_salivales: '9. Glándulas salivales', orofaringe: '10. Orofaringe',
  atm: '11. ATM', ganglios: '12. Ganglios',
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-ice flex items-center justify-center text-azure">
          {icon}
        </div>
        <h2 className="font-serif font-semibold text-deep">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function FieldDisplay({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-800">{value || <span className="text-gray-400 italic">Sin registrar</span>}</p>
    </div>
  )
}

interface Paciente {
  nombre: string
  apellido: string
  cedula?: string
  sexo?: string
  fecha_nacimiento?: string
}

export default function FichaDetalle() {
  const { id: pacienteId, fichaId } = useParams()
  const navigate = useNavigate()
  const [ficha, setFicha] = useState<FichaClinica | null>(null)
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!fichaId) return
    supabase.from('fichas_clinicas').select('*').eq('id', fichaId).single()
      .then(async ({ data, error: dbError }: { data: FichaClinica | null; error: { message: string } | null }) => {
        if (dbError) {
          setError(dbError.message)
          setLoading(false)
          return
        }
        setFicha(data)

        // Fetch paciente data
        if (data?.paciente_id) {
          const { data: pacData } = await supabase
            .from('pacientes')
            .select('nombre, apellido, cedula, sexo, fecha_nacimiento')
            .eq('id', data.paciente_id)
            .single()
          if (pacData) setPaciente(pacData as Paciente)
        }
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error de red')
        setLoading(false)
      })
  }, [fichaId])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-azure border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-2">Error al cargar la ficha: {error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-azure hover:text-deep text-sm transition-colors">← Volver</button>
      </div>
    )
  }

  if (!ficha) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Ficha no encontrada.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-azure hover:text-deep text-sm transition-colors">← Volver</button>
      </div>
    )
  }

  const fechaFormatted = new Date(ficha.fecha + 'T12:00:00').toLocaleDateString('es-EC', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const dientes = ficha.odontograma_snapshot && ficha.odontograma_snapshot.length > 0
    ? (() => {
        const base = getDefaultOdontograma()
        for (const snap of ficha.odontograma_snapshot) {
          const idx = base.findIndex(d => d.numero === snap.numero)
          if (idx >= 0) base[idx] = snap
        }
        return base
      })()
    : getDefaultOdontograma()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-azure transition-colors mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a historia clínica
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-deep">{ficha.motivo_consulta}</h1>
            <p className="text-sm text-gray-500 mt-0.5 capitalize">{fechaFormatted}</p>
          </div>
          <div className="flex gap-2">
            {paciente && (
              <PDFDownloadLink
                document={<FichaPDF ficha={ficha} paciente={paciente} />}
                fileName={`ficha_${ficha.fecha}.pdf`}
              >
                <button className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 text-sm font-medium px-4 py-2 rounded-xl transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Descargar PDF
                </button>
              </PDFDownloadLink>
            )}
            <Link
              to={`/dashboard/pacientes/${pacienteId}/fichas/${fichaId}/edit`}
              className="flex items-center gap-2 border border-azure text-azure hover:bg-azure hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
              </svg>
              Editar ficha
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Datos de consulta ─── */}
        <SectionCard title="Datos de Consulta" icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" />
          </svg>
        }>
          <div className="space-y-3">
            <FieldDisplay label="Enfermedad o problema actual" value={ficha.enfermedad_actual} />
            <FieldDisplay label="Antecedentes" value={ficha.antecedentes_visita} />
          </div>
        </SectionCard>

        {/* ── Signos Vitales ─── */}
        {ficha.signos_vitales && (
          <SectionCard title="Signos Vitales" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          }>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-ice/50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Presión arterial</p>
                <p className="font-bold text-deep">{ficha.signos_vitales.presion_arterial || '—'}</p>
              </div>
              <div className="bg-ice/50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Frec. cardíaca</p>
                <p className="font-bold text-deep">{ficha.signos_vitales.frecuencia_cardiaca || '—'} <span className="text-xs font-normal text-gray-400">bpm</span></p>
              </div>
              <div className="bg-ice/50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Temperatura</p>
                <p className="font-bold text-deep">{ficha.signos_vitales.temperatura_axilar || '—'} <span className="text-xs font-normal text-gray-400">°C</span></p>
              </div>
              <div className="bg-ice/50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Peso / Talla</p>
                <p className="font-bold text-deep">{ficha.signos_vitales.peso || '—'} kg</p>
                <p className="text-xs text-gray-400">{ficha.signos_vitales.talla || '—'} cm</p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Examen estomatognático ─── */}
        {ficha.examen_estomatognatico && (
          <SectionCard title="Examen del Sistema Estomatognático" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774z" />
            </svg>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(ficha.examen_estomatognatico).map(([key, val]) => (
                <div key={key} className="p-3 rounded-xl bg-gray-50/50">
                  <p className="text-xs font-medium text-gray-500 mb-1">{AREAS_LABELS[key] ?? key}</p>
                  <p className="text-sm text-gray-700">{val || <span className="text-gray-400 italic">Sin hallazgos</span>}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Odontograma snapshot ─── */}
        <SectionCard title="Odontograma" icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }>
          <p className="text-xs text-gray-500 mb-4">Estado dental registrado en esta visita</p>
          <OdontogramaSVG dientes={dientes} mode="view" />
        </SectionCard>

        {/* ── Indicadores de salud bucal ─── */}
        {ficha.indicadores_salud && (
          <SectionCard title="Indicadores de Salud Bucal" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
            </svg>
          }>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'IHOS', value: ficha.indicadores_salud.ihos },
                { label: 'Placa', value: `${ficha.indicadores_salud.indice_placa}%` },
                { label: 'Cálculo', value: `${ficha.indicadores_salud.indice_calculo}%` },
                { label: 'Sangrado', value: `${ficha.indicadores_salud.indice_sangrado}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-ice/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="font-bold text-deep">{value}</p>
                </div>
              ))}
            </div>
            {/* CPO table */}
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                    <th className="px-4 py-2 text-left">Índice</th>
                    <th className="px-4 py-2 text-center">C</th>
                    <th className="px-4 py-2 text-center">P</th>
                    <th className="px-4 py-2 text-center">O</th>
                    <th className="px-4 py-2 text-center bg-gray-100">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[{ key: 'cpo', label: 'CPO' }, { key: 'ceo', label: 'ceo' }].map(({ key, label }) => {
                    const val = ficha.indicadores_salud![key as 'cpo' | 'ceo']
                    return (
                      <tr key={key} className="bg-white">
                        <td className="px-4 py-2 font-medium">{label}</td>
                        <td className="px-4 py-2 text-center">{val.cariados}</td>
                        <td className="px-4 py-2 text-center">{val.perdidos}</td>
                        <td className="px-4 py-2 text-center">{val.obturados}</td>
                        <td className="px-4 py-2 text-center font-bold text-deep bg-gray-50">
                          {val.cariados + val.perdidos + val.obturados}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* ── Observaciones ─── */}
        {ficha.observaciones && (
          <SectionCard title="Observaciones y Plan de Tratamiento" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          }>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ficha.observaciones}</p>
          </SectionCard>
        )}
      </div>
    </div>
  )
}
