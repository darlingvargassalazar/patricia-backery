import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  preparing: 'En preparación',
  ready: 'Listo',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

function dayLabel(dateStr: string, today: string, tomorrow: string) {
  if (dateStr === today) return 'Hoy'
  if (dateStr === tomorrow) return 'Mañana'
  return formatDate(dateStr)
}

export default async function DashboardPage() {
  const supabase = createClient()

  const now = new Date()
  const toISO = (d: Date) => d.toISOString().split('T')[0]
  const today = toISO(now)
  const tomorrow = toISO(new Date(now.getTime() + 86400000))
  const in2days = toISO(new Date(now.getTime() + 2 * 86400000))

  const [
    { data: activeOrders },
    { data: upcomingOrders },
    { data: pendingPaymentOrders },
    { data: lowStock },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total, deposit')
      .not('status', 'in', '("delivered","cancelled")'),
    supabase
      .from('orders')
      .select('id, delivery_date, status, total, deposit, customers(name)')
      .not('status', 'in', '("delivered","cancelled")')
      .gte('delivery_date', today)
      .lte('delivery_date', in2days)
      .order('delivery_date', { ascending: true }),
    supabase
      .from('orders')
      .select('id, delivery_date, total, deposit, is_gift, customers(name)')
      .not('status', 'in', '("delivered","cancelled")')
      .eq('is_gift', false)
      .order('delivery_date', { ascending: true }),
    supabase
      .from('products')
      .select('id, name, current_stock, min_stock, unit')
      .eq('type', 'raw_material')
      .gt('min_stock', 0)
      .filter('current_stock', 'lte', 'min_stock'),
  ])

  const totalPending = (activeOrders ?? []).reduce(
    (sum, o) => sum + o.total - (o.deposit ?? 0), 0
  )
  const todayOrders = (upcomingOrders ?? []).filter((o) => o.delivery_date === today)
  const lowStockItems = (lowStock ?? []).filter(
    (m) => (m.current_stock ?? 0) <= (m.min_stock ?? 0)
  )
  const unpaidOrders = (pendingPaymentOrders ?? []).filter(
    (o) => o.total - (o.deposit ?? 0) > 0
  )

  const stats = [
    {
      label: 'Pedidos activos',
      value: activeOrders?.length ?? 0,
      icon: '📋',
      href: '/dashboard/orders',
      color: 'bg-white',
    },
    {
      label: 'Entrega hoy',
      value: todayOrders.length,
      icon: '📅',
      href: '/dashboard/orders',
      color: todayOrders.length > 0 ? 'bg-brand-50 border-brand-200' : 'bg-white',
    },
    {
      label: 'Por cobrar',
      value: `$${Math.round(totalPending).toLocaleString('es-CO')}`,
      icon: '💰',
      href: '/dashboard/orders',
      color: 'bg-white',
    },
    {
      label: 'Stock bajo',
      value: lowStockItems.length,
      icon: '⚠️',
      href: '/dashboard/inventory',
      color: lowStockItems.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Resumen</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-xl border border-brand-100 p-4 hover:border-brand-300 transition-colors ${stat.color}`}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Upcoming deliveries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">Próximas entregas</h2>
          <Link href="/dashboard/orders" className="text-xs text-brand-500 hover:text-brand-700">Ver todos →</Link>
        </div>

        {!upcomingOrders?.length ? (
          <div className="bg-white rounded-xl border border-brand-100 p-6 text-center">
            <p className="text-sm text-gray-400">Sin entregas en los próximos 2 días 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingOrders.map((order) => {
              const status = order.status ?? 'pending'
              const pending = order.total - (order.deposit ?? 0)
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="bg-white rounded-xl border border-brand-100 p-3 flex items-center justify-between hover:border-brand-300 transition-colors block"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-brand-600">
                        {dayLabel(order.delivery_date, today, tomorrow)}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABEL[status] ?? status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">
                      {(order.customers as any)?.name ?? '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">${order.total.toLocaleString('es-CO')}</p>
                    {pending > 0 && (
                      <p className="text-xs text-brand-500">Falta ${pending.toLocaleString('es-CO')}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Pending payments */}
      {unpaidOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">💰 Pendiente por cobrar</h2>
            <Link href="/dashboard/orders" className="text-xs text-brand-500 hover:text-brand-700">Ver pedidos →</Link>
          </div>
          <div className="bg-white rounded-xl border border-brand-100 divide-y divide-gray-50">
            {unpaidOrders.map((order) => {
              const pending = order.total - (order.deposit ?? 0)
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-brand-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{(order.customers as any)?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Entrega: {new Date(order.delivery_date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-600">${pending.toLocaleString('es-CO')}</p>
                    {(order.deposit ?? 0) > 0 && (
                      <p className="text-xs text-gray-400">adelanto ${(order.deposit ?? 0).toLocaleString('es-CO')}</p>
                    )}
                  </div>
                </Link>
              )
            })}
            <div className="flex justify-between items-center px-4 py-2.5 bg-brand-50 rounded-b-xl">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total por cobrar</span>
              <span className="text-sm font-bold text-brand-700">${Math.round(totalPending).toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Low stock */}
      {lowStockItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">⚠️ Stock bajo</h2>
            <Link href="/dashboard/inventory" className="text-xs text-brand-500 hover:text-brand-700">Ver inventario →</Link>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 space-y-2">
            {lowStockItems.map((m) => (
              <div key={m.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{m.name}</span>
                <span className="text-yellow-700 font-medium">
                  {m.current_stock ?? 0} / {m.min_stock} {m.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/orders/new"
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-3 rounded-xl text-center transition-colors">
            + Nuevo pedido
          </Link>
          <Link href="/dashboard/invoices/new"
            className="bg-white hover:bg-brand-50 text-brand-600 text-sm font-medium px-4 py-3 rounded-xl text-center border border-brand-200 transition-colors">
            + Nueva factura
          </Link>
        </div>
      </div>
    </div>
  )
}
