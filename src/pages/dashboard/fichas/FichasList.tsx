import { Link } from 'react-router-dom'
import type { FichaClinica } from '../../../types/fichas'

interface FichasListProps {
  fichas: FichaClinica[]
  pacienteId: string
}

function formatFecha(fecha: string) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function FichasList({ fichas, pacienteId }: FichasListProps) {
  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {fichas.length === 0
            ? 'Sin fichas clínicas registradas'
            : `${fichas.length} ficha${fichas.length > 1 ? 's' : ''} registrada${fichas.length > 1 ? 's' : ''}`}
        </p>
        <Link
          to={`/dashboard/pacientes/${pacienteId}/fichas/nueva`}
          className="flex items-center gap-2 bg-azure hover:bg-deep text-white text-sm font-medium px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-azure/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva ficha
        </Link>
      </div>

      {/* Empty state */}
      {fichas.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-ice rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-azure" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg font-semibold text-deep mb-1">Sin fichas clínicas</h3>
          <p className="text-sm text-gray-500 mb-4">Registra la primera ficha clínica de este paciente.</p>
          <Link
            to={`/dashboard/pacientes/${pacienteId}/fichas/nueva`}
            className="inline-flex items-center gap-2 bg-azure hover:bg-deep text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Crear primera ficha
          </Link>
        </div>
      )}

      {/* Ficha cards */}
      {fichas.map(ficha => (
        <Link
          key={ficha.id}
          to={`/dashboard/pacientes/${pacienteId}/fichas/${ficha.id}`}
          className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-azure/30 transition-all p-5 group"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Date block */}
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-azure to-deep rounded-xl flex flex-col items-center justify-center text-white">
              <span className="text-lg font-bold leading-none">
                {new Date(ficha.fecha + 'T12:00:00').getDate()}
              </span>
              <span className="text-[10px] uppercase font-medium opacity-80">
                {new Date(ficha.fecha + 'T12:00:00').toLocaleString('es-EC', { month: 'short' })}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-semibold text-deep text-base group-hover:text-azure transition-colors truncate">
                {ficha.motivo_consulta}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{formatFecha(ficha.fecha)}</p>

              {/* Vital signs preview */}
              {ficha.signos_vitales && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {ficha.signos_vitales.presion_arterial && (
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      PA: {ficha.signos_vitales.presion_arterial}
                    </span>
                  )}
                  {ficha.signos_vitales.frecuencia_cardiaca > 0 && (
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 inline-block" />
                      FC: {ficha.signos_vitales.frecuencia_cardiaca} bpm
                    </span>
                  )}
                  {ficha.signos_vitales.peso > 0 && (
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                      {ficha.signos_vitales.peso} kg
                    </span>
                  )}
                </div>
              )}

              {/* Brief observations */}
              {ficha.observaciones && (
                <p className="text-xs text-gray-400 mt-1.5 truncate">{ficha.observaciones}</p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 group-hover:bg-azure/10 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-azure transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Odontogram summary if snapshot has non-sano teeth */}
          {ficha.odontograma_snapshot && ficha.odontograma_snapshot.length > 0 && (() => {
            const withFindings = ficha.odontograma_snapshot.filter(d =>
              Object.values(d.superficies).some(s => s.simbolo !== 'sano')
            )
            if (withFindings.length === 0) return null
            return (
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="text-xs text-gray-500">
                  Odontograma: {withFindings.length} pieza{withFindings.length > 1 ? 's' : ''} con hallazgos registrados
                </span>
              </div>
            )
          })()}
        </Link>
      ))}
    </div>
  )
}
