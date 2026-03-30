import { z } from 'zod'

// Paciente validation
export const pacienteSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  apellido: z.string().min(2, 'Apellido debe tener al menos 2 caracteres').max(100),
  cedula: z.string().regex(/^\d{6,15}$/, 'Cédula debe contener solo números (6-15 dígitos)'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().regex(/^\+?[0-9]{7,15}$/, 'Teléfono inválido (7-15 dígitos)'),
  fecha_nacimiento: z.string().refine((date) => {
    const d = new Date(date)
    const age = new Date().getFullYear() - d.getFullYear()
    return age >= 0 && age <= 150
  }, 'Fecha de nacimiento inválida'),
  grupo_sanguineo: z.string().optional().or(z.literal('')),
  sexo: z.enum(['', 'masculino', 'femenino', 'otro']).optional(),
  ocupacion: z.string().max(100).optional(),
  direccion: z.string().max(200).optional(),
  alergias: z.string().max(1000).optional(),
  antecedentes: z.string().max(2000).optional(),
})

export type PacienteInput = z.infer<typeof pacienteSchema>

// Cita validation
export const citaSchema = z.object({
  paciente_id: z.string().uuid('ID de paciente inválido'),
  fecha: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
  motivo: z.string().min(5, 'Motivo debe tener al menos 5 caracteres').max(500),
  estado: z.enum(['programada', 'confirmada', 'completada', 'cancelada', 'inasistencia']).optional(),
  notas: z.string().max(1000).optional(),
})

export type CitaInput = z.infer<typeof citaSchema>

// Procedimiento validation
export const procedimientoSchema = z.object({
  paciente_id: z.string().uuid('ID de paciente inválido'),
  cita_id: z.string().uuid('ID de cita inválido').optional(),
  tipo: z.enum([
    'Consulta',
    'Limpieza',
    'Endodoncia',
    'Extracción',
    'Blanqueamiento',
    'Carilla',
    'Corona',
    'Prótesis',
    'Implante',
    'Ortodoncia',
    'Armonía facial',
    'Otro'
  ], 'Tipo de procedimiento requerido'),
  descripcion: z.string().max(500).optional(),
  costo: z.number().min(0, 'Costo no puede ser negativo').finite().optional(),
  fecha: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
  estado: z.enum(['planificado', 'realizado', 'cancelado']).optional(),
})

export type ProcedimientoInput = z.infer<typeof procedimientoSchema>

// Pago validation
export const pagoSchema = z.object({
  paciente_id: z.string().uuid('ID de paciente inválido'),
  cita_id: z.string().uuid('ID de cita inválido').optional(),
  monto: z.number().positive('Monto debe ser mayor a 0').finite(),
  fecha: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro']),
  estado: z.enum(['pagado', 'pendiente', 'parcial']),
  notas: z.string().max(500).optional(),
})

export type PagoInput = z.infer<typeof pagoSchema>

// Ficha Clínica validation
export const fichaClinicaSchema = z.object({
  paciente_id: z.string().uuid('ID de paciente inválido'),
  cita_id: z.string().uuid('ID de cita inválido').optional(),
  fecha: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
  motivo_consulta: z.string().min(5, 'Motivo de consulta requerido').max(500),
  enfermedad_actual: z.string().max(1000).optional(),
  antecedentes_visita: z.string().max(2000).optional(),
})

export type FichaClinicaInput = z.infer<typeof fichaClinicaSchema>

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export type LoginInput = z.infer<typeof loginSchema>

// Password validation (sin requiero 12 caracteres)
export const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener mayúsculas')
    .regex(/[a-z]/, 'Debe contener minúsculas')
    .regex(/[0-9]/, 'Debe contener números')
    .regex(/[!@#$%^&*]/, 'Debe contener caracteres especiales (!@#$%^&*)')
})

export type PasswordInput = z.infer<typeof passwordSchema>

// Utility function para validar y retornar errores amigables
export function validateData<T>(schema: z.ZodSchema, data: unknown): { valid: boolean; data?: T; errors?: Record<string, string[]> } {
  try {
    const validated = schema.parse(data)
    return { valid: true, data: validated as T }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors
      return { valid: false, errors: errors as Record<string, string[]> }
    }
    return { valid: false, errors: { _general: ['Error de validación'] } }
  }
}
