'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getMyCompanyId } from '@/lib/company'

type ProductPayload = {
  name: string
  type: string
  price: number
  current_stock: number
  unit?: string | null
  min_stock?: number
  image_url?: string | null
}

export async function createProduct(data: ProductPayload) {
  const supabase = createClient()
  const companyId = await getMyCompanyId()
  await supabase.from('products').insert({
    name: data.name.trim(),
    type: data.type,
    price: data.type === 'sale' ? data.price : 0,
    current_stock: data.current_stock || 0,
    unit: data.type === 'raw_material' ? (data.unit ?? null) : null,
    min_stock: data.type === 'raw_material' ? (data.min_stock ?? 0) : 0,
    image_url: data.image_url ?? null,
    company_id: companyId,
  })
  redirect(data.type === 'raw_material' ? '/dashboard/inventory' : '/dashboard/products')
}

export async function updateProduct(id: string, data: ProductPayload) {
  const supabase = createClient()
  await supabase.from('products').update({
    name: data.name.trim(),
    type: data.type,
    price: data.type === 'sale' ? data.price : 0,
    current_stock: data.current_stock || 0,
    unit: data.type === 'raw_material' ? (data.unit ?? null) : null,
    min_stock: data.type === 'raw_material' ? (data.min_stock ?? 0) : 0,
    image_url: data.image_url ?? null,
  }).eq('id', id)
  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard/inventory')
  redirect(data.type === 'raw_material' ? '/dashboard/inventory' : '/dashboard/products')
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
