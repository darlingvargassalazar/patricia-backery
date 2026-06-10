'use client'

import { useState } from 'react'
import Link from 'next/link'
import { type RecipeIngredient } from './actions'

type RawMaterial = { id: string; name: string; unit: string }
type LastPrice = { unit: string; unit_price: number }

type IngredientRow = {
  _key: number
  product_id: string | null
  name: string
  quantity: number
  unit: string
  ref_qty: number
  ref_unit: string
  ref_price: number
  unit_price: number
  subtotal: number
}

export type RecipeInitialData = {
  name: string
  notes: string
  portions: number
  labor_pct: number
  overhead_pct: number
  ingredients: Array<{
    product_id: string | null
    name: string
    quantity: number
    unit: string
    unit_price: number
    subtotal: number
  }>
}

export type SavePayload = {
  name: string
  notes: string
  portions: number
  labor_pct: number
  overhead_pct: number
  ingredient_cost: number
  total_cost: number
  ingredients: RecipeIngredient[]
}

const RECIPE_UNITS = ['g', 'ml', 'unidades', 'tazas', 'cdas', 'cdtas']
const REF_UNITS = ['kg', 'lt', 'g', 'ml', 'unidades', 'tazas', 'cdas', 'cdtas']

function refInRecipeUnit(refQty: number, refUnit: string, recipeUnit: string): number {
  if (refUnit === 'kg' && recipeUnit === 'g') return refQty * 1000
  if (refUnit === 'lt' && recipeUnit === 'ml') return refQty * 1000
  return refQty
}

function computeUnitPrice(refQty: number, refUnit: string, refPrice: number, recipeUnit: string): number {
  const base = refInRecipeUnit(refQty, refUnit, recipeUnit)
  return base ? refPrice / base : 0
}

function toRecipeUnit(purchaseUnit: string): string {
  if (purchaseUnit === 'kg') return 'g'
  if (purchaseUnit === 'lt') return 'ml'
  return purchaseUnit
}

// Convierte unit_price guardado ($/recipeUnit) a campos ref para mostrar en el form
function toRefDisplay(unit: string, unitPrice: number) {
  if (unit === 'g') return { ref_qty: 1, ref_unit: 'kg', ref_price: unitPrice * 1000 }
  if (unit === 'ml') return { ref_qty: 1, ref_unit: 'lt', ref_price: unitPrice * 1000 }
  return { ref_qty: 1, ref_unit: unit, ref_price: unitPrice }
}

function fmt(n: number) { return Math.round(n).toLocaleString('es-CO') }
function fmtDec(n: number) { return n < 1 ? n.toFixed(4) : n.toFixed(2) }

let keyCounter = 100

function emptyRow(key: number): IngredientRow {
  return { _key: key, product_id: null, name: '', quantity: 0, unit: 'g', ref_qty: 1, ref_unit: 'kg', ref_price: 0, unit_price: 0, subtotal: 0 }
}

function fromInitial(items: RecipeInitialData['ingredients']): IngredientRow[] {
  return items.map((i, idx) => {
    const ref = toRefDisplay(i.unit, i.unit_price)
    return { _key: idx, product_id: i.product_id, name: i.name, quantity: i.quantity, unit: i.unit, unit_price: i.unit_price, subtotal: i.subtotal, ...ref }
  })
}

export default function RecipeForm({
  rawMaterials,
  lastPriceMap,
  initialData,
  title,
  onSave,
}: {
  rawMaterials: RawMaterial[]
  lastPriceMap: Record<string, LastPrice>
  initialData?: RecipeInitialData
  title: string
  onSave: (payload: SavePayload) => Promise<void>
}) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [portions, setPortions] = useState(initialData?.portions ?? 1)
  const [laborPct, setLaborPct] = useState(initialData?.labor_pct ?? 30)
  const [overheadPct, setOverheadPct] = useState(initialData?.overhead_pct ?? 30)
  const [loading, setLoading] = useState(false)
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialData?.ingredients.length ? fromInitial(initialData.ingredients) : [emptyRow(0)]
  )

  function addIngredient() {
    setIngredients((prev) => [...prev, emptyRow(keyCounter++)])
  }

  function removeIngredient(key: number) {
    setIngredients((prev) => prev.filter((i) => i._key !== key))
  }

  function updateIngredient(key: number, patch: Partial<IngredientRow>) {
    setIngredients((prev) =>
      prev.map((i) => {
        if (i._key !== key) return i
        const next = { ...i, ...patch }
        next.unit_price = computeUnitPrice(next.ref_qty, next.ref_unit, next.ref_price, next.unit)
        next.subtotal = next.quantity * next.unit_price
        return next
      })
    )
  }

  function handleMaterialSelect(key: number, productId: string) {
    if (!productId) {
      setIngredients((prev) => prev.map((i) => i._key === key ? { ...emptyRow(key), _key: key } : i))
      return
    }
    const mat = rawMaterials.find((m) => m.id === productId)
    if (!mat) return
    const lastPrice = lastPriceMap[productId]
    const recipeUnit = toRecipeUnit(mat.unit)
    const refUnit = lastPrice?.unit ?? mat.unit
    const refPrice = lastPrice?.unit_price ?? 0
    const unit_price = computeUnitPrice(1, refUnit, refPrice, recipeUnit)
    setIngredients((prev) =>
      prev.map((i) => {
        if (i._key !== key) return i
        return { ...i, product_id: mat.id, name: mat.name, unit: recipeUnit, ref_qty: 1, ref_unit: refUnit, ref_price: refPrice, unit_price, subtotal: i.quantity * unit_price }
      })
    )
  }

  const directCost = ingredients.reduce((s, i) => s + i.subtotal, 0)
  const laborCost = directCost * (laborPct / 100)
  const overheadCost = directCost * (overheadPct / 100)
  const totalCost = directCost + laborCost + overheadCost
  const costPerPortion = portions > 1 ? totalCost / portions : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSave({
      name, notes, portions,
      labor_pct: laborPct,
      overhead_pct: overheadPct,
      ingredient_cost: directCost,
      total_cost: totalCost,
      ingredients: ingredients.map(({ product_id, name, quantity, unit, unit_price, subtotal }) => ({
        product_id, name, quantity, unit, unit_price, subtotal,
      })),
    })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/recipes" className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</Link>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nombre del producto</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="Ej: Torta de chocolate, Galletas de avena..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Porciones / unidades que produce</label>
            <input type="number" min="1" value={portions} onChange={(e) => setPortions(Number(e.target.value))}
              className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notas (opcional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Observaciones, variaciones..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-100 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Costo directo — ingredientes</h2>
            <button type="button" onClick={addIngredient} className="text-xs text-brand-600 hover:text-brand-800 font-medium border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors">
              + Agregar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-gray-100 bg-brand-50/60">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingrediente</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Precio referencia</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cantidad</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Subtotal</th>
                  <th className="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ingredients.map((ing) => {
                  const hasPrice = ing.ref_qty > 0 && ing.ref_price > 0
                  return (
                    <tr key={ing._key} className="align-top">
                      {/* Ingrediente */}
                      <td className="px-4 py-2">
                        <select value={ing.product_id ?? ''} onChange={(e) => handleMaterialSelect(ing._key, e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                          <option value="">— Otro —</option>
                          {rawMaterials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        {!ing.product_id && (
                          <input placeholder="Nombre" value={ing.name} required
                            onChange={(e) => updateIngredient(ing._key, { name: e.target.value })}
                            className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                        )}
                      </td>

                      {/* Precio de referencia */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          <input type="number" min="0.001" step="0.5" value={ing.ref_qty || ''}
                            onChange={(e) => updateIngredient(ing._key, { ref_qty: Number(e.target.value) })}
                            className="w-12 px-1.5 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-400" />
                          <select value={ing.ref_unit} onChange={(e) => updateIngredient(ing._key, { ref_unit: e.target.value })}
                            className="px-1.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                            {REF_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <span className="text-xs text-gray-400">$</span>
                          <input type="number" min="0" step="100" value={ing.ref_price || ''}
                            onChange={(e) => updateIngredient(ing._key, { ref_price: Number(e.target.value) })}
                            className="w-20 px-1.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                        </div>
                        {hasPrice && (
                          <p className="text-xs text-brand-600 mt-1">${fmtDec(ing.unit_price)}/{ing.unit}</p>
                        )}
                      </td>

                      {/* Cantidad en receta */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <input type="number" min="0" step="1" value={ing.quantity || ''} required
                            onChange={(e) => updateIngredient(ing._key, { quantity: Number(e.target.value) })}
                            className="w-16 px-1.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                          {ing.product_id ? (
                            <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-1.5 rounded-lg">{ing.unit}</span>
                          ) : (
                            <select value={ing.unit} onChange={(e) => updateIngredient(ing._key, { unit: e.target.value })}
                              className="px-1.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                              {RECIPE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td className="px-4 py-2 text-right">
                        {ing.quantity > 0 && hasPrice ? (
                          <span className="font-semibold text-brand-700">${fmt(ing.subtotal)}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Eliminar */}
                      <td className="px-2 py-2 text-center">
                        {ingredients.length > 1 && (
                          <button type="button" onClick={() => removeIngredient(ing._key)}
                            className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {ingredients.some(i => i.subtotal > 0) && (
                <tfoot>
                  <tr className="border-t border-brand-100 bg-brand-50/40">
                    <td colSpan={3} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Total ingredientes</td>
                    <td className="px-4 py-2 text-right font-bold text-gray-700">${fmt(directCost)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Resumen de costos</h2>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Costo directo (ingredientes)</span>
            <span className="font-medium text-gray-800">${fmt(directCost)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Mano de obra</span>
              <input type="number" min="0" max="200" step="1" value={laborPct}
                onChange={(e) => setLaborPct(Number(e.target.value))}
                className="w-14 px-2 py-1 border border-brand-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <span className="text-gray-400 text-xs">%</span>
            </div>
            <span className="font-medium text-gray-800">${fmt(laborCost)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Costo indirecto</span>
              <input type="number" min="0" max="200" step="1" value={overheadPct}
                onChange={(e) => setOverheadPct(Number(e.target.value))}
                className="w-14 px-2 py-1 border border-brand-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <span className="text-gray-400 text-xs">%</span>
            </div>
            <span className="font-medium text-gray-800">${fmt(overheadCost)}</span>
          </div>

          <div className="border-t border-brand-100 pt-3 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Costo total</span>
            <span className="font-bold text-brand-700 text-xl">${fmt(totalCost)}</span>
          </div>

          {costPerPortion && (
            <div className="flex justify-between text-sm bg-brand-50 rounded-lg px-3 py-2">
              <span className="text-gray-600">Costo por porción ({portions} porciones)</span>
              <span className="font-semibold text-brand-700">${fmt(costPerPortion)}</span>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || !name.trim() || ingredients.every((i) => !i.name)}
          className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors">
          {loading ? 'Guardando...' : 'Guardar costeo'}
        </button>
      </form>
    </div>
  )
}
