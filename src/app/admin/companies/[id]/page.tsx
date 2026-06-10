import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateCompany, assignUser, unassignUser } from '../../actions'
import Link from 'next/link'

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: company }, { data: unassigned }] = await Promise.all([
    supabase
      .from('companies')
      .select('*, user_profiles(user_id, role, email)')
      .eq('id', params.id)
      .single(),
    supabase
      .from('user_profiles')
      .select('user_id, email')
      .is('company_id', null),
  ])

  if (!company) notFound()

  const assigned = (company.user_profiles as any[]) ?? []

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin" className="text-gray-400 hover:text-gray-700 text-xl leading-none">←</Link>
        <h1 className="text-2xl font-bold text-gray-800">{company.name}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${company.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {company.active ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      {/* Editar empresa */}
      <form action={updateCompany.bind(null, company.id)} className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-700">Configuración</h2>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Nombre</label>
          <input
            name="name"
            required
            defaultValue={company.name}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Color principal</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="primary_color"
              defaultValue={company.primary_color}
              className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-mono">{company.primary_color}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Estado</label>
          <select
            name="active"
            defaultValue={String(company.active)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="true">Activa</option>
            <option value="false">Inactiva</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-gray-900 hover:bg-gray-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
          Guardar cambios
        </button>
      </form>

      {/* Usuarios asignados */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-700 mb-3">Usuarios asignados</h2>
        {assigned.length === 0 ? (
          <p className="text-sm text-gray-400">Ninguno aún.</p>
        ) : (
          <div className="space-y-2">
            {assigned.map((u: any) => (
              <div key={u.user_id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{u.email ?? '—'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{u.role}</span>
                  <form action={unassignUser.bind(null, u.user_id)}>
                    <button type="submit" className="text-xs text-red-400 hover:text-red-600">Quitar</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asignar usuario */}
      {(unassigned ?? []).length > 0 && (
        <form action={assignUser.bind(null, company.id)} className="bg-white rounded-xl border p-5 space-y-3">
          <h2 className="font-semibold text-gray-700">Asignar usuario</h2>
          <p className="text-xs text-gray-400">Usuarios registrados sin empresa:</p>
          <select
            name="user_id"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="">— Seleccionar —</option>
            {(unassigned ?? []).map((u: any) => (
              <option key={u.user_id} value={u.user_id}>{u.email}</option>
            ))}
          </select>
          <button type="submit" className="w-full bg-gray-900 hover:bg-gray-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
            Asignar a esta empresa
          </button>
        </form>
      )}
    </div>
  )
}
