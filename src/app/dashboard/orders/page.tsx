import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  preparing: 'En preparación',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600',
}

const STATUS_ORDER: Record<string, number> = {
  preparing: 0,
  pending: 1,
  ready: 2,
  delivered: 3,
  cancelled: 4,
}

const FILTER_TABS = [
  { value: '', label: 'Activos' },
  { value: 'preparing', label: 'En preparación' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'ready', label: 'Listos' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
]

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const activeFilter = searchParams.status ?? ''

  let query = supabase
    .from('orders')
    .select('*, customers(name)')
    .order('delivery_date', { ascending: true })

  if (activeFilter) {
    query = query.eq('status', activeFilter)
  } else {
    query = query.not('status', 'eq', 'cancelled')
  }

  const { data: rawOrders } = await query

  const orders = (rawOrders ?? []).sort(
    (a, b) =>
      (STATUS_ORDER[a.status ?? 'pending'] ?? 99) -
      (STATUS_ORDER[b.status ?? 'pending'] ?? 99)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Pedidos</h1>
        <Link
          href="/dashboard/orders/new"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo pedido
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {FILTER_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/dashboard/orders?status=${tab.value}` : '/dashboard/orders'}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              activeFilter === tab.value
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {!orders.length ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm">No hay pedidos en este estado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const pending = order.total - (order.deposit ?? 0)
            const status = order.status ?? 'pending'
            return (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="bg-white rounded-xl border border-brand-100 p-4 flex items-center justify-between hover:border-brand-300 transition-colors block"
              >
                <div>
                  <p className="font-medium text-gray-800">{(order.customers as any)?.name ?? '—'}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {new Date(order.delivery_date + 'T12:00:00').toLocaleDateString('es-CO', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABEL[status] ?? status}
                  </span>
                  {order.is_gift
                    ? <span className="text-sm font-semibold text-pink-500">Gratis 🎁</span>
                    : <>
                        <p className="text-sm font-semibold text-gray-700">${order.total.toLocaleString('es-CO')}</p>
                        {pending > 0 && (
                          <p className="text-xs text-brand-500">Falta ${pending.toLocaleString('es-CO')}</p>
                        )}
                      </>
                  }
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
