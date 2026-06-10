import { createClient } from './supabase/server'

export type Company = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  active: boolean
}

export type UserProfile = {
  user_id: string
  company_id: string | null
  role: 'super_admin' | 'owner'
  companies: Company | null
}

export async function getMyProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('user_profiles')
    .select('*, companies(*)')
    .eq('user_id', user.id)
    .single()
  return data as UserProfile | null
}

export async function getMyCompanyId(): Promise<string | null> {
  const profile = await getMyProfile()
  return profile?.company_id ?? null
}
