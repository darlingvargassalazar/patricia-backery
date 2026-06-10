import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMyProfile } from '@/lib/company'
import { buildBrandVars } from '@/lib/theme'
import NavMenu from './NavMenu'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getMyProfile()
  const company = profile?.companies
  const primaryColor = company?.primary_color ?? '#A06040'
  const brandVars = buildBrandVars(primaryColor)

  return (
    <div className="min-h-screen bg-brand-50">
      <style dangerouslySetInnerHTML={{ __html: `:root{${brandVars}}` }} />
      <NavMenu
        companyName={company?.name ?? 'PattyBakery'}
        logoUrl={company?.logo_url ?? null}
        isSuperAdmin={profile?.role === 'super_admin'}
      />
      <main className="p-4 sm:p-6 max-w-2xl mx-auto">{children}</main>
    </div>
  )
}
