import { createClient } from '@/lib/supabase/server'
import { getMyCompanyId } from '@/lib/company'
import OrderForm from '../OrderForm'

export default async function NewOrderPage() {
  const supabase = createClient()
  const companyId = await getMyCompanyId()

  const [{ data: products }, { data: customers }] = await Promise.all([
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

  return <OrderForm products={products ?? []} customers={customers ?? []} />
}
