import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PurchaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: purchase } = await supabase
    .from('purchases')
    .select('*, purchase_items(*)')
    .eq('id', params.id)
    .single()

  if (!purchase) notFound()

  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <Link href="/dashboard/purchases" className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-1">←</Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {purchase.supplier_name ?? 'Sin proveedor'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(purchase.purchase_date + 'T12:00:00').toLocaleDateString('es-CO', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-100 p-4 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Artículos</h2>
        <div className="space-y-2">
          {(purchase.purchase_items as any[]).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.name}
                <span className="text-gray-400 ml-1">× {item.quantity} {item.unit}</span>
              </span>
              <span className="text-gray-600 font-medium">
                ${(item.unit_price * item.quantity).toLocaleString('es-CO')}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold text-sm">
          <span>Total</span>
          <span>${purchase.total.toLocaleString('es-CO')}</span>
        </div>
      </div>

      {purchase.notes && (
        <div className="bg-white rounded-xl border border-brand-100 p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-1">Notas</h2>
          <p className="text-sm text-gray-600">{purchase.notes}</p>
        </div>
      )}
    </div>
  )
}
