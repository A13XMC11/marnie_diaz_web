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

  const handleDientesChange = async (newDientes: DienteOdontograma[]) => {
    if (!selectedPaciente) return
    setDientes(newDientes)

    // Save to database
    setSaving(true)
    try {
      for (const diente of newDientes) {
        // Check if exists
        const { data: existing } = await supabase.from('odontograma')
          .select('id')
          .eq('paciente_id', selectedPaciente)
          .eq('diente_numero', diente.numero)
          .single()

        if (existing) {
          await supabase.from('odontograma')
            .update({
              superficies: diente.superficies,
              notas: diente.notas,
              fecha: new Date().toISOString().split('T')[0],
            })
            .eq('id', existing.id)
        } else {
          await supabase.from('odontograma')
            .insert({
              paciente_id: selectedPaciente,
              diente_numero: diente.numero,
              superficies: diente.superficies,
              notas: diente.notas,
              fecha: new Date().toISOString().split('T')[0],
            })
        }
      }
    } catch (e) {
      console.error('Error saving odontogram:', e)
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-deep">Odontograma Digital</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registro detallado por superficie dental (FDI notation)</p>
      </div>

      {/* Select paciente */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Seleccionar paciente</label>
        <select
          value={selectedPaciente}
          onChange={e => handleSelectPaciente(e.target.value)}
          className="w-full md:w-96 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure transition-colors"
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
