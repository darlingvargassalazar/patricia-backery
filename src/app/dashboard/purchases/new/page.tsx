import { createClient } from '@/lib/supabase/server'
import PurchaseForm from './PurchaseForm'

export default async function NewPurchasePage() {
  const supabase = createClient()
  const { data: rawMaterials } = await supabase
    .from('products')
    .select('id, name, unit')
    .eq('type', 'raw_material')
    .order('name', { ascending: true })

  return <PurchaseForm rawMaterials={rawMaterials ?? []} />
}
