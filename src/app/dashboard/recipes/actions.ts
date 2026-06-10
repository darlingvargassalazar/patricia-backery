'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMyCompanyId } from '@/lib/company'

export type RecipeIngredient = {
  product_id: string | null
  name: string
  quantity: number
  unit: string
  unit_price: number
  subtotal: number
}

export async function createRecipe(data: {
  name: string
  notes: string
  portions: number
  labor_pct: number
  overhead_pct: number
  ingredient_cost: number
  total_cost: number
  ingredients: RecipeIngredient[]
}) {
  const supabase = createClient()
  const companyId = await getMyCompanyId()

  const { data: recipe } = await supabase
    .from('recipes')
    .insert({
      name: data.name.trim(),
      company_id: companyId,
      notes: data.notes?.trim() || null,
      portions: data.portions,
      ingredient_cost: data.ingredient_cost,
      labor_pct: data.labor_pct,
      overhead_pct: data.overhead_pct,
      total_cost: data.total_cost,
    })
    .select('id')
    .single()

  await supabase.from('recipe_ingredients').insert(
    data.ingredients.map((i) => ({
      recipe_id: recipe!.id,
      product_id: i.product_id || null,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      unit_price: i.unit_price,
      subtotal: i.subtotal,
    }))
  )

  redirect('/dashboard/recipes')
}

export async function updateRecipe(id: string, data: {
  name: string
  notes: string
  portions: number
  labor_pct: number
  overhead_pct: number
  ingredient_cost: number
  total_cost: number
  ingredients: RecipeIngredient[]
}) {
  const supabase = createClient()

  await supabase.from('recipes').update({
    name: data.name.trim(),
    notes: data.notes?.trim() || null,
    portions: data.portions,
    ingredient_cost: data.ingredient_cost,
    labor_pct: data.labor_pct,
    overhead_pct: data.overhead_pct,
    total_cost: data.total_cost,
  }).eq('id', id)

  await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)
  await supabase.from('recipe_ingredients').insert(
    data.ingredients.map((i) => ({
      recipe_id: id,
      product_id: i.product_id || null,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      unit_price: i.unit_price,
      subtotal: i.subtotal,
    }))
  )

  redirect('/dashboard/recipes')
}
