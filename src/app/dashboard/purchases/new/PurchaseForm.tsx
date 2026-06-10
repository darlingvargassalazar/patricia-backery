'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createPurchase, type PurchaseItem } from '../actions'

type RawMaterial = { id: string; name: string; unit: string }
type ItemRow = PurchaseItem & { _key: number }

const UNITS = ['kg', 'g', 'lt', 'ml', 'unidades', 'tazas', 'cdas', 'cdtas']

export default function PurchaseForm({ rawMaterials }: { rawMaterials: RawMaterial[] }) {
  const [items, setItems] = useState<ItemRow[]>([
    { _key: 0, product_id: null, name: '', quantity: 1, unit: 'kg', unit_price: 0 },
  ])
  const [loading, setLoading] = useState(false)
  let keyCounter = 1

  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)

  function addItem() {
    setItems((prev) => [
      ...prev,
      { _key: keyCounter++, product_id: null, name: '', quantity: 1, unit: 'kg', unit_price: 0 },
    ])
  }

  function removeItem(key: number) {
    setItems((prev) => prev.filter((i) => i._key !== key))
  }

  function updateItem(key: number, patch: Partial<PurchaseItem>) {
    setItems((prev) => prev.map((i) => (i._key === key ? { ...i, ...patch } : i)))
  }

  function handleMaterialSelect(key: number, productId: string) {
    if (!productId) {
      updateItem(key, { product_id: null, name: '', unit: 'kg' })
      return
    }
    const mat = rawMaterials.find((m) => m.id === productId)
    if (mat) updateItem(key, { product_id: mat.id, name: mat.name, unit: mat.unit })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = new FormData(e.currentTarget)
    await createPurchase({
      supplier_name: data.get('supplier_name') as string,
      purchase_date: data.get('purchase_date') as string,
      notes: data.get('notes') as string,
      items,
    })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/purchases" className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</Link>
        <h1 className="text-xl font-bold text-gray-800">Registrar compra</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Proveedor (opcional)</label>
              <input name="supplier_name" placeholder="Ej: Éxito, Makro..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha de compra</label>
              <input name="purchase_date" type="date" required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Artículos comprados</h2>
          {items.map((item) => (
            <div key={item._key} className="border border-gray-100 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <select
                  value={item.product_id ?? ''}
                  onChange={(e) => handleMaterialSelect(item._key, e.target.value)}
                  className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="">— Otro artículo —</option>
                  {rawMaterials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(item._key)}
                    className="text-gray-300 hover:text-red-400 text-xl px-1">×</button>
                )}
              </div>

              {!item.product_id && (
                <input placeholder="Nombre del artículo" value={item.name}
                  onChange={(e) => updateItem(item._key, { name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-0.5">Cantidad</label>
                  <input type="number" min="0.001" step="0.5" value={item.quantity || ''}
                    onChange={(e) => updateItem(item._key, { quantity: Number(e.target.value) })}
                    required
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-0.5">Unidad</label>
                  {item.product_id ? (
                    <div className="px-2 py-2 border border-gray-100 rounded-lg text-sm text-gray-500 bg-gray-50">{item.unit}</div>
                  ) : (
                    <select value={item.unit} onChange={(e) => updateItem(item._key, { unit: e.target.value })}
                      className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-0.5">Precio unit. ($)</label>
                  <input type="number" min="0" step="100" value={item.unit_price || ''}
                    onChange={(e) => updateItem(item._key, { unit_price: Number(e.target.value) })}
                    required
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>

              {item.quantity > 0 && item.unit_price > 0 && (
                <p className="text-xs text-right text-gray-500">
                  Subtotal: ${(item.quantity * item.unit_price).toLocaleString('es-CO')}
                </p>
              )}
            </div>
          ))}

          <button type="button" onClick={addItem} className="text-sm text-brand-500 hover:text-brand-700 font-medium">
            + Agregar artículo
          </button>
        </div>

        <div className="bg-white rounded-xl border border-brand-100 p-4">
          <label className="block text-xs text-gray-500 mb-1">Notas</label>
          <textarea name="notes" rows={2} placeholder="Factura #, observaciones..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        </div>

        <div className="bg-brand-50 rounded-xl border border-brand-200 p-4 flex justify-between items-center">
          <span className="font-medium text-gray-700">Total de la compra</span>
          <span className="text-xl font-bold text-brand-700">${total.toLocaleString('es-CO')}</span>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors">
          {loading ? 'Guardando...' : 'Guardar compra'}
        </button>
      </form>
    </div>
  )
}
