// Tipos para el sistema de fichas clínicas dentales

// ── Superficies y símbolos del odontograma ────────────────────────────
export type SuperficieClave = 'mesial' | 'distal' | 'oclusal' | 'vestibular' | 'palatino'

export type SimboloOdonto =
  | 'sano'
  | 'caries'
  | 'restauracion'
  | 'resto_radicular'
  | 'corona'
  | 'extraccion'
  | 'ausente'
  | 'sellante'
  | 'endodoncia'
  | 'protesis_removible'
  | 'protesis_total'
  | 'puente'

export interface SuperficieDiente {
  simbolo: SimboloOdonto
  color: 'rojo' | 'azul' | null // rojo=patología actual, azul=tratamientos realizados, null=sano
}

export interface DienteOdontograma {
  numero: number // FDI notation: 11–88
  superficies: Record<SuperficieClave, SuperficieDiente>
  notas?: string
}

// ── Signos vitales ─────────────────────────────────────────────────────
export interface SignosVitales {
  presion_arterial: string // "120/80"
  frecuencia_cardiaca: number // bpm
  frecuencia_respiratoria: number // respiraciones por minuto
  temperatura_bucal: number // °C
  temperatura_axilar: number // °C
  peso: number // kg
  talla: number // cm
}

// ── Examen estomatognático (12 áreas anatómicas) ────────────────────────
export type AreaEstomatognatica =
  | 'labios'
  | 'mejillas'
  | 'maxilar_superior'
  | 'maxilar_inferior'
  | 'lengua'
  | 'paladar'
  | 'piso'
  | 'carrillos'
  | 'glandulas_salivales'
  | 'orofaringe'
  | 'atm'
  | 'ganglios'

export type ExamenEstomatognatico = Record<AreaEstomatognatica, string>

// ── Índices CPO y ceo (caries, pérdidas, obturaciones) ──────────────────
export interface IndicesCPO {
  cariados: number
  perdidos: number
  obturados: number
}

// ── Indicadores de salud bucal ─────────────────────────────────────────
export interface IndicadoresSaludBucal {
  ihos: number // Índice de Higiene Oral Simplificada (0–3)
  indice_placa: number // porcentaje 0–100
  indice_calculo: number // porcentaje 0–100
  indice_sangrado: number // porcentaje 0–100
  enfermedad_periodontal: string // descripción libre
  maloclusion: string // descripción
  fluorosis: string // descripción
  cpo: IndicesCPO // permanentes: cariados, perdidos, obturados
  ceo: IndicesCPO // temporales: cariados, extracción indicada, obturados
}

// ── Ficha clínica completa ─────────────────────────────────────────────
export interface FichaClinica {
  id: string
  paciente_id: string
  cita_id?: string // opcional: link a la cita de esta visita
  fecha: string // ISO date YYYY-MM-DD
  motivo_consulta: string
  enfermedad_actual: string // síntomas, cronología, localización, etc.
  antecedentes_visita: string // contexto de antecedentes en momento de visita
  signos_vitales: SignosVitales
  examen_estomatognatico: ExamenEstomatognatico
  odontograma_snapshot: DienteOdontograma[] // snapshot del estado en esa fecha
  indicadores_salud: IndicadoresSaludBucal
  observaciones: string
  created_at: string
}
