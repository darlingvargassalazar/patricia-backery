import { createClient } from '@/lib/supabase/server'
import NewOrderForm from './NewOrderForm'

export default async function NewOrderPage() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price')
    .eq('type', 'sale')
    .eq('active', true)
    .order('name')

  return <NewOrderForm products={products ?? []} />
}
