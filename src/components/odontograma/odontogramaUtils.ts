import type { DienteOdontograma, SuperficieClave, SimboloOdonto } from '../../types/fichas'

// ── FDI Notation Constants ─────────────────────────────────────────────
export const UPPER_PERMANENT = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28] as const
export const LOWER_PERMANENT = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38] as const
export const UPPER_BABY = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65] as const
export const LOWER_BABY = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75] as const

export const POSTERIOR = [14, 15, 16, 17, 18, 24, 25, 26, 27, 28, 34, 35, 36, 37, 38, 44, 45, 46, 47, 48] as const
export const ANTERIOR = [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43] as const

export const ALL_TEETH = [...UPPER_PERMANENT, ...LOWER_PERMANENT, ...UPPER_BABY, ...LOWER_BABY] as const

// ── Color mapping for symbols ──────────────────────────────────────────
export const SIMBOLO_COLORS: Record<SimboloOdonto, { fill: string; stroke: string; textColor: string }> = {
  sano: { fill: 'none', stroke: '#d1d5db', textColor: '#6b7280' },
  caries: { fill: '#fee2e2', stroke: '#ef4444', textColor: '#dc2626' },
  restauracion: { fill: '#dbeafe', stroke: '#3b82f6', textColor: '#1d4ed8' },
  resto_radicular: { fill: '#fee2e2', stroke: '#ef4444', textColor: '#dc2626' },
  corona: { fill: '#dbeafe', stroke: '#3b82f6', textColor: '#1d4ed8' },
  extraccion: { fill: '#fee2e2', stroke: '#ef4444', textColor: '#dc2626' },
  ausente: { fill: '#fee2e2', stroke: '#ef4444', textColor: '#dc2626' },
  sellante: { fill: '#dbeafe', stroke: '#3b82f6', textColor: '#1d4ed8' },
  endodoncia: { fill: '#dbeafe', stroke: '#3b82f6', textColor: '#1d4ed8' },
  protesis_removible: { fill: '#dbeafe', stroke: '#3b82f6', textColor: '#1d4ed8' },
  protesis_total: { fill: '#dbeafe', stroke: '#3b82f6', textColor: '#1d4ed8' },
  puente: { fill: '#dbeafe', stroke: '#3b82f6', textColor: '#1d4ed8' },
}

// ── Symbol labels for display ──────────────────────────────────────────
export const SIMBOLO_LABELS: Record<SimboloOdonto, string> = {
  sano: 'Sano',
  caries: 'Caries',
  restauracion: 'Restauración',
  resto_radicular: 'Resto Radicular',
  corona: 'Corona',
  extraccion: 'Extracción',
  ausente: 'Ausente',
  sellante: 'Sellante',
  endodoncia: 'Endodoncia',
  protesis_removible: 'Prótesis Removible',
  protesis_total: 'Prótesis Total',
  puente: 'Puente',
}

// ── Surface labels ────────────────────────────────────────────────────
export const SUPERFICIE_LABELS: Record<SuperficieClave, string> = {
  mesial: 'Mesial',
  distal: 'Distal',
  oclusal: 'Oclusal/Incisal',
  vestibular: 'Vestibular',
  palatino: 'Palatino/Lingual',
}

// ── Helper: is tooth posterior or anterior ─────────────────────────────
export function isPosterior(numero: number): boolean {
  return POSTERIOR.includes(numero as any)
}

export function isAnterior(numero: number): boolean {
  return ANTERIOR.includes(numero as any)
}

export function isBaby(numero: number): boolean {
  return UPPER_BABY.includes(numero as any) || LOWER_BABY.includes(numero as any)
}

// ── Initialize default tooth with all 5 surfaces as healthy ────────────
export function getDefaultDiente(numero: number): DienteOdontograma {
  return {
    numero,
    superficies: {
      mesial: { simbolo: 'sano', color: null },
      distal: { simbolo: 'sano', color: null },
      oclusal: { simbolo: 'sano', color: null },
      vestibular: { simbolo: 'sano', color: null },
      palatino: { simbolo: 'sano', color: null },
    },
  }
}

// ── Initialize all 52 teeth with default state ─────────────────────────
export function getDefaultOdontograma(): DienteOdontograma[] {
  return ALL_TEETH.map(numero => getDefaultDiente(numero))
}

// ── Normalize odontogram: ensure all teeth have all 5 surfaces ───────────
export function normalizeDientes(dientes: DienteOdontograma[]): DienteOdontograma[] {
  return ALL_TEETH.map(numero => {
    const existing = dientes.find(d => d.numero === numero)
    if (!existing) return getDefaultDiente(numero)

    // Ensure all 5 surfaces exist
    const superficiesCompletas = {
      mesial: existing.superficies?.mesial ?? { simbolo: 'sano', color: null },
      distal: existing.superficies?.distal ?? { simbolo: 'sano', color: null },
      oclusal: existing.superficies?.oclusal ?? { simbolo: 'sano', color: null },
      vestibular: existing.superficies?.vestibular ?? { simbolo: 'sano', color: null },
      palatino: existing.superficies?.palatino ?? { simbolo: 'sano', color: null },
    }

    return {
      numero,
      superficies: superficiesCompletas,
      notas: existing.notas,
    }
  })
}

// ── Get tooth position in grid for layout ──────────────────────────────
export function getToothPosition(numero: number): { row: 'upper' | 'lower'; arch: 'left' | 'right'; isBaby: boolean } {
  const upper = numero >= 10 && numero < 50
  const isRight = numero % 10 >= 1 && numero % 10 <= 4

  return {
    row: upper ? 'upper' : 'lower',
    arch: isRight ? 'right' : 'left',
    isBaby: isBaby(numero),
  }
}
