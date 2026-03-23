import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

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
    if (editing) {
      const { error } = await supabase.from('pacientes').update(form).eq('id', editing.id)
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.from('pacientes').insert(form)
      if (error) setError(error.message)
    }
    setSaving(false)
    if (!error) { setShowModal(false); fetchPacientes() }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este paciente y toda su información?')) return
    await supabase.from('pacientes').delete().eq('id', id)
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
          <h1 className="text-2xl font-bold text-deep">Pacientes</h1>
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

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-azure border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-medium">No hay pacientes registrados</p>
          <p className="text-sm mt-1">Crea el primer paciente con el botón de arriba</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Paciente</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Cédula</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Teléfono</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Email</th>
                <th className="px-5 py-3.5"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-azure/10 flex items-center justify-center text-azure font-bold text-sm">
                        {p.nombre[0]}{p.apellido[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{p.nombre} {p.apellido}</div>
                        {p.alergias && <div className="text-xs text-amber-600 mt-0.5">⚠ {p.alergias}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{p.cedula || '—'}</td>
                  <td className="px-5 py-4 text-gray-600 hidden lg:table-cell">{p.telefono || '—'}</td>
                  <td className="px-5 py-4 text-gray-600 hidden lg:table-cell">{p.email || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/dashboard/pacientes/${p.id}`} className="text-xs bg-azure/10 text-azure hover:bg-azure hover:text-white px-3 py-1.5 rounded-lg font-medium transition-all">
                        Ver historia
                      </Link>
                      <button onClick={() => openEdit(p)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-all">Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-all">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
            {filtered.length} paciente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </div>
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
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Nombre *</label><input required value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure"/></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Apellido *</label><input required value={form.apellido} onChange={e=>setForm({...form,apellido:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Cédula</label><input value={form.cedula} onChange={e=>setForm({...form,cedula:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure"/></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Fecha de nacimiento</label><input type="date" value={form.fecha_nacimiento} onChange={e=>setForm({...form,fecha_nacimiento:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Teléfono</label><input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure"/></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure"/></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Dirección</label><input value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure"/></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">⚠ Alergias</label><textarea value={form.alergias} onChange={e=>setForm({...form,alergias:e.target.value})} rows={2} placeholder="Medicamentos, látex, etc." className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 resize-none"/></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Antecedentes médicos</label><textarea value={form.antecedentes} onChange={e=>setForm({...form,antecedentes:e.target.value})} rows={3} placeholder="Enfermedades, cirugías previas, medicación actual..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-azure resize-none"/></div>
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
