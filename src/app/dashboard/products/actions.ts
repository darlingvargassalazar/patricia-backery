'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getMyCompanyId } from '@/lib/company'

export async function createProduct(formData: FormData) {
  const supabase = createClient()
  const companyId = await getMyCompanyId()
  const type = formData.get('type') as string
  await supabase.from('products').insert({
    name: (formData.get('name') as string).trim(),
    type,
    price: type === 'sale' ? Number(formData.get('price')) : 0,
    current_stock: Number(formData.get('current_stock')) || 0,
    unit: type === 'raw_material' ? (formData.get('unit') as string) : null,
    min_stock: type === 'raw_material' ? Number(formData.get('min_stock')) || 0 : 0,
    company_id: companyId,
  })
  redirect(type === 'raw_material' ? '/dashboard/inventory' : '/dashboard/products')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createClient()
  const type = formData.get('type') as string
  await supabase.from('products').update({
    name: (formData.get('name') as string).trim(),
    type,
    price: type === 'sale' ? Number(formData.get('price')) : 0,
    current_stock: Number(formData.get('current_stock')) || 0,
    unit: type === 'raw_material' ? (formData.get('unit') as string) : null,
    min_stock: type === 'raw_material' ? Number(formData.get('min_stock')) || 0 : 0,
  }).eq('id', id)
  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard/inventory')
  redirect(type === 'raw_material' ? '/dashboard/inventory' : '/dashboard/products')
}

export async function toggleProductActive(id: string, active: boolean) {
  const supabase = createClient()
  await supabase.from('products').update({ active }).eq('id', id)
  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard/inventory')
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard/inventory')
}
