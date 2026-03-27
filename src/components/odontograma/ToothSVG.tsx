import { useState } from 'react'
import type { DienteOdontograma, SuperficieClave } from '../../types/fichas'
import { isPosterior, SIMBOLO_COLORS, SUPERFICIE_LABELS } from './odontogramaUtils'

interface ToothSVGProps {
  numero: number
  diente: DienteOdontograma
  mode: 'view' | 'edit'
  isSelected: boolean
  selectedSurface?: SuperficieClave | null
  onSurfaceClick?: (superficie: SuperficieClave) => void
  toothSize?: number
}

// Polygon coordinates for tooth surfaces (viewBox: 0 0 44 54)
const SURFACE_COORDS = {
  posterior: {
    vestibular: { points: '2,2 42,2 36,8 8,8', center: [22, 5] },
    palatino: { points: '2,36 8,28 36,28 42,36', center: [22, 32] },
    mesial: { points: '2,2 8,8 8,28 2,36', center: [5, 19] },
    distal: { points: '42,2 42,36 36,28 36,8', center: [39, 19] },
    oclusal: { points: '8,8 36,8 36,28 8,28', center: [22, 18] },
  },
  anterior: {
    vestibular: { points: '4,2 40,2 34,10 10,10', center: [22, 6] },
    palatino: { points: '4,42 10,34 34,34 40,42', center: [22, 38] },
    mesial: { points: '4,2 10,10 10,34 4,42', center: [7, 22] },
    distal: { points: '40,2 40,42 34,34 34,10', center: [37, 22] },
    oclusal: { points: '10,10 34,10 34,34 10,34', center: [22, 22] },
  },
}

function renderSymbol(
  simbolo: string,
  color: string | null,
  cx: number,
  cy: number,
  isSelected: boolean,
  mode: 'view' | 'edit'
) {
  const colors = SIMBOLO_COLORS[simbolo as keyof typeof SIMBOLO_COLORS]

  switch (simbolo) {
    case 'caries':
      return (
        <>
          <ellipse cx={cx} cy={cy} rx="6" ry="6" fill="none" stroke={colors.stroke} strokeWidth="2" />
          <circle cx={cx} cy={cy} r="2" fill={colors.stroke} />
        </>
      )
    case 'restauracion':
      return <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} stroke={colors.stroke} strokeWidth="2" />
    case 'resto_radicular':
    case 'corona':
    case 'sellante':
      return <text x={cx} y={cy} textAnchor="middle" dy="0.3em" fill={colors.textColor} fontSize="14" fontWeight="bold">{simbolo[0].toUpperCase()}</text>
    case 'extraccion':
      return (
        <>
          <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke={colors.stroke} strokeWidth="2" />
          <line x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4} stroke={colors.stroke} strokeWidth="2" />
        </>
      )
    case 'ausente':
      return (
        <>
          <line x1={cx - 6} y1={cy - 3} x2={cx + 6} y2={cy - 3} stroke={colors.stroke} strokeWidth="1" />
          <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke={colors.stroke} strokeWidth="1" />
          <line x1={cx - 6} y1={cy + 3} x2={cx + 6} y2={cy + 3} stroke={colors.stroke} strokeWidth="1" />
        </>
      )
    case 'endodoncia':
      return <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke={colors.stroke} strokeWidth="2" />
    default:
      return null
  }
}

export default function ToothSVG({
  numero,
  diente,
  mode,
  isSelected,
  selectedSurface,
  onSurfaceClick,
  toothSize = 40,
}: ToothSVGProps) {
  const posterior = isPosterior(numero)
  const coords = posterior ? SURFACE_COORDS.posterior : SURFACE_COORDS.anterior
  const rootTop = posterior ? 36 : 42

  const [tooltip, setTooltip] = useState<{ visible: boolean; superficie: SuperficieClave | null }>({ visible: false, superficie: null })

  // Calculate height based on aspect ratio of viewBox (44:62)
  const svgWidth = toothSize
  const svgHeight = Math.round(toothSize * (62 / 44))

  return (
    <div
      className={`flex flex-col items-center ${mode === 'edit' ? 'cursor-pointer' : ''}`}
      style={{ position: 'relative' }}
    >
      {/* Tooltip */}
      {tooltip.visible && tooltip.superficie && (
        <div style={{
          position: 'absolute',
          top: '-32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(13,61,92,0.9)',
          color: 'white',
          fontSize: '10px',
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          zIndex: 200,
          pointerEvents: 'none',
        }}>
          Diente {numero} — {SUPERFICIE_LABELS[tooltip.superficie]}
        </div>
      )}

      <svg
        viewBox="0 0 44 62"
        width={svgWidth}
        height={svgHeight}
        className={`transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-azure drop-shadow-lg scale-105' : 'hover:drop-shadow-md hover:scale-105'} ${
          mode === 'edit' ? 'hover:opacity-90' : ''
        }`}
        style={{ borderRadius: '8px' }}
      >
        {/* Tooth surfaces — all 5 */}
        {(Object.keys(coords) as SuperficieClave[]).map(superficie => {
          const coord = coords[superficie]
          const surface = diente.superficies[superficie]
          const colors = SIMBOLO_COLORS[surface.simbolo as keyof typeof SIMBOLO_COLORS]
          const isThisSurfaceSelected = selectedSurface === superficie
          const hasPathology = surface.color === 'rojo'
          const hasTreatment = surface.color === 'azul'

          return (
            <g key={superficie}>
              {/* Surface polygon — each surface is independently clickable */}
              <polygon
                points={coord.points}
                fill={hasPathology ? '#fee2e2' : hasTreatment ? '#dbeafe' : '#f8fafc'}
                stroke={hasPathology ? '#f87171' : hasTreatment ? '#60a5fa' : '#d1d5db'}
                strokeWidth={hasPathology || hasTreatment ? '2' : '1'}
                opacity={isThisSurfaceSelected ? 0.85 : (hasPathology || hasTreatment ? 0.9 : 0.8)}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  if (mode === 'edit' && onSurfaceClick) {
                    onSurfaceClick(superficie)
                  }
                }}
                onMouseEnter={() => setTooltip({ visible: true, superficie })}
                onMouseLeave={() => setTooltip({ visible: false, superficie: null })}
                style={{
                  cursor: mode === 'edit' ? 'pointer' : 'default',
                  pointerEvents: 'all',
                  filter: hasPathology
                    ? 'drop-shadow(0 0 2px rgba(248,113,113,0.5))'
                    : hasTreatment
                    ? 'drop-shadow(0 0 2px rgba(96,165,250,0.5))'
                    : 'none',
                }}
              />
              {/* Symbol rendering */}
              {surface.simbolo !== 'sano' && renderSymbol(surface.simbolo, surface.color, coord.center[0], coord.center[1], isThisSurfaceSelected, mode)}
            </g>
          )
        })}

        {/* Root (visual only) */}
        <rect x="10" y={rootTop} width="24" height="14" fill="none" stroke="#d1d5db" strokeWidth="1" rx="2" />
        <line x1="22" y1={rootTop} x2="22" y2={rootTop + 14} stroke="#d1d5db" strokeWidth="1" />
      </svg>

      {/* Tooth number label (outside SVG) */}
      <div style={{
        fontSize: '9px',
        fontWeight: 600,
        color: '#4b5563',
        textAlign: 'center',
        marginTop: '2px',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {numero}
      </div>

      {/* Notes if present */}
      {diente.notas && (
        <div className="mt-1 text-xs text-gray-500 text-center max-w-[44px] truncate" title={diente.notas}>
          {diente.notas.substring(0, 10)}...
        </div>
      )}
    </div>
  )
}
