'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type InvoiceItem = {
  description: string
  quantity: number
  unit_price: number
}

export async function createInvoice(data: {
  customer_name: string
  customer_id_number: string
  order_id: string | null
  issue_date: string
  notes: string
  items: InvoiceItem[]
}) {
  const supabase = createClient()

  const total = data.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)

  const { data: invoice } = await supabase
    .from('invoices')
    .insert({
      customer_name: data.customer_name.trim(),
      customer_id_number: data.customer_id_number.trim() || null,
      order_id: data.order_id || null,
      issue_date: data.issue_date,
      total,
      notes: data.notes.trim() || null,
    })
    .select('id')
    .single()

  await supabase.from('invoice_items').insert(
    data.items.map((item) => ({
      invoice_id: invoice!.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
  )

  redirect(`/dashboard/invoices/${invoice!.id}`)
}
