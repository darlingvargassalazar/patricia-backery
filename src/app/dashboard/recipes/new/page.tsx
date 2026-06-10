import { createClient } from '@/lib/supabase/server'
import RecipeForm from '../RecipeForm'
import { createRecipe } from '../actions'

export default async function NewRecipePage() {
  const supabase = createClient()

  const [{ data: rawMaterials }, { data: purchaseItems }] = await Promise.all([
    supabase.from('products').select('id, name, unit').eq('type', 'raw_material').order('name'),
    supabase.from('purchase_items').select('product_id, unit, unit_price, purchases!inner(purchase_date)').not('product_id', 'is', null),
  ])

  const sorted = [...(purchaseItems ?? [])].sort((a, b) =>
    ((b.purchases as any).purchase_date as string).localeCompare((a.purchases as any).purchase_date as string)
  )
  const lastPriceMap: Record<string, { unit: string; unit_price: number }> = {}
  for (const item of sorted) {
    if (item.product_id && !lastPriceMap[item.product_id])
      lastPriceMap[item.product_id] = { unit: item.unit, unit_price: item.unit_price }
  }

  return (
    <RecipeForm
      rawMaterials={rawMaterials ?? []}
      lastPriceMap={lastPriceMap}
      title="Nuevo costeo"
      onSave={createRecipe}
    />
  )
}
