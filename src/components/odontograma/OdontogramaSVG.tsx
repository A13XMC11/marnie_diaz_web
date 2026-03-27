import { useState, useEffect } from 'react'
import type { DienteOdontograma, SuperficieClave, SimboloOdonto } from '../../types/fichas'
import ToothSVG from './ToothSVG'
import { UPPER_PERMANENT, LOWER_PERMANENT, UPPER_BABY, LOWER_BABY, SIMBOLO_LABELS, SUPERFICIE_LABELS, getDefaultDiente } from './odontogramaUtils'

interface OdontogramaSVGProps {
  dientes: DienteOdontograma[]
  mode: 'view' | 'edit'
  onDientesChange?: (dientes: DienteOdontograma[]) => void
}

interface PopoverState {
  visible: boolean
  diente: number | null
  superficie: SuperficieClave | null
}

// Símbolos agrupados por categoría
const SIMBOLOS_ROJO: SimboloOdonto[] = ['caries', 'ausente', 'extraccion', 'resto_radicular']
const SIMBOLOS_AZUL: SimboloOdonto[] = ['restauracion', 'corona', 'sellante', 'endodoncia']

export default function OdontogramaSVG({ dientes, mode, onDientesChange }: OdontogramaSVGProps) {
  const [popover, setPopover] = useState<PopoverState>({ visible: false, diente: null, superficie: null })
  const [selectedDiente, setSelectedDiente] = useState<number | null>(null)

  // Build a map of diente by numero for O(1) lookup
  const dienteMap = new Map(dientes.map(d => [d.numero, d]))

  // Handle keyboard escape to close popover
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && popover.visible) {
        setPopover({ ...popover, visible: false })
      }
    }

    if (popover.visible) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [popover])

  const handleSymbolSelect = (simbolo: SimboloOdonto, color: 'rojo' | 'azul' | null) => {
    if (!popover.diente || !popover.superficie) return

    const updated = dientes.map(d => {
      if (d.numero === popover.diente) {
        return {
          ...d,
          superficies: {
            ...d.superficies,
            [popover.superficie!]: { simbolo, color },
          },
        }
      }
      return d
    })

    if (onDientesChange) {
      onDientesChange(updated)
    }
    setPopover({ ...popover, visible: false })
  }

  const handleClear = () => {
    if (!popover.diente || !popover.superficie) return

    const updated = dientes.map(d => {
      if (d.numero === popover.diente) {
        return {
          ...d,
          superficies: {
            ...d.superficies,
            [popover.superficie!]: { simbolo: 'sano', color: null },
          },
        }
      }
      return d
    })

    if (onDientesChange) {
      onDientesChange(updated)
    }
    setPopover({ ...popover, visible: false })
  }

  const renderArchRow = (toothNumbers: readonly number[], label: string, isBaby: boolean = false) => {
    const toothSize = isBaby ? 36 : 40
    const midpoint = Math.floor(toothNumbers.length / 2)

    return (
      <div key={label} className="flex flex-col items-center mb-6">
        {/* Arch label */}
        <div style={{
          fontSize: '9px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: isBaby ? '#9ca3af' : '#6b7280',
          marginBottom: '4px',
        }}>{label}</div>

        {/* Teeth row with quadrant separator */}
        <div className="flex justify-center items-center" style={{ gap: '2px' }}>
          {/* Left quadrant */}
          <div className="flex" style={{ gap: '2px' }}>
            {toothNumbers.slice(0, midpoint).map(numero => {
              const diente = dienteMap.get(numero) || getDefaultDiente(numero)
              return (
                <div key={numero}>
                  <ToothSVG
                    numero={numero}
                    diente={diente}
                    mode={mode}
                    isSelected={selectedDiente === numero}
                    selectedSurface={
                      popover.visible && popover.diente === numero ? popover.superficie : undefined
                    }
                    onSurfaceClick={superficie => {
                      if (mode === 'edit') {
                        setSelectedDiente(numero)
                        setPopover({
                          visible: true,
                          diente: numero,
                          superficie,
                        })
                      }
                    }}
                    toothSize={toothSize}
                  />
                </div>
              )
            })}
          </div>

          {/* Quadrant separator */}
          <div style={{
            width: '2px',
            height: `${toothSize * 1.6}px`,
            background: '#cbd5e1',
            margin: '0 4px',
          }} />

          {/* Right quadrant */}
          <div className="flex" style={{ gap: '2px' }}>
            {toothNumbers.slice(midpoint).map(numero => {
              const diente = dienteMap.get(numero) || getDefaultDiente(numero)
              return (
                <div key={numero}>
                  <ToothSVG
                    numero={numero}
                    diente={diente}
                    mode={mode}
                    isSelected={selectedDiente === numero}
                    selectedSurface={
                      popover.visible && popover.diente === numero ? popover.superficie : undefined
                    }
                    onSurfaceClick={superficie => {
                      if (mode === 'edit') {
                        setSelectedDiente(numero)
                        setPopover({
                          visible: true,
                          diente: numero,
                          superficie,
                        })
                      }
                    }}
                    toothSize={toothSize}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ maxWidth: '100%' }}>
      {/* Odontogram grid */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px 20px',
        overflowX: 'auto',
      }}>
        {/* Upper arch */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 700, color: '#0d3d5c',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              background: '#f0f9ff', border: '1px solid #bae6fd',
              borderRadius: '8px', padding: '4px 14px',
            }}>🦷 Maxilar Superior</span>
          </div>
          {renderArchRow(UPPER_PERMANENT, 'ADULTOS', false)}
          {renderArchRow(UPPER_BABY, 'TEMPORALES', true)}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '10px 8px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', fontWeight: 500 }}>LÍNEA MEDIA</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* Lower arch */}
        <div style={{ marginTop: '8px' }}>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 700, color: '#0d3d5c',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              background: '#f0f9ff', border: '1px solid #bae6fd',
              borderRadius: '8px', padding: '4px 14px',
            }}>🦷 Mandíbula Inferior</span>
          </div>
          {renderArchRow(LOWER_BABY, 'TEMPORALES', true)}
          {renderArchRow(LOWER_PERMANENT, 'ADULTOS', false)}
        </div>

        {/* Legend */}
        {mode === 'view' && (
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <p className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider flex items-center gap-2">
              <span>📋</span> Leyenda de símbolos
            </p>
            <div className="space-y-4">
              {/* Patología */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Patología</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SIMBOLOS_ROJO.map(simbolo => (
                    <div key={simbolo} className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      {SIMBOLO_LABELS[simbolo]}
                    </div>
                  ))}
                </div>
              </div>
              {/* Tratamiento */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Tratamiento</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SIMBOLOS_AZUL.map(simbolo => (
                    <div key={simbolo} className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {SIMBOLO_LABELS[simbolo]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit popover overlay */}
      {popover.visible && mode === 'edit' && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 9998 }} onClick={() => setPopover({ ...popover, visible: false })} />
      )}

      {popover.visible && mode === 'edit' && (
        <div
          className="fixed bg-white rounded-2xl border border-gray-200 p-6 w-80 max-w-[90vw]"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div className="mb-5 pb-4 border-b border-gray-100">
            <h3 className="font-serif font-bold text-lg text-deep mb-1">
              Pieza {popover.diente} — {SUPERFICIE_LABELS[popover.superficie as SuperficieClave]}
            </h3>
          </div>

          {/* Patología (Rojo) */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-red-500 rounded-full"></div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">🦷 Patología</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SIMBOLOS_ROJO.map(simbolo => (
                <button
                  key={simbolo}
                  onClick={() => handleSymbolSelect(simbolo, 'rojo')}
                  title={SIMBOLO_LABELS[simbolo]}
                  style={{ padding: '10px 18px', borderRadius: '10px', cursor: 'pointer' }}
                  className="text-xs font-medium border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-all hover:border-red-400 hover:shadow-sm"
                >
                  {SIMBOLO_LABELS[simbolo]}
                </button>
              ))}
            </div>
          </div>

          {/* Tratamiento (Azul) */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">✨ Tratamiento</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SIMBOLOS_AZUL.map(simbolo => (
                <button
                  key={simbolo}
                  onClick={() => handleSymbolSelect(simbolo, 'azul')}
                  title={SIMBOLO_LABELS[simbolo]}
                  style={{ padding: '10px 18px', borderRadius: '10px', cursor: 'pointer' }}
                  className="text-xs font-medium border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all hover:border-blue-400 hover:shadow-sm"
                >
                  {SIMBOLO_LABELS[simbolo]}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={handleClear}
              style={{ padding: '10px 18px', borderRadius: '10px', background: '#f3f4f6', color: '#6b7280', cursor: 'pointer', flex: 1 }}
              className="text-xs font-medium hover:bg-gray-200 transition-all border-0"
            >
              🔄 Limpiar
            </button>
            <button
              onClick={() => setPopover({ ...popover, visible: false })}
              style={{ padding: '10px 18px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', flex: 1 }}
              className="text-xs font-medium hover:bg-red-200 transition-all border-0"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
