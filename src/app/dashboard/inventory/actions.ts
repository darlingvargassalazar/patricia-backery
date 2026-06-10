'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getMyCompanyId } from '@/lib/company'

export async function createRawMaterial(formData: FormData) {
  const supabase = createClient()
  const companyId = await getMyCompanyId()
  await supabase.from('products').insert({
    name: (formData.get('name') as string).trim(),
    type: 'raw_material',
    unit: formData.get('unit') as string,
    current_stock: Number(formData.get('current_stock')) || 0,
    min_stock: Number(formData.get('min_stock')) || 0,
    price: 0,
    company_id: companyId,
  })
  redirect('/dashboard/inventory')
}

export async function updateRawMaterial(id: string, formData: FormData) {
  const supabase = createClient()
  await supabase.from('products').update({
    name: (formData.get('name') as string).trim(),
    unit: formData.get('unit') as string,
    current_stock: Number(formData.get('current_stock')) || 0,
    min_stock: Number(formData.get('min_stock')) || 0,
  }).eq('id', id)
  redirect('/dashboard/inventory')
}

export async function addStock(id: string, formData: FormData) {
  const amount = Number(formData.get('amount'))
  if (!amount || amount <= 0) {
    revalidatePath('/dashboard/inventory')
    return
  }
  const supabase = createClient()
  await supabase.rpc('increment_stock', { row_id: id, delta: amount })
  revalidatePath('/dashboard/inventory')
}

export async function deleteRawMaterial(id: string) {
  const supabase = createClient()
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/dashboard/inventory')
}
