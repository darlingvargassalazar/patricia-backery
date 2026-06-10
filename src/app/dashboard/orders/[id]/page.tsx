import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateOrderStatus, toggleOrderGift } from '../actions'

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

const NEXT_ACTIONS: Record<string, { label: string; value: string }[]> = {
  pending: [{ label: '🔧 Marcar en preparación', value: 'preparing' }],
  preparing: [{ label: '✅ Marcar listo', value: 'ready' }],
  ready: [{ label: '📦 Marcar entregado', value: 'delivered' }],
  delivered: [],
  cancelled: [],
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*, customers(name), order_items(*)')
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const status = order.status ?? 'pending'
  const deposit = order.deposit ?? 0
  const pending = order.total - deposit

  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <Link href="/dashboard/orders" className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-1">←</Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">{(order.customers as any)?.name}</h1>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[status] ?? 'bg-gray-100'}`}>
              {STATUS_LABEL[status] ?? status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Entrega: {new Date(order.delivery_date + 'T12:00:00').toLocaleDateString('es-CO', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-100 p-4 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Productos</h2>
        <div className="space-y-2">
          {(order.order_items as any[]).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
              <span className="text-gray-600 font-medium">${(item.unit_price * item.quantity).toLocaleString('es-CO')}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold text-sm">
          <span>Total</span>
          <span>${order.total.toLocaleString('es-CO')}</span>
        </div>
      </div>

      {order.is_gift ? (
        <div className="bg-pink-50 rounded-xl border border-pink-200 p-4 mb-4 flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <p className="text-sm font-semibold text-pink-700">Pedido obsequio</p>
            <p className="text-xs text-pink-500 mt-0.5">Este pedido es gratuito</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-100 p-4 mb-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Pago</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Adelanto recibido</span>
              <span className="text-green-600 font-medium">${deposit.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Por cobrar</span>
              <span className={`font-semibold ${pending > 0 ? 'text-brand-600' : 'text-green-600'}`}>
                ${pending.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>
      )}

      {order.notes && (
        <div className="bg-white rounded-xl border border-brand-100 p-4 mb-4">
          <h2 className="text-sm font-medium text-gray-700 mb-1">Notas</h2>
          <p className="text-sm text-gray-600">{order.notes}</p>
        </div>
      )}

      <div className="space-y-2 mt-6">
        {NEXT_ACTIONS[status]?.map((action) => (
          <form key={action.value} action={updateOrderStatus.bind(null, order.id, action.value)}>
            <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition-colors">
              {action.label}
            </button>
          </form>
        ))}

        <form action={toggleOrderGift.bind(null, order.id, !order.is_gift)}>
          <button type="submit" className={`w-full text-sm font-medium py-2.5 rounded-xl border transition-colors ${order.is_gift ? 'bg-white hover:bg-pink-50 text-pink-500 border-pink-200' : 'bg-white hover:bg-pink-50 text-gray-500 border-gray-200'}`}>
            {order.is_gift ? '↩ Quitar obsequio' : '🎁 Marcar como obsequio (gratis)'}
          </button>
        </form>

        {status !== 'cancelled' && status !== 'delivered' && (
          <form action={updateOrderStatus.bind(null, order.id, 'cancelled')}>
            <button type="submit" className="w-full bg-white hover:bg-red-50 text-red-400 text-sm font-medium py-2.5 rounded-xl border border-red-200 transition-colors">
              Cancelar pedido
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
