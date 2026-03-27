import { useState } from 'react'
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
  x: number
  y: number
}

// Símbolos agrupados por categoría
const SIMBOLOS_ROJO: SimboloOdonto[] = ['caries', 'ausente', 'extraccion', 'resto_radicular']
const SIMBOLOS_AZUL: SimboloOdonto[] = ['restauracion', 'corona', 'sellante', 'endodoncia']

export default function OdontogramaSVG({ dientes, mode, onDientesChange }: OdontogramaSVGProps) {
  const [popover, setPopover] = useState<PopoverState>({ visible: false, diente: null, superficie: null, x: 0, y: 0 })
  const [selectedDiente, setSelectedDiente] = useState<number | null>(null)

  // Build a map of diente by numero for O(1) lookup
  const dienteMap = new Map(dientes.map(d => [d.numero, d]))

  const handleSurfaceClick = (diente: number, superficie: SuperficieClave, event: React.MouseEvent) => {
    if (mode === 'view') return

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    setPopover({
      visible: true,
      diente,
      superficie,
      x: rect.left,
      y: rect.top,
    })
    setSelectedDiente(diente)
  }

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
    const scale = isBaby ? 0.9 : 1

    return (
      <div key={label} className="flex flex-col items-center mb-4">
        {/* Arch label */}
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: isBaby ? '#9ca3af' : '#6b7280',
          marginBottom: '4px',
        }}>{label}</div>

        {/* Teeth row */}
        <div className="flex justify-center" style={{ gap: '3px', transform: `scale(${scale})`, transformOrigin: 'top center' }}>
          {toothNumbers.map(numero => {
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
                        x: window.innerWidth / 2 - 144,
                        y: 100,
                      })
                    }
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Odontogram grid */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px 16px',
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
          className="fixed bg-white rounded-2xl border border-gray-200 p-5 w-80"
          style={{
            top: `${popover.y + 10}px`,
            left: `${Math.min(popover.x + 10, window.innerWidth - 330)}px`,
            zIndex: 9999,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}
        >
          {/* Header */}
          <div className="mb-5 pb-4 border-b border-gray-100">
            <h3 className="font-serif font-bold text-lg text-deep mb-1">
              Pieza {popover.diente}
            </h3>
            <p className="text-sm text-gray-600">
              {SUPERFICIE_LABELS[popover.superficie as SuperficieClave]}
            </p>
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
