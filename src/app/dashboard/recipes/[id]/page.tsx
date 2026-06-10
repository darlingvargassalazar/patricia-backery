import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

function fmt(n: number) {
  return Math.round(n).toLocaleString('es-CO')
}

export default async function RecipeDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: recipe } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(*)')
    .eq('id', params.id)
    .single()

  if (!recipe) notFound()

  const ingredients = recipe.recipe_ingredients as any[]
  const laborCost = recipe.ingredient_cost * (recipe.labor_pct / 100)
  const overheadCost = recipe.ingredient_cost * (recipe.overhead_pct / 100)
  const costPerPortion = recipe.portions > 1 ? recipe.total_cost / recipe.portions : null

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/recipes" className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</Link>
        <h1 className="text-xl font-bold text-gray-800">{recipe.name}</h1>
      </div>

      {recipe.notes && (
        <p className="text-sm text-gray-500 bg-white rounded-xl border border-brand-100 px-4 py-3">{recipe.notes}</p>
      )}

      {/* Ingredients */}
      <div className="bg-white rounded-xl border border-brand-100 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Ingredientes
          <span className="ml-2 text-xs text-gray-400 font-normal">
            {recipe.portions > 1 ? `para ${recipe.portions} porciones` : 'para 1 unidad'}
          </span>
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs text-gray-400 pb-2 font-medium">Ingrediente</th>
              <th className="text-right text-xs text-gray-400 pb-2 font-medium">Cantidad</th>
              <th className="text-right text-xs text-gray-400 pb-2 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ingredients.map((ing: any) => (
              <tr key={ing.id}>
                <td className="py-2 text-gray-700">{ing.name}</td>
                <td className="py-2 text-right text-gray-500">{ing.quantity} {ing.unit}</td>
                <td className="py-2 text-right font-medium text-gray-700">${fmt(ing.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cost breakdown */}
      <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-2.5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Desglose de costos</h2>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Costo directo</span>
          <span className="font-medium text-gray-800">${fmt(recipe.ingredient_cost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Mano de obra ({recipe.labor_pct}%)</span>
          <span className="font-medium text-gray-800">${fmt(laborCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Costo indirecto ({recipe.overhead_pct}%)</span>
          <span className="font-medium text-gray-800">${fmt(overheadCost)}</span>
        </div>

        <div className="border-t border-brand-100 pt-2.5 flex justify-between">
          <span className="font-semibold text-gray-800">Costo total</span>
          <span className="font-bold text-brand-700 text-xl">${fmt(recipe.total_cost)}</span>
        </div>

        {costPerPortion && (
          <div className="flex justify-between text-sm bg-brand-50 rounded-lg px-3 py-2 mt-1">
            <span className="text-gray-600">Costo por porción</span>
            <span className="font-semibold text-brand-700">${fmt(costPerPortion)}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-center text-gray-400">
        Creado el {new Date(recipe.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  )
}
