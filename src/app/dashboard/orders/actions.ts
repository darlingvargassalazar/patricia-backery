'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getMyCompanyId, getMyProfile } from '@/lib/company'
import { sendOrderConfirmationEmail } from '@/lib/email'

export type OrderItem = {
  name: string
  quantity: number
  unit_price: number
}

type OrderPayload = {
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_date: string
  deposit: number
  notes: string
  items: OrderItem[]
  is_gift: boolean
}

async function upsertCustomer(
  supabase: ReturnType<typeof createClient>,
  companyId: string,
  name: string,
  email: string,
  phone: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .ilike('name', name.trim())
    .eq('company_id', companyId)
    .maybeSingle()

  if (existing) {
    await supabase.from('customers').update({
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    }).eq('id', existing.id)
    return existing.id
  }

  const { data: created } = await supabase
    .from('customers')
    .insert({
      name: name.trim(),
      email: email || null,
      phone: phone || null,
      company_id: companyId,
    })
    .select('id')
    .single()
  return created!.id
}

export async function createOrder(data: OrderPayload) {
  const supabase = createClient()
  const profile = await getMyProfile()
  const companyId = profile?.company_id
  if (!companyId) throw new Error('Sin empresa')

  const customerId = await upsertCustomer(supabase, companyId, data.customer_name, data.customer_email, data.customer_phone)

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

  // Enviar correo de confirmación si el cliente tiene email y la empresa tiene config
  if (data.customer_email && profile?.companies?.email_api_key && profile.companies.email_from) {
    try {
      await sendOrderConfirmationEmail(
        {
          to: data.customer_email,
          customerName: data.customer_name,
          deliveryDate: data.delivery_date,
          items: data.items,
          total,
          deposit: data.is_gift ? 0 : (data.deposit || 0),
          isGift: data.is_gift,
        },
        {
          apiKey: profile.companies.email_api_key,
          from: profile.companies.email_from,
          fromName: profile.companies.email_from_name,
        }
      )
    } catch (err) {
      console.error('[email] Error enviando confirmación:', err)
    }
  }

  redirect(`/dashboard/orders/${order!.id}`)
}

export async function updateOrder(orderId: string, data: OrderPayload) {
  const supabase = createClient()
  const companyId = await getMyCompanyId()
  if (!companyId) throw new Error('Sin empresa')

  const customerId = await upsertCustomer(supabase, companyId, data.customer_name, data.customer_email, data.customer_phone)

  const total = data.is_gift ? 0 : data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  await supabase.from('orders').update({
    customer_id: customerId,
    delivery_date: data.delivery_date,
    deposit: data.is_gift ? 0 : (data.deposit || 0),
    total,
    notes: data.notes || null,
    is_gift: data.is_gift,
  }).eq('id', orderId)

  await supabase.from('order_items').delete().eq('order_id', orderId)
  await supabase.from('order_items').insert(
    data.items.map((item) => ({
      order_id: orderId,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
  )

  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath('/dashboard/orders')
  redirect(`/dashboard/orders/${orderId}`)
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

export async function resendOrderEmail(orderId: string): Promise<{ ok: boolean; message: string }> {
  const supabase = createClient()
  const profile = await getMyProfile()

  if (!profile?.companies?.email_api_key || !profile.companies.email_from) {
    return { ok: false, message: 'Configura el correo en Ajustes antes de enviar.' }
  }

  const { data: order } = await supabase
    .from('orders')
    .select('*, customers(name, email), order_items(*)')
    .eq('id', orderId)
    .single()

  if (!order) return { ok: false, message: 'Pedido no encontrado.' }

  const customer = order.customers as any
  if (!customer?.email) return { ok: false, message: 'El cliente no tiene correo registrado.' }

  const deposit = order.deposit ?? 0
  const total = order.total ?? 0

  try {
    await sendOrderConfirmationEmail(
      {
        to: customer.email,
        customerName: customer.name,
        deliveryDate: order.delivery_date,
        items: (order.order_items as any[]).map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        total,
        deposit,
        isGift: order.is_gift ?? false,
      },
      {
        apiKey: profile.companies.email_api_key,
        from: profile.companies.email_from,
        fromName: profile.companies.email_from_name,
      }
    )
    return { ok: true, message: `Correo enviado a ${customer.email}` }
  } catch (err: any) {
    const detail = err?.message ?? JSON.stringify(err)
    console.error('[resendOrderEmail]', detail)
    return { ok: false, message: `Error de Resend: ${detail}` }
  }
}

export async function markOrderPaid(orderId: string) {
  const supabase = createClient()
  const { data: order } = await supabase.from('orders').select('total').eq('id', orderId).single()
  await supabase.from('orders').update({ deposit: order!.total }).eq('id', orderId)
  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath('/dashboard/orders')
}
