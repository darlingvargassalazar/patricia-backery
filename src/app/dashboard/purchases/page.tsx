import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PurchasesPage() {
  const supabase = createClient()
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .order('purchase_date', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Compras</h1>
        <Link
          href="/dashboard/purchases/new"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Registrar compra
        </Link>
      </div>

      {!purchases?.length ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-12 text-center">
          <div className="text-4xl mb-3">🛒</div>
          <p className="text-gray-500 text-sm">No hay compras registradas aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => (
            <Link
              key={purchase.id}
              href={`/dashboard/purchases/${purchase.id}`}
              className="bg-white rounded-xl border border-brand-100 p-4 flex items-center justify-between hover:border-brand-300 transition-colors block"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {purchase.supplier_name ?? 'Sin proveedor'}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {new Date(purchase.purchase_date + 'T12:00:00').toLocaleDateString('es-CO', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <p className="text-base font-semibold text-brand-700">
                ${purchase.total.toLocaleString('es-CO')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
