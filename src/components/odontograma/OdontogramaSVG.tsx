import { useState } from 'react'
import type { DienteOdontograma, SuperficieClave, SimboloOdonto } from '../../types/fichas'
import ToothSVG from './ToothSVG'
import { UPPER_PERMANENT, LOWER_PERMANENT, UPPER_BABY, LOWER_BABY, SIMBOLO_LABELS, getDefaultDiente } from './odontogramaUtils'

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

const SIMBOLOS: SimboloOdonto[] = [
  'caries',
  'restauracion',
  'corona',
  'extraccion',
  'ausente',
  'resto_radicular',
  'sellante',
  'endodoncia',
]

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
    const scale = isBaby ? 0.8 : 1
    const rowHeight = isBaby ? 60 : 70

    return (
      <div key={label} className="flex flex-col items-center mb-4">
        {/* Arch label */}
        <div className="text-xs font-bold text-gray-600 mb-1">{label}</div>

        {/* Teeth row */}
        <div className="flex gap-1 justify-center" style={{ transform: `scale(${scale})` }}>
          {toothNumbers.map(numero => {
            const diente = dienteMap.get(numero) || getDefaultDiente(numero)
            return (
              <div
                key={numero}
                onClick={e => {
                  const firstSurface = 'oclusal' as SuperficieClave
                  if (mode === 'edit') {
                    handleSurfaceClick(numero, firstSurface, e as any)
                  }
                }}
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
                    const event = new MouseEvent('click')
                    const div = event.target as HTMLElement
                    const rect = { top: 0, left: 0, getBoundingClientRect: () => ({ top: 0, left: 0 }) }
                    handleSurfaceClick(numero, superficie, { currentTarget: div } as any)
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
      <div className="bg-white rounded-2xl border border-gray-100 p-6 overflow-x-auto">
        {/* Upper arch */}
        <div className="mb-8">
          <div className="text-sm font-bold text-gray-600 mb-2 text-center">MAXILAR (SUPERIOR)</div>
          {renderArchRow(UPPER_PERMANENT, 'ADULTOS', false)}
          {renderArchRow(UPPER_BABY, 'TEMPORALES', true)}
        </div>

        {/* Divider */}
        <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8" />

        {/* Lower arch */}
        <div>
          <div className="text-sm font-bold text-gray-600 mb-2 text-center">MANDÍBULA (INFERIOR)</div>
          {renderArchRow(LOWER_BABY, 'TEMPORALES', true)}
          {renderArchRow(LOWER_PERMANENT, 'ADULTOS', false)}
        </div>

        {/* Legend */}
        {mode === 'view' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-600 mb-3">LEYENDA DE SÍMBOLOS:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SIMBOLOS.map(simbolo => (
                <div key={simbolo} className="text-xs text-gray-600">
                  {SIMBOLO_LABELS[simbolo]}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit popover */}
      {popover.visible && mode === 'edit' && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setPopover({ ...popover, visible: false })} />
      )}

      {popover.visible && mode === 'edit' && (
        <div className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72">
          <h3 className="font-bold text-deep mb-3">
            Pieza {popover.diente} — Superficie {popover.superficie}
          </h3>

          {/* Symbol grid */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Símbolo:</p>
            <div className="grid grid-cols-3 gap-2">
              {SIMBOLOS.map(simbolo => (
                <button
                  key={simbolo}
                  onClick={() => handleSymbolSelect(simbolo, null)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={SIMBOLO_LABELS[simbolo]}
                >
                  {simbolo[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Color selection */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Color:</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleSymbolSelect('caries', 'rojo')}
                className="flex-1 px-3 py-2 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                Rojo (Patología)
              </button>
              <button
                onClick={() => handleSymbolSelect('restauracion', 'azul')}
                className="flex-1 px-3 py-2 text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                Azul (Trat.)
              </button>
            </div>
          </div>

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="w-full px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Limpiar
          </button>

          <button
            onClick={() => setPopover({ ...popover, visible: false })}
            className="w-full mt-2 px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  )
}
