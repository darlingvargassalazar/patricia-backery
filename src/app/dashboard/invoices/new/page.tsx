import { createClient } from '@/lib/supabase/server'
import InvoiceForm from './InvoiceForm'

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: { order_id?: string }
}) {
  const supabase = createClient()

  const { data: ordersRaw } = await supabase
    .from('orders')
    .select('id, total, customers(name), order_items(name, quantity, unit_price)')
    .not('status', 'eq', 'cancelled')
    .order('delivery_date', { ascending: false })

  const orders = (ordersRaw ?? []).map((o) => ({
    id: o.id,
    customer_name: (o.customers as any)?.name ?? '',
    total: o.total,
    items: ((o.order_items as any[]) ?? []).map((i) => ({
      description: i.name,
      quantity: i.quantity,
      unit_price: i.unit_price,
    })),
  }))

  const preselected = searchParams.order_id
    ? orders.find((o) => o.id === searchParams.order_id) ?? null
    : null

  return <InvoiceForm orders={orders} preselectedOrder={preselected} />
}
