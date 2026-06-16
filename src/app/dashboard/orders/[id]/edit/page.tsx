import { createClient } from '@/lib/supabase/server'
import { getMyCompanyId } from '@/lib/company'
import { notFound } from 'next/navigation'
import OrderForm from '../../OrderForm'

export default async function EditOrderPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const companyId = await getMyCompanyId()

  const [{ data: order }, { data: products }, { data: customers }] = await Promise.all([
    supabase
      .from('orders')
      .select('*, customers(name, email, phone), order_items(*)')
      .eq('id', params.id)
      .single(),
    supabase
      .from('products')
      .select('id, name, price')
      .eq('type', 'sale')
      .eq('active', true)
      .order('name'),
    supabase
      .from('customers')
      .select('id, name, email, phone')
      .eq('company_id', companyId!)
      .order('name'),
  ])

  if (!order) notFound()

  const customer = order.customers as any

  return (
    <OrderForm
      products={products ?? []}
      customers={customers ?? []}
      orderId={params.id}
      initialData={{
        customer_name: customer?.name ?? '',
        customer_email: customer?.email ?? '',
        customer_phone: customer?.phone ?? '',
        delivery_date: order.delivery_date,
        deposit: order.deposit ?? 0,
        notes: order.notes ?? '',
        items: (order.order_items as any[]).map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        is_gift: order.is_gift ?? false,
      }}
    />
  )
}
