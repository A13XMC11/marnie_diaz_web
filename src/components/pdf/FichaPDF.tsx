import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { FichaClinica } from '../../types/fichas'

interface FichaPDFProps {
  ficha: FichaClinica
  paciente: {
    nombre: string
    apellido: string
    cedula?: string
    sexo?: string
    fecha_nacimiento?: string
  }
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#003d5c',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003d5c',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    backgroundColor: '#e8f3f8',
    padding: 5,
    marginBottom: 8,
    color: '#003d5c',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 5,
  },
  col: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  value: {
    color: '#555',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#999',
    marginTop: 5,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  footer: {
    marginTop: 30,
    fontSize: 9,
    color: '#999',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
})

export default function FichaPDF({ ficha, paciente }: FichaPDFProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-EC')
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>FICHA CLÍNICA DENTAL</Text>
          <Text style={styles.subtitle}>
            Marnie Díaz - Odontología | {formatDate(ficha.fecha)}
          </Text>
        </View>

        {/* Datos del Paciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 DATOS DEL PACIENTE</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.value}>
                {paciente.nombre} {paciente.apellido}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Cédula</Text>
              <Text style={styles.value}>{paciente.cedula || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Sexo</Text>
              <Text style={styles.value}>{paciente.sexo || 'N/A'}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Fecha de Nacimiento</Text>
              <Text style={styles.value}>
                {paciente.fecha_nacimiento
                  ? formatDate(paciente.fecha_nacimiento)
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Motivo de la Consulta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 CONSULTA</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Motivo</Text>
              <Text style={styles.value}>{ficha.motivo_consulta}</Text>
            </View>
          </View>
          {ficha.enfermedad_actual && (
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Enfermedad Actual</Text>
                <Text style={styles.value}>{ficha.enfermedad_actual}</Text>
              </View>
            </View>
          )}
          {ficha.antecedentes_visita && (
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Antecedentes de la Visita</Text>
                <Text style={styles.value}>{ficha.antecedentes_visita}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Signos Vitales */}
        {ficha.signos_vitales && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚕️ SIGNOS VITALES</Text>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Presión Arterial</Text>
                <Text style={styles.value}>
                  {ficha.signos_vitales.presion_arterial}
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>FC (bpm)</Text>
                <Text style={styles.value}>
                  {ficha.signos_vitales.frecuencia_cardiaca}
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>FR (rpm)</Text>
                <Text style={styles.value}>
                  {ficha.signos_vitales.frecuencia_respiratoria}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Temp. Bucal (°C)</Text>
                <Text style={styles.value}>
                  {ficha.signos_vitales.temperatura_bucal}
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Temp. Axilar (°C)</Text>
                <Text style={styles.value}>
                  {ficha.signos_vitales.temperatura_axilar}
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Peso/Talla</Text>
                <Text style={styles.value}>
                  {ficha.signos_vitales.peso} kg / {ficha.signos_vitales.talla}{' '}
                  cm
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Indicadores de Salud Bucal */}
        {ficha.indicadores_salud && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🦷 INDICADORES DE SALUD BUCAL</Text>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>IHOS</Text>
                <Text style={styles.value}>{ficha.indicadores_salud.ihos}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Índice de Placa</Text>
                <Text style={styles.value}>
                  {ficha.indicadores_salud.indice_placa}%
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Índice de Cálculo</Text>
                <Text style={styles.value}>
                  {ficha.indicadores_salud.indice_calculo}%
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>CPO (Permanentes)</Text>
                <Text style={styles.value}>
                  C:{ficha.indicadores_salud.cpo.cariados} P:
                  {ficha.indicadores_salud.cpo.perdidos} O:
                  {ficha.indicadores_salud.cpo.obturados}
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>ceo (Temporales)</Text>
                <Text style={styles.value}>
                  c:{ficha.indicadores_salud.ceo.cariados} e:
                  {ficha.indicadores_salud.ceo.perdidos} o:
                  {ficha.indicadores_salud.ceo.obturados}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Observaciones */}
        {ficha.observaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 OBSERVACIONES</Text>
            <Text style={styles.value}>{ficha.observaciones}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Ficha ID: {ficha.id} | Fecha de creación: {formatDate(ficha.fecha)}
          </Text>
          <Text>Este documento es confidencial y contiene información médica privada.</Text>
        </View>
      </Page>
    </Document>
  )
}
