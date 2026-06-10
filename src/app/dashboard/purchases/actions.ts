'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type PurchaseItem = {
  product_id: string | null
  name: string
  quantity: number
  unit: string
  unit_price: number
}

export async function createPurchase(data: {
  supplier_name: string
  purchase_date: string
  notes: string
  items: PurchaseItem[]
}) {
  const supabase = createClient()

  const total = data.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)

  const { data: purchase } = await supabase
    .from('purchases')
    .insert({
      supplier_name: data.supplier_name.trim() || null,
      purchase_date: data.purchase_date,
      total,
      notes: data.notes.trim() || null,
    })
    .select('id')
    .single()

  await supabase.from('purchase_items').insert(
    data.items.map((item) => ({
      purchase_id: purchase!.id,
      product_id: item.product_id || null,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
    }))
  )

  for (const item of data.items) {
    if (item.product_id) {
      await supabase.rpc('increment_stock', {
        row_id: item.product_id,
        delta: item.quantity,
      })
    }
  }

  redirect('/dashboard/purchases')
}
