'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createOrder, type OrderItem } from '../actions'

type Product = { id: string; name: string; price: number }

function ProductCombobox({
  value,
  products,
  onChange,
}: {
  value: string
  products: Product[]
  onChange: (name: string, price?: number) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = value.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(value.toLowerCase()))
    : products

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative col-span-6">
      <input
        placeholder="Ej: Torta de chocolate"
        value={value}
        required
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto">
          {filtered.map((p) => (
            <li
              key={p.id}
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(p.name, p.price)
                setOpen(false)
              }}
              className="flex justify-between items-center px-3 py-2 text-sm cursor-pointer hover:bg-brand-50"
            >
              <span>{p.name}</span>
              <span className="text-xs text-gray-400">${p.price.toLocaleString('es-CO')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function NewOrderForm({ products }: { products: Product[] }) {
  const [items, setItems] = useState<OrderItem[]>([{ name: '', quantity: 1, unit_price: 0 }])
  const [isGift, setIsGift] = useState(false)
  const [loading, setLoading] = useState(false)

  const total = isGift ? 0 : items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

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

  function selectProduct(index: number, name: string, price?: number) {
    const updated = [...items]
    updated[index] = {
      ...updated[index],
      name,
      ...(price !== undefined ? { unit_price: price } : {}),
    }
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
      is_gift: isGift,
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
              <ProductCombobox
                value={item.name}
                products={products}
                onChange={(name, price) => selectProduct(index, name, price)}
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

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setIsGift(!isGift)}
              className={`relative w-10 h-6 rounded-full transition-colors ${isGift ? 'bg-brand-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isGift ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-gray-700">
              Obsequio <span className="text-gray-400 font-normal">(pedido gratuito)</span>
            </span>
          </label>

          <div className={`grid gap-3 ${isGift ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha de entrega</label>
              <input
                name="delivery_date"
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            {!isGift && (
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
            )}
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

        <div className={`rounded-xl border p-4 flex justify-between items-center ${isGift ? 'bg-pink-50 border-pink-200' : 'bg-brand-50 border-brand-200'}`}>
          <span className="font-medium text-gray-700">Total</span>
          {isGift
            ? <span className="text-xl font-bold text-pink-500">Gratis 🎁</span>
            : <span className="text-xl font-bold text-brand-700">${total.toLocaleString('es-CO')}</span>
          }
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
