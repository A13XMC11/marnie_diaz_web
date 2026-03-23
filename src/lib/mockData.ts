// ============================================================
// DEMO DATA — datos de ejemplo para el modo preview
// ============================================================

export const DEMO_USER = {
  id: 'demo-admin-id',
  email: 'admin@marniediaz.com',
  created_at: '2025-01-01T00:00:00Z',
}

export const DEMO_SESSION = {
  user: DEMO_USER,
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  expires_at: Date.now() / 1000 + 86400,
}

const HOY = new Date().toISOString().split('T')[0]
const AYER = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const MAÑANA = new Date(Date.now() + 86400000).toISOString().split('T')[0]

export const DEMO_DATA: Record<string, object[]> = {
  pacientes: [
    { id: 'p1', nombre: 'Andrea', apellido: 'Rodríguez', cedula: '1712345678', fecha_nacimiento: '1990-03-15', telefono: '099 886 2001', email: 'andrea.r@gmail.com', direccion: 'La Gasca, Quito', alergias: 'Penicilina', antecedentes: 'Hipertensión controlada', created_at: '2025-01-10T10:00:00Z' },
    { id: 'p2', nombre: 'Carlos', apellido: 'Mendoza', cedula: '1798765432', fecha_nacimiento: '1955-07-22', telefono: '099 882 6201', email: 'c.mendoza@yahoo.com', direccion: 'La Floresta, Quito', alergias: '', antecedentes: 'Diabético tipo 2. Medicación: Metformina 500mg', created_at: '2025-01-12T11:00:00Z' },
    { id: 'p3', nombre: 'Lucía', apellido: 'Pacheco', cedula: '1723456789', fecha_nacimiento: '1985-11-08', telefono: '098 765 4321', email: 'lucia.pacheco@hotmail.com', direccion: 'Bellavista, Quito', alergias: '', antecedentes: '', created_at: '2025-02-01T09:00:00Z' },
    { id: 'p4', nombre: 'Roberto', apellido: 'Vásquez', cedula: '1754321098', fecha_nacimiento: '1972-05-30', telefono: '099 111 2233', email: 'roberto.v@gmail.com', direccion: 'El Batán, Quito', alergias: 'Látex', antecedentes: 'Cardiopatía. Toma aspirina diaria', created_at: '2025-02-15T14:00:00Z' },
    { id: 'p5', nombre: 'María', apellido: 'Torres', cedula: '1765432109', fecha_nacimiento: '2001-09-14', telefono: '097 654 3210', email: 'maria.torres@gmail.com', direccion: 'Cotocollao, Quito', alergias: '', antecedentes: '', created_at: '2025-03-01T08:00:00Z' },
  ],
  citas: [
    { id: 'c1', paciente_id: 'p1', fecha: AYER, hora: '09:00', motivo: 'Blanqueamiento dental', estado: 'completada', notas: 'Resultado excelente, 8 tonos más blanco', created_at: '2025-03-20T08:00:00Z', pacientes: { nombre: 'Andrea', apellido: 'Rodríguez' } },
    { id: 'c2', paciente_id: 'p2', fecha: HOY, hora: '10:30', motivo: 'Control prótesis parcial', estado: 'confirmada', notas: '', created_at: '2025-03-21T10:00:00Z', pacientes: { nombre: 'Carlos', apellido: 'Mendoza' } },
    { id: 'c3', paciente_id: 'p3', fecha: HOY, hora: '14:00', motivo: 'Endodoncia pieza 16', estado: 'programada', notas: 'Turno de 1.5 horas', created_at: '2025-03-21T12:00:00Z', pacientes: { nombre: 'Lucía', apellido: 'Pacheco' } },
    { id: 'c4', paciente_id: 'p4', fecha: MAÑANA, hora: '08:30', motivo: 'Evaluación para implante', estado: 'programada', notas: 'Verificar radiografía panorámica', created_at: '2025-03-22T09:00:00Z', pacientes: { nombre: 'Roberto', apellido: 'Vásquez' } },
    { id: 'c5', paciente_id: 'p5', fecha: MAÑANA, hora: '11:00', motivo: 'Primera consulta', estado: 'programada', notas: '', created_at: '2025-03-22T10:00:00Z', pacientes: { nombre: 'María', apellido: 'Torres' } },
    { id: 'c6', paciente_id: 'p1', fecha: '2025-03-10', hora: '10:00', motivo: 'Limpieza dental', estado: 'completada', notas: '', created_at: '2025-03-05T09:00:00Z', pacientes: { nombre: 'Andrea', apellido: 'Rodríguez' } },
  ],
  procedimientos: [
    { id: 'pr1', paciente_id: 'p1', cita_id: 'c6', tipo: 'Limpieza', descripcion: 'Profilaxis + aplicación de flúor', costo: 45.00, fecha: '2025-03-10', estado: 'realizado', created_at: '2025-03-10T10:00:00Z', pacientes: { nombre: 'Andrea', apellido: 'Rodríguez' } },
    { id: 'pr2', paciente_id: 'p1', cita_id: 'c1', tipo: 'Blanqueamiento', descripcion: 'Blanqueamiento LED - 8 tonos', costo: 180.00, fecha: AYER, estado: 'realizado', created_at: '2025-03-22T09:00:00Z', pacientes: { nombre: 'Andrea', apellido: 'Rodríguez' } },
    { id: 'pr3', paciente_id: 'p2', cita_id: null, tipo: 'Prótesis', descripcion: 'Prótesis parcial removible superior', costo: 320.00, fecha: '2025-02-20', estado: 'realizado', created_at: '2025-02-20T11:00:00Z', pacientes: { nombre: 'Carlos', apellido: 'Mendoza' } },
    { id: 'pr4', paciente_id: 'p3', cita_id: 'c3', tipo: 'Endodoncia', descripcion: 'Endodoncia pieza 16 - 3 conductos', costo: 150.00, fecha: HOY, estado: 'planificado', created_at: '2025-03-23T08:00:00Z', pacientes: { nombre: 'Lucía', apellido: 'Pacheco' } },
    { id: 'pr5', paciente_id: 'p4', cita_id: null, tipo: 'Consulta', descripcion: 'Evaluación inicial implante pieza 46', costo: 0.00, fecha: MAÑANA, estado: 'planificado', created_at: '2025-03-22T09:00:00Z', pacientes: { nombre: 'Roberto', apellido: 'Vásquez' } },
  ],
  pagos: [
    { id: 'pa1', paciente_id: 'p1', monto: 45.00, fecha: '2025-03-10', metodo_pago: 'efectivo', estado: 'pagado', notas: 'Pago limpieza', created_at: '2025-03-10T11:00:00Z', pacientes: { nombre: 'Andrea', apellido: 'Rodríguez' } },
    { id: 'pa2', paciente_id: 'p1', monto: 180.00, fecha: AYER, metodo_pago: 'transferencia', estado: 'pagado', notas: 'Blanqueamiento LED', created_at: '2025-03-22T10:00:00Z', pacientes: { nombre: 'Andrea', apellido: 'Rodríguez' } },
    { id: 'pa3', paciente_id: 'p2', monto: 200.00, fecha: '2025-02-20', metodo_pago: 'efectivo', estado: 'pagado', notas: 'Abono prótesis', created_at: '2025-02-20T12:00:00Z', pacientes: { nombre: 'Carlos', apellido: 'Mendoza' } },
    { id: 'pa4', paciente_id: 'p2', monto: 120.00, fecha: '2025-03-05', metodo_pago: 'tarjeta', estado: 'pendiente', notas: 'Saldo prótesis', created_at: '2025-03-05T10:00:00Z', pacientes: { nombre: 'Carlos', apellido: 'Mendoza' } },
    { id: 'pa5', paciente_id: 'p3', monto: 75.00, fecha: HOY, metodo_pago: 'efectivo', estado: 'pendiente', notas: 'Abono endodoncia', created_at: '2025-03-23T08:00:00Z', pacientes: { nombre: 'Lucía', apellido: 'Pacheco' } },
  ],
  odontograma: [
    { id: 'od1', paciente_id: 'p1', diente_numero: 11, estado: 'obturado', notas: 'Resina clase IV', fecha: '2025-01-15' },
    { id: 'od2', paciente_id: 'p1', diente_numero: 21, estado: 'corona', notas: 'Corona de porcelana 2022', fecha: '2025-01-15' },
    { id: 'od3', paciente_id: 'p1', diente_numero: 36, estado: 'obturado', notas: 'Amalgama', fecha: '2025-01-15' },
    { id: 'od4', paciente_id: 'p2', diente_numero: 15, estado: 'extraccion', notas: 'Extracción 2023', fecha: '2025-02-20' },
    { id: 'od5', paciente_id: 'p2', diente_numero: 25, estado: 'extraccion', notas: 'Extracción 2023', fecha: '2025-02-20' },
    { id: 'od6', paciente_id: 'p2', diente_numero: 46, estado: 'caries', notas: 'Caries profunda - requiere endodoncia', fecha: '2025-02-20' },
    { id: 'od7', paciente_id: 'p3', diente_numero: 16, estado: 'caries', notas: 'Caries con compromiso pulpar - planificada endodoncia', fecha: HOY },
  ],
}
