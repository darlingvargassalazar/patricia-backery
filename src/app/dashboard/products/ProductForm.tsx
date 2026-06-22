'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createProduct, updateProduct } from './actions'

const UNITS = ['kg', 'g', 'lt', 'ml', 'unidades', 'tazas', 'cdas', 'cdtas']

export type ProductFormInitialData = {
  id?: string
  name: string
  type: string
  price: number
  current_stock: number
  unit: string | null
  min_stock: number
  image_url: string | null
}

export default function ProductForm({ initial }: { initial: ProductFormInitialData }) {
  const isEdit = !!initial.id
  const isRaw = initial.type === 'raw_material'
  const backHref = isRaw ? '/dashboard/inventory' : '/dashboard/products'

  const [name, setName] = useState(initial.name)
  const [price, setPrice] = useState(initial.price)
  const [currentStock, setCurrentStock] = useState(initial.current_stock)
  const [unit, setUnit] = useState(initial.unit ?? 'kg')
  const [minStock, setMinStock] = useState(initial.min_stock)
  const [imageUrl, setImageUrl] = useState<string | null>(initial.image_url)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `product_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setImageUrl(data.publicUrl)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      name,
      type: initial.type,
      price: isRaw ? 0 : price,
      current_stock: currentStock,
      unit: isRaw ? unit : null,
      min_stock: isRaw ? minStock : 0,
      image_url: imageUrl,
    }
    if (isEdit) {
      await updateProduct(initial.id!, payload)
    } else {
      await createProduct(payload)
    }
  }

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Link href={backHref} className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</Link>
        <h1 className="text-xl font-bold text-gray-800">
          {isEdit
            ? isRaw ? 'Editar ingrediente' : 'Editar producto'
            : isRaw ? 'Nuevo ingrediente' : 'Nuevo producto para venta'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isRaw ? 'Ej: Harina de trigo' : 'Ej: Torta de chocolate'}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {isRaw ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock actual</label>
                  <input type="number" min="0" step="0.5" value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                  <input type="number" min="0" step="0.5" value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                <input type="number" min="0" step="500" required value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" min="0" value={currentStock}
                  onChange={(e) => setCurrentStock(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>
          )}
        </div>

        {/* Foto */}
        {!isRaw && (
          <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-3">
            <h2 className="text-sm font-medium text-gray-700">Foto del producto</h2>

            {imageUrl && (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Foto" className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
                <button type="button" onClick={() => setImageUrl(null)} className="text-xs text-red-400 hover:text-red-600">
                  Quitar foto
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {imageUrl ? 'Reemplazar foto' : 'Subir foto'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
              {uploading && <p className="text-xs text-gray-400 mt-1">Subiendo foto...</p>}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
        >
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}
