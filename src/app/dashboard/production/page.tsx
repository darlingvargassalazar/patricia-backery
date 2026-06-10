import { createClient } from '@/lib/supabase/server'

function urgency(deliveryDate: string): 'today' | 'tomorrow' | 'soon' | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const delivery = new Date(deliveryDate + 'T00:00:00')
  const diffDays = Math.round((delivery.getTime() - today.getTime()) / 86_400_000)
  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays === 2) return 'soon'
  return null
}

const URGENCY_STYLES = {
  today: { bar: 'border-red-400 bg-red-50', badge: 'bg-red-500 text-white', label: 'Hoy' },
  tomorrow: { bar: 'border-orange-400 bg-orange-50', badge: 'bg-orange-400 text-white', label: 'Mañana' },
  soon: { bar: 'border-yellow-400 bg-yellow-50', badge: 'bg-yellow-400 text-white', label: 'Pasado mañana' },
}

export default async function ProductionPage() {
  const supabase = createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const { data: orders } = await supabase
    .from('orders')
    .select('id, delivery_date, is_gift, customers(name), order_items(name, quantity)')
    .in('status', ['pending', 'preparing', 'ready'])
    .gte('delivery_date', todayStr)
    .order('delivery_date', { ascending: true })

  // Group by delivery_date
  const byDate = new Map<string, typeof orders>()
  for (const order of orders ?? []) {
    const key = order.delivery_date
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(order)
  }

  const hasOrders = byDate.size > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Producción</h1>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {!hasOrders ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-12 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-gray-500 text-sm">No hay pedidos pendientes próximos.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byDate.entries()).map(([date, dayOrders]) => {
            const u = urgency(date)
            const style = u ? URGENCY_STYLES[u] : null
            const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-CO', {
              weekday: 'long', day: 'numeric', month: 'long',
            })

            // Aggregate quantities per product name for this day
            const productTotals = new Map<string, number>()
            for (const order of dayOrders!) {
              for (const item of (order.order_items as any[])) {
                productTotals.set(item.name, (productTotals.get(item.name) ?? 0) + item.quantity)
              }
            }

            return (
              <div
                key={date}
                className={`rounded-xl border-l-4 p-4 ${style ? style.bar : 'border-brand-200 bg-white'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700 capitalize">{dateLabel}</p>
                  {style && (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${style.badge}`}>
                      {style.label}
                    </span>
                  )}
                </div>

                {/* Products summary */}
                <div className="mb-3 space-y-1">
                  {Array.from(productTotals.entries()).map(([name, qty]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-800 font-medium">{name}</span>
                      <span className="text-gray-500 text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5">
                        × {qty}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Per-order breakdown */}
                <div className="border-t border-gray-100 pt-2 space-y-1.5">
                  {(dayOrders ?? []).map((order) => (
                    <div key={order.id} className="flex items-start justify-between text-xs text-gray-500">
                      <span className="font-medium text-gray-600">
                        {(order.customers as any)?.name}
                        {order.is_gift && <span className="ml-1">🎁</span>}
                      </span>
                      <span className="text-right">
                        {(order.order_items as any[]).map((i: any) => `${i.name} ×${i.quantity}`).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
