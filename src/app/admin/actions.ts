'use server'

import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/company'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function assertSuperAdmin() {
  const profile = await getMyProfile()
  if (profile?.role !== 'super_admin') throw new Error('Acceso denegado')
}

export async function createCompany(formData: FormData) {
  await assertSuperAdmin()
  const supabase = createClient()

  const name = (formData.get('name') as string).trim()
  const slug = (formData.get('slug') as string).trim().toLowerCase().replace(/\s+/g, '-')
  const primaryColor = (formData.get('primary_color') as string) || '#A06040'

  const { data: company, error } = await supabase
    .from('companies')
    .insert({ name, slug, primary_color: primaryColor })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  redirect(`/admin/companies/${company.id}`)
}

export async function updateCompany(id: string, formData: FormData) {
  await assertSuperAdmin()
  const supabase = createClient()

  await supabase.from('companies').update({
    name: (formData.get('name') as string).trim(),
    primary_color: formData.get('primary_color') as string,
    active: formData.get('active') === 'true',
  }).eq('id', id)

  revalidatePath('/admin')
  revalidatePath(`/admin/companies/${id}`)
  redirect(`/admin/companies/${id}`)
}

export async function assignUser(companyId: string, formData: FormData) {
  await assertSuperAdmin()
  const supabase = createClient()
  const userId = formData.get('user_id') as string

  await supabase
    .from('user_profiles')
    .update({ company_id: companyId })
    .eq('user_id', userId)

  revalidatePath(`/admin/companies/${companyId}`)
}

export async function unassignUser(userId: string) {
  await assertSuperAdmin()
  const supabase = createClient()

  await supabase
    .from('user_profiles')
    .update({ company_id: null })
    .eq('user_id', userId)

  revalidatePath('/admin')
}

export async function updateCompanyLogo(id: string, logoUrl: string) {
  await assertSuperAdmin()
  const supabase = createClient()
  await supabase.from('companies').update({ logo_url: logoUrl }).eq('id', id)
  revalidatePath(`/admin/companies/${id}`)
}
