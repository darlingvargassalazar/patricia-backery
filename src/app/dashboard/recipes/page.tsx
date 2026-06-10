import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function fmt(n: number) {
  return Math.round(n).toLocaleString('es-CO')
}

export default async function RecipesPage() {
  const supabase = createClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, name, portions, ingredient_cost, labor_pct, overhead_pct, total_cost, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Costeo de productos</h1>
        <Link
          href="/dashboard/recipes/new"
          className="bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          + Nuevo costo
        </Link>
      </div>

      {!recipes?.length ? (
        <div className="bg-white rounded-xl border border-brand-100 p-10 text-center">
          <p className="text-gray-400 text-sm">Aún no hay costeos guardados.</p>
          <Link href="/dashboard/recipes/new" className="mt-3 inline-block text-sm text-brand-600 hover:text-brand-800 font-medium">
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100 bg-brand-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Porciones</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Costo directo</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Costo total</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Por porción</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recipes.map((r) => {
                const costPerPortion = r.portions > 1 ? r.total_cost / r.portions : null
                return (
                  <tr key={r.id} className="hover:bg-brand-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/recipes/${r.id}`} className="font-medium text-gray-800 hover:text-brand-700">
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500 hidden sm:table-cell">
                      {r.portions}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-500 hidden sm:table-cell">
                      ${fmt(r.ingredient_cost)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-brand-700">
                      ${fmt(r.total_cost)}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-500 hidden sm:table-cell">
                      {costPerPortion ? `$${fmt(costPerPortion)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/recipes/${r.id}/edit`}
                        className="text-xs text-brand-600 hover:text-brand-800 font-medium border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
