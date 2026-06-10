'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createInvoice, type InvoiceItem } from '../actions'

type OrderOption = { id: string; customer_name: string; total: number; items: { description: string; quantity: number; unit_price: number }[] }

type ItemRow = InvoiceItem & { _key: number }

export default function InvoiceForm({
  orders,
  preselectedOrder,
}: {
  orders: OrderOption[]
  preselectedOrder: OrderOption | null
}) {
  const [items, setItems] = useState<ItemRow[]>(
    preselectedOrder
      ? preselectedOrder.items.map((i, idx) => ({ ...i, _key: idx }))
      : [{ _key: 0, description: '', quantity: 1, unit_price: 0 }]
  )
  const [customerName, setCustomerName] = useState(preselectedOrder?.customer_name ?? '')
  const [loading, setLoading] = useState(false)
  let keyCounter = items.length

  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)

  function handleOrderSelect(orderId: string) {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    setCustomerName(order.customer_name)
    setItems(order.items.map((i, idx) => ({ ...i, _key: idx })))
  }

  function addItem() {
    setItems((prev) => [...prev, { _key: keyCounter++, description: '', quantity: 1, unit_price: 0 }])
  }

  function removeItem(key: number) {
    setItems((prev) => prev.filter((i) => i._key !== key))
  }

  function updateItem(key: number, patch: Partial<InvoiceItem>) {
    setItems((prev) => prev.map((i) => (i._key === key ? { ...i, ...patch } : i)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = new FormData(form)
    await createInvoice({
      customer_name: customerName,
      customer_id_number: data.get('customer_id_number') as string,
      order_id: data.get('order_id') as string | null,
      issue_date: data.get('issue_date') as string,
      notes: data.get('notes') as string,
      items,
    })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/invoices" className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</Link>
        <h1 className="text-xl font-bold text-gray-800">Nueva factura</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {orders.length > 0 && !preselectedOrder && (
          <div className="bg-brand-50 rounded-xl border border-brand-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crear desde un pedido existente <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <select
              name="order_id"
              onChange={(e) => handleOrderSelect(e.target.value)}
              className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="">— Factura manual —</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.customer_name} — ${o.total.toLocaleString('es-CO')}
                </option>
              ))}
            </select>
          </div>
        )}

        {preselectedOrder && (
          <input type="hidden" name="order_id" value={preselectedOrder.id} />
        )}

        <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Cliente</h2>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nombre</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="Nombre del cliente"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">NIT / CC <span className="text-gray-300">(opcional)</span></label>
              <input
                name="customer_id_number"
                placeholder="Ej: 123456789"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha</label>
              <input
                name="issue_date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Productos / Servicios</h2>

          <div className="grid grid-cols-12 gap-1 text-xs text-gray-400 px-1">
            <span className="col-span-6">Descripción</span>
            <span className="col-span-2 text-center">Cant.</span>
            <span className="col-span-4 text-right">Precio unit.</span>
          </div>

          {items.map((item) => (
            <div key={item._key} className="grid grid-cols-12 gap-1 items-center">
              <input
                placeholder="Descripción"
                value={item.description}
                onChange={(e) => updateItem(item._key, { description: e.target.value })}
                required
                className="col-span-6 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={item.quantity}
                onChange={(e) => updateItem(item._key, { quantity: Number(e.target.value) })}
                className="col-span-2 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <input
                type="number"
                min="0"
                step="500"
                placeholder="0"
                value={item.unit_price || ''}
                onChange={(e) => updateItem(item._key, { unit_price: Number(e.target.value) })}
                required
                className="col-span-3 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              {items.length > 1 ? (
                <button type="button" onClick={() => removeItem(item._key)} className="col-span-1 text-gray-300 hover:text-red-400 text-lg text-center">×</button>
              ) : <span className="col-span-1" />}
            </div>
          ))}

          <button type="button" onClick={addItem} className="text-sm text-brand-500 hover:text-brand-700 font-medium">
            + Agregar ítem
          </button>
        </div>

        <div className="bg-white rounded-xl border border-brand-100 p-4">
          <label className="block text-xs text-gray-500 mb-1">Notas</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Condiciones de pago, observaciones..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
          />
        </div>

        <div className="bg-brand-50 rounded-xl border border-brand-200 p-4 flex justify-between items-center">
          <span className="font-medium text-gray-700">Total</span>
          <span className="text-xl font-bold text-brand-700">${total.toLocaleString('es-CO')}</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
        >
          {loading ? 'Generando...' : 'Generar factura'}
        </button>
      </form>
    </div>
  )
}
