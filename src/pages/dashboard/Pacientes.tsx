import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { SkeletonRow } from '../../components/SkeletonLoader'

interface Paciente {
  id: string
  nombre: string
  apellido: string
  cedula: string
  fecha_nacimiento: string
  telefono: string
  email: string
  direccion: string
  alergias: string
  antecedentes: string
}

const emptyForm: Omit<Paciente, 'id'> = {
  nombre: '', apellido: '', cedula: '', fecha_nacimiento: '',
  telefono: '', email: '', direccion: '', alergias: '', antecedentes: '',
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Paciente | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchPacientes = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('pacientes').select('*').order('apellido')
    setPacientes(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchPacientes() }, [fetchPacientes])

  const openNew = () => { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true) }
  const openEdit = (p: Paciente) => { setEditing(p); setForm({ nombre: p.nombre, apellido: p.apellido, cedula: p.cedula, fecha_nacimiento: p.fecha_nacimiento, telefono: p.telefono, email: p.email, direccion: p.direccion, alergias: p.alergias, antecedentes: p.antecedentes }); setError(''); setShowModal(true) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: dbError } = editing
      ? await supabase.from('pacientes').update(form).eq('id', editing.id)
      : await supabase.from('pacientes').insert(form)
    setSaving(false)
    if (dbError) { setError(dbError.message); return }
    setShowModal(false)
    fetchPacientes()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este paciente y toda su información?')) return
    const { error: dbError } = await supabase.from('pacientes').delete().eq('id', id)
    if (dbError) { alert(dbError.message); return }
    fetchPacientes()
  }

  const filtered = pacientes.filter(p =>
    `${p.nombre} ${p.apellido} ${p.cedula}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-deep">Pacientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Historias clínicas y datos personales</p>
        </div>
        <button onClick={openNew} className="bg-azure hover:bg-deep text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-azure/30">
          <span>+</span> Nuevo paciente
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, apellido o cédula..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-azure focus:ring-2 focus:ring-azure/10 bg-white"
        />
      </div>

      {/* Patient list */}
      {loading ? (
        <SkeletonRow count={5} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-ice rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-azure" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg font-semibold text-deep mb-1">Sin pacientes registrados</h3>
          <p className="text-sm text-gray-500 mb-4">
            {search ? `No se encontraron resultados para "${search}"` : 'Registra el primer paciente con el botón de arriba.'}
          </p>
          {!search && (
            <button onClick={openNew} className="inline-flex items-center gap-2 bg-azure hover:bg-deep text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              Nuevo paciente
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 px-1">
            {filtered.length} paciente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-azure/20 transition-all p-5 group">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-azure/20 to-sky/20 flex items-center justify-center text-azure font-bold text-sm font-serif flex-shrink-0">
                  {p.nombre?.[0] ?? '?'}{p.apellido?.[0] ?? ''}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-semibold text-deep text-base leading-tight">
                    {p.nombre} {p.apellido}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    {p.cedula && <span className="text-xs text-gray-500">CI: {p.cedula}</span>}
                    {p.telefono && <span className="text-xs text-gray-400">{p.telefono}</span>}
                    {p.email && <span className="text-xs text-gray-400 hidden lg:block truncate max-w-[200px]">{p.email}</span>}
                  </div>
                  {p.alergias && (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
                      {p.alergias}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/dashboard/pacientes/${p.id}`}
                    className="text-xs bg-azure/10 text-azure hover:bg-azure hover:text-white px-3 py-1.5 rounded-lg font-medium transition-all"
                  >
                    Ver historia
                  </Link>
                  <button
                    onClick={() => openEdit(p)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium transition-all hidden sm:block"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-medium transition-all hidden md:block"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-deep">{editing ? 'Editar paciente' : 'Nuevo paciente'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Nombre *</label><input required value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white"/></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Apellido *</label><input required value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Cédula</label><input value={form.cedula} onChange={e=>setForm({...form,cedula:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white"/></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Fecha de nacimiento</label><input type="date" value={form.fecha_nacimiento} onChange={e=>setForm({...form,fecha_nacimiento:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Teléfono</label><input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white"/></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white"/></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Dirección</label><input value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure bg-white"/></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">⚠ Alergias</label><textarea value={form.alergias} onChange={e=>setForm({...form,alergias:e.target.value})} rows={2} placeholder="Medicamentos, látex, etc." className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 resize-none bg-white"/></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Antecedentes médicos</label><textarea value={form.antecedentes} onChange={e=>setForm({...form,antecedentes:e.target.value})} rows={3} placeholder="Enfermedades, cirugías previas, medicación actual..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure resize-none bg-white"/></div>
              {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-azure hover:bg-deep text-white py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-60">
                  {saving ? 'Guardando...' : (editing ? 'Actualizar' : 'Crear paciente')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
