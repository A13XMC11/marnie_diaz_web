import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import OdontogramaSVG from '../../components/odontograma/OdontogramaSVG'
import { getDefaultOdontograma } from '../../components/odontograma/odontogramaUtils'
import type { DienteOdontograma } from '../../types/fichas'

interface Paciente { id: string; nombre: string; apellido: string }

export default function Odontograma() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState('')
  const [dientes, setDientes] = useState<DienteOdontograma[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('pacientes').select('id, nombre, apellido').order('apellido').then(({data}: {data: Paciente[] | null}) => setPacientes(data ?? []))
  }, [])

  const fetchOdontograma = useCallback(async (pid: string) => {
    setLoading(true)
    const { data } = await supabase.from('odontograma').select('*').eq('paciente_id', pid)

    // Build DienteOdontograma[] from old format
    const dientesList: DienteOdontograma[] = getDefaultOdontograma()
    if (data && Array.isArray(data)) {
      for (const record of data) {
        const idx = dientesList.findIndex(d => d.numero === record.diente_numero)
        if (idx >= 0 && record.superficies) {
          // New format with superficies
          dientesList[idx] = {
            numero: record.diente_numero,
            superficies: record.superficies,
            notas: record.notas,
          }
        } else if (idx >= 0) {
          // Legacy: single estado string
          // Don't populate — keep default sano
        }
      }
    }
    setDientes(dientesList)
    setLoading(false)
  }, [])

  const handleSelectPaciente = (id: string) => {
    setSelectedPaciente(id)
    if (id) {
      fetchOdontograma(id)
    } else {
      setDientes(getDefaultOdontograma())
    }
  }

  const handleDientesChange = async (updated: DienteOdontograma[]) => {
    if (!selectedPaciente) return
    setDientes(updated)

    // Find only the changed teeth (compare with current state)
    const changedDientes = updated.filter((d, i) =>
      JSON.stringify(d) !== JSON.stringify(dientes[i])
    )

    if (changedDientes.length === 0) return

    const rows = changedDientes.map(d => ({
      paciente_id: selectedPaciente,
      diente_numero: d.numero,
      superficies: d.superficies,
      notas: d.notas ?? null,
      fecha: new Date().toISOString().split('T')[0],
    }))

    setSaving(true)
    setSaveError(null)
    const { error } = await supabase
      .from('odontograma')
      .upsert(rows, { onConflict: 'paciente_id,diente_numero' })

    if (error) setSaveError(error.message)
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-deep">Odontograma Digital</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registro detallado por superficie dental (FDI notation)</p>
      </div>

      {/* Select paciente */}
      <div className="bg-gradient-to-r from-azure/10 via-deep/5 to-blue-50 rounded-2xl border-2 border-azure/30 p-6 mb-8 shadow-md">
        <label className="block text-sm font-bold text-deep uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="text-xl">👤</span> Seleccionar Paciente
        </label>
        <select
          value={selectedPaciente}
          onChange={e => handleSelectPaciente(e.target.value)}
          className="w-full md:w-96 border-2 border-azure/40 rounded-xl px-4 py-3 text-sm outline-none focus:border-azure focus:ring-3 focus:ring-azure/30 transition-all bg-white hover:border-azure hover:shadow-md"
        >
          <option value="">— Selecciona un paciente —</option>
          {pacientes.map(p => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
        </select>
      </div>

      {!selectedPaciente ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🦷</div>
          <p className="font-medium text-lg">Selecciona un paciente para ver su odontograma</p>
          <p className="text-sm mt-1">Haz clic en cualquier superficie dental para registrar el estado</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-azure border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          {saving && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              ⏳ Guardando cambios...
            </div>
          )}
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              Error al guardar: {saveError}
            </div>
          )}
          <OdontogramaSVG
            dientes={dientes}
            mode="edit"
            onDientesChange={handleDientesChange}
          />
        </div>
      )}
    </div>
  )
}
