import type { DienteOdontograma, SuperficieClave } from '../../types/fichas'
import { isPosterior, SIMBOLO_COLORS } from './odontogramaUtils'

interface ToothSVGProps {
  numero: number
  diente: DienteOdontograma
  mode: 'view' | 'edit'
  isSelected: boolean
  selectedSurface?: SuperficieClave | null
  onSurfaceClick?: (superficie: SuperficieClave) => void
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
}: ToothSVGProps) {
  const posterior = isPosterior(numero)
  const coords = posterior ? SURFACE_COORDS.posterior : SURFACE_COORDS.anterior

  const rootTop = posterior ? 34 : 42

  return (
    <div className={`flex flex-col items-center ${mode === 'edit' ? 'cursor-pointer' : ''}`}>
      <svg
        viewBox="0 0 44 54"
        width={44}
        height={54}
        className={`${isSelected ? 'ring-2 ring-azure ring-offset-1' : ''} ${
          mode === 'edit' ? 'hover:opacity-80 transition-opacity' : ''
        }`}
      >
        {/* Tooth surfaces — all 5 */}
        {(Object.keys(coords) as SuperficieClave[]).map(superficie => {
          const coord = coords[superficie]
          const surface = diente.superficies[superficie]
          const colors = SIMBOLO_COLORS[surface.simbolo as keyof typeof SIMBOLO_COLORS]
          const isThisSurfaceSelected = selectedSurface === superficie

          return (
            <g key={superficie}>
              {/* Surface polygon */}
              <polygon
                points={coord.points}
                fill={surface.color === 'rojo' ? '#fee2e2' : surface.color === 'azul' ? '#dbeafe' : 'white'}
                stroke={colors.stroke}
                strokeWidth="1"
                opacity={isThisSurfaceSelected ? 0.6 : 0.4}
                onClick={() => {
                  if (mode === 'edit' && onSurfaceClick) {
                    onSurfaceClick(superficie)
                  }
                }}
                className={mode === 'edit' ? 'hover:opacity-75 transition-opacity cursor-pointer' : ''}
              />

              {/* Symbol rendering */}
              {surface.simbolo !== 'sano' && renderSymbol(surface.simbolo, surface.color, coord.center[0], coord.center[1], isThisSurfaceSelected, mode)}
            </g>
          )
        })}

        {/* Root (visual only) */}
        <rect x="10" y={rootTop} width="24" height="16" fill="none" stroke="#d1d5db" strokeWidth="1" rx="2" />
        <line x1="22" y1={rootTop} x2="22" y2={rootTop + 16} stroke="#d1d5db" strokeWidth="1" />

        {/* Tooth number label */}
        <text x="22" y={posterior ? 48 : 52} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1f2937">
          {numero}
        </text>
      </svg>

      {/* Notes if present */}
      {diente.notas && (
        <div className="mt-1 text-xs text-gray-500 text-center max-w-[44px] truncate" title={diente.notas}>
          {diente.notas.substring(0, 10)}...
        </div>
      )}
    </div>
  )
}
