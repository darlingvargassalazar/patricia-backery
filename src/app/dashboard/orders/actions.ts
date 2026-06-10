'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getMyCompanyId } from '@/lib/company'

export type OrderItem = {
  name: string
  quantity: number
  unit_price: number
}

export async function createOrder(data: {
  customer_name: string
  delivery_date: string
  deposit: number
  notes: string
  items: OrderItem[]
  is_gift: boolean
}) {
  const supabase = createClient()
  const companyId = await getMyCompanyId()

  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .ilike('name', data.customer_name.trim())
    .maybeSingle()

  let customerId: string
  if (existing) {
    customerId = existing.id
  } else {
    const { data: created } = await supabase
      .from('customers')
      .insert({ name: data.customer_name.trim(), company_id: companyId })
      .select('id')
      .single()
    customerId = created!.id
  }

  const total = data.is_gift ? 0 : data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  const { data: order } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      delivery_date: data.delivery_date,
      deposit: data.is_gift ? 0 : (data.deposit || 0),
      total,
      notes: data.notes || null,
      is_gift: data.is_gift,
      company_id: companyId,
    })
    .select('id')
    .single()

  await supabase.from('order_items').insert(
    data.items.map((item) => ({
      order_id: order!.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
  )

  redirect(`/dashboard/orders/${order!.id}`)
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createClient()
  await supabase.from('orders').update({ status }).eq('id', orderId)
  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath('/dashboard/orders')
}

export async function toggleOrderGift(orderId: string, isGift: boolean) {
  const supabase = createClient()
  await supabase.from('orders').update({
    is_gift: isGift,
    total: isGift ? 0 : undefined,
    deposit: isGift ? 0 : undefined,
  }).eq('id', orderId)
  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath('/dashboard/orders')
}
