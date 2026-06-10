import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavMenu from './NavMenu'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-brand-50">
      <NavMenu />
      <main className="p-4 sm:p-6 max-w-2xl mx-auto">{children}</main>
    </div>
  )
}
