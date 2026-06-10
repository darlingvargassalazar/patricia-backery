import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/company'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getMyProfile()
  if (profile?.role !== 'super_admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-sm text-gray-300 uppercase tracking-widest">Admin</span>
          <Link href="/admin" className="text-sm hover:text-white text-gray-400 transition-colors">Empresas</Link>
        </div>
        <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">← Mi dashboard</Link>
      </nav>
      <main className="p-6 max-w-4xl mx-auto">{children}</main>
    </div>
  )
}
