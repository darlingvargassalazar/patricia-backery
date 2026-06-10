import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RecipeForm from '../../RecipeForm'
import { updateRecipe } from '../../actions'

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: recipe }, { data: rawMaterials }, { data: purchaseItems }] = await Promise.all([
    supabase.from('recipes').select('*, recipe_ingredients(*)').eq('id', params.id).single(),
    supabase.from('products').select('id, name, unit').eq('type', 'raw_material').order('name'),
    supabase.from('purchase_items').select('product_id, unit, unit_price, purchases!inner(purchase_date)').not('product_id', 'is', null),
  ])

  if (!recipe) notFound()

  const sorted = [...(purchaseItems ?? [])].sort((a, b) =>
    ((b.purchases as any).purchase_date as string).localeCompare((a.purchases as any).purchase_date as string)
  )
  const lastPriceMap: Record<string, { unit: string; unit_price: number }> = {}
  for (const item of sorted) {
    if (item.product_id && !lastPriceMap[item.product_id])
      lastPriceMap[item.product_id] = { unit: item.unit, unit_price: item.unit_price }
  }

  const initialData = {
    name: recipe.name,
    notes: recipe.notes ?? '',
    portions: recipe.portions,
    labor_pct: recipe.labor_pct,
    overhead_pct: recipe.overhead_pct,
    ingredients: (recipe.recipe_ingredients as any[]).map((i) => ({
      product_id: i.product_id,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      unit_price: i.unit_price,
      subtotal: i.subtotal,
    })),
  }

  return (
    <RecipeForm
      rawMaterials={rawMaterials ?? []}
      lastPriceMap={lastPriceMap}
      initialData={initialData}
      title={`Editar — ${recipe.name}`}
      onSave={(payload) => updateRecipe(params.id, payload)}
    />
  )
}
