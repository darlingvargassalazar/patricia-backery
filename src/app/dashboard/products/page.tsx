import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { toggleProductActive, deleteProduct } from './actions'

export default async function ProductsPage() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'sale')
    .order('name', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Productos para venta</h1>
        <Link
          href="/dashboard/products/new"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Agregar
        </Link>
      </div>

      {!products?.length ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-12 text-center">
          <div className="text-4xl mb-3">🎂</div>
          <p className="text-gray-500 text-sm">No hay productos para venta aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-3 ${
                product.active ? 'border-brand-100' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 text-xl">
                    🎂
                  </div>
                )}
                <div className="min-w-0">
                  <p className={`font-medium truncate ${product.active ? 'text-gray-800' : 'text-gray-400'}`}>
                    {product.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-sm text-brand-600 font-semibold">
                      ${product.price.toLocaleString('es-CO')}
                    </span>
                    <span className={`text-xs ${(product.current_stock ?? 0) === 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      Stock: {product.current_stock ?? 0}
                    </span>
                    {!product.active && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">inactivo</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/products/${product.id}/edit`}
                  className="text-xs text-gray-400 hover:text-brand-500 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
                >
                  Editar
                </Link>
                <form action={toggleProductActive.bind(null, product.id, !product.active)}>
                  <button type="submit" className="text-xs text-gray-400 hover:text-brand-500 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors">
                    {product.active ? 'Desactivar' : 'Activar'}
                  </button>
                </form>
                <form action={deleteProduct.bind(null, product.id)}>
                  <button type="submit" className="text-xs text-gray-300 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
