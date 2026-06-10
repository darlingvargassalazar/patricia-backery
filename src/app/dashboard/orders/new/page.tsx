'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createOrder, type OrderItem } from '../actions'

export default function NewOrderPage() {
  const [items, setItems] = useState<OrderItem[]>([{ name: '', quantity: 1, unit_price: 0 }])
  const [loading, setLoading] = useState(false)

  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  function addItem() {
    setItems([...items, { name: '', quantity: 1, unit_price: 0 }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = new FormData(form)
    await createOrder({
      customer_name: data.get('customer_name') as string,
      delivery_date: data.get('delivery_date') as string,
      deposit: Number(data.get('deposit')) || 0,
      notes: data.get('notes') as string,
      items,
    })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/orders" className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</Link>
        <h1 className="text-xl font-bold text-gray-800">Nuevo pedido</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-brand-100 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
          <input
            name="customer_name"
            required
            placeholder="Nombre del cliente"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Productos</h2>

          <div className="grid grid-cols-12 gap-1 text-xs text-gray-400 px-1">
            <span className="col-span-6">Descripción</span>
            <span className="col-span-2 text-center">Cant.</span>
            <span className="col-span-4 text-right">Precio unit.</span>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-1 items-center">
              <input
                placeholder="Ej: Torta de chocolate"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                required
                className="col-span-6 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                className="col-span-2 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <input
                type="number"
                min="0"
                step="500"
                placeholder="0"
                value={item.unit_price || ''}
                onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                required
                className="col-span-3 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="col-span-1 text-gray-300 hover:text-red-400 text-lg text-center"
                >
                  ×
                </button>
              ) : (
                <span className="col-span-1" />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="text-sm text-brand-500 hover:text-brand-700 font-medium"
          >
            + Agregar producto
          </button>
        </div>

        <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Entrega y pago</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha de entrega</label>
              <input
                name="delivery_date"
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Adelanto recibido ($)</label>
              <input
                name="deposit"
                type="number"
                min="0"
                step="500"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notas</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Sabor, decoración, indicaciones especiales..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>
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
          {loading ? 'Guardando...' : 'Guardar pedido'}
        </button>
      </form>
    </div>
  )
}
