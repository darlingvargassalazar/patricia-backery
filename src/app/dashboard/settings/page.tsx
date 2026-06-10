import { getMyProfile } from '@/lib/company'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const profile = await getMyProfile()
  if (!profile?.company_id || !profile.companies) redirect('/dashboard')
  return <SettingsForm company={profile.companies} />
}
