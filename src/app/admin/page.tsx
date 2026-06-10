import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = createClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('*, user_profiles(role)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Empresas</h1>
        <Link
          href="/admin/companies/new"
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva empresa
        </Link>
      </div>

      {!companies?.length ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
          Sin empresas registradas.
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={`/admin/companies/${c.id}`}
              className="bg-white rounded-xl border p-4 flex items-center justify-between hover:border-gray-300 transition-colors block"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow"
                  style={{ background: c.primary_color }}
                />
                <div>
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {(c.user_profiles as any[])?.length ?? 0} usuario(s)
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
