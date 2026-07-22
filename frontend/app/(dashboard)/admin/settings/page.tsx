import { redirect } from 'next/navigation'

/** Old Settings URL — send admins to sick day approvals */
export default function AdminSettingsRedirect() {
  redirect('/admin/sick-days')
}
