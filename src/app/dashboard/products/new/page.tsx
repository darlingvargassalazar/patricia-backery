import { createProduct } from '../actions'

const UNITS = ['kg', 'g', 'lt', 'ml', 'unidades', 'tazas', 'cdas', 'cdtas']

export default function NewProductPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const type = searchParams.type === 'raw_material' ? 'raw_material' : 'sale'
  const isRaw = type === 'raw_material'

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <a href={isRaw ? '/dashboard/inventory' : '/dashboard/products'} className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</a>
        <h1 className="text-xl font-bold text-gray-800">
          {isRaw ? 'Nuevo ingrediente' : 'Nuevo producto para venta'}
        </h1>
      </div>

      <form action={createProduct} className="space-y-4">
        <input type="hidden" name="type" value={type} />

        <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              name="name"
              required
              placeholder={isRaw ? 'Ej: Harina de trigo' : 'Ej: Torta de chocolate'}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {isRaw ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                <select
                  name="unit"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock actual</label>
                  <input name="current_stock" type="number" min="0" step="0.5" defaultValue="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                  <input name="min_stock" type="number" min="0" step="0.5" defaultValue="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                <input name="price" type="number" min="0" step="500" required placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock inicial</label>
                <input name="current_stock" type="number" min="0" defaultValue="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>
          )}
        </div>

        <button type="submit"
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition-colors">
          Guardar
        </button>
      </form>
    </div>
  )
}
