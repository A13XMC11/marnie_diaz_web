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
    const scale = isBaby ? 0.88 : 1
    const rowHeight = isBaby ? 60 : 70

    return (
      <div key={label} className="flex flex-col items-center mb-10">
        {/* Arch label */}
        <div className={`text-sm font-bold uppercase tracking-widest ${isBaby ? 'text-gray-400 mb-2' : 'text-gray-600 mb-3'}`}>{label}</div>

        {/* Teeth row */}
        <div className="flex gap-5 justify-center" style={{ transform: `scale(${scale})` }}>
          {toothNumbers.map(numero => {
            const diente = dienteMap.get(numero) || getDefaultDiente(numero)
            return (
              <div
                key={numero}
                className="transition-transform hover:scale-105"
              >
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
    <div className="relative w-full">
      {/* Odontogram grid */}
      <div className="bg-gradient-to-b from-white via-white to-gray-50 rounded-3xl border-2 border-gray-200 p-12 overflow-x-auto shadow-md">
        {/* Upper arch */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-azure/15 via-azure/10 to-deep/10 rounded-2xl border border-azure/20 shadow-sm">
              <span className="text-2xl">🦷</span>
              <span className="text-base font-bold text-deep uppercase tracking-widest">Maxilar Superior</span>
            </div>
          </div>
          {renderArchRow(UPPER_PERMANENT, 'ADULTOS', false)}
          {renderArchRow(UPPER_BABY, 'TEMPORALES', true)}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-6 my-12 px-4">
          <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-azure/30 to-transparent rounded-full" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-azure/60 px-4 uppercase tracking-wider">Línea</span>
            <span className="text-xs font-bold text-azure/60 px-4 uppercase tracking-wider">Media</span>
          </div>
          <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-azure/30 to-transparent rounded-full" />
        </div>

        {/* Lower arch */}
        <div>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-deep/10 via-azure/10 to-azure/15 rounded-2xl border border-azure/20 shadow-sm">
              <span className="text-2xl">🦷</span>
              <span className="text-base font-bold text-deep uppercase tracking-widest">Mandíbula Inferior</span>
            </div>
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
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setPopover({ ...popover, visible: false })} />
      )}

      {popover.visible && mode === 'edit' && (
        <div className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-80" style={{ top: `${popover.y + 10}px`, left: `${popover.x + 10}px` }}>
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
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Patología</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SIMBOLOS_ROJO.map(simbolo => (
                <button
                  key={simbolo}
                  onClick={() => handleSymbolSelect(simbolo, 'rojo')}
                  className="px-3 py-2.5 text-xs font-medium border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all hover:border-red-400 hover:shadow-sm"
                  title={SIMBOLO_LABELS[simbolo]}
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
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tratamiento</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SIMBOLOS_AZUL.map(simbolo => (
                <button
                  key={simbolo}
                  onClick={() => handleSymbolSelect(simbolo, 'azul')}
                  className="px-3 py-2.5 text-xs font-medium border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all hover:border-blue-400 hover:shadow-sm"
                  title={SIMBOLO_LABELS[simbolo]}
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
              className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
            >
              🔄 Limpiar
            </button>
            <button
              onClick={() => setPopover({ ...popover, visible: false })}
              className="flex-1 px-3 py-2 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
