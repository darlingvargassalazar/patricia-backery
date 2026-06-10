import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { addStock, deleteRawMaterial } from './actions'

function stockStatus(current: number, min: number) {
  if (current <= 0) return { color: 'text-red-500', bg: 'bg-red-50', label: 'Sin stock' }
  if (min > 0 && current <= min) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Stock bajo' }
  return { color: 'text-green-600', bg: 'bg-green-50', label: 'OK' }
}

export default async function InventoryPage() {
  const supabase = createClient()
  const { data: materials } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'raw_material')
    .order('name', { ascending: true })

  const low = materials?.filter(
    (m) => (m.current_stock ?? 0) <= (m.min_stock ?? 0) && (m.min_stock ?? 0) > 0
  ) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Inventario</h1>
        <Link
          href="/dashboard/products/new?type=raw_material"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Agregar
        </Link>
      </div>

      {low.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-medium text-yellow-800">Stock bajo en:</p>
            <p className="text-sm text-yellow-700">{low.map((m) => m.name).join(', ')}</p>
          </div>
        </div>
      )}

      {!materials?.length ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-500 text-sm">No hay ingredientes aún. ¡Agrega el primero!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((m) => {
            const current = m.current_stock ?? 0
            const min = m.min_stock ?? 0
            const status = stockStatus(current, min)
            return (
              <div key={m.id} className="bg-white rounded-xl border border-brand-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-800">{m.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-sm font-semibold ${status.color}`}>
                        {current % 1 === 0 ? current : current.toFixed(2)} {m.unit}
                      </span>
                      {min > 0 && (
                        <span className="text-xs text-gray-400">mín. {min} {m.unit}</span>
                      )}
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/products/${m.id}/edit`}
                      className="text-xs text-gray-400 hover:text-brand-500 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
                    >
                      Editar
                    </Link>
                    <form action={deleteRawMaterial.bind(null, m.id)}>
                      <button type="submit" className="text-xs text-gray-300 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
                <form action={addStock.bind(null, m.id)} className="flex gap-2">
                  <input
                    name="amount"
                    type="number"
                    min="0.001"
                    step="0.5"
                    placeholder={`Agregar ${m.unit}...`}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  <button type="submit" className="bg-brand-50 hover:bg-brand-100 text-brand-600 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                    + Agregar
                  </button>
                </form>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
