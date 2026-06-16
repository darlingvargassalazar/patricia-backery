import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/company'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const profile = await getMyProfile()
  if (!profile) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { company_id, name, primary_color, logo_url, email_api_key, email_from, email_from_name } = await req.json()

  if (profile.company_id !== company_id && profile.role !== 'super_admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const supabase = createClient()
  const { error } = await supabase
    .from('companies')
    .update({ name, primary_color, logo_url, email_api_key, email_from, email_from_name })
    .eq('id', company_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
