export const instant = false

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SettingsForm } from "@/components/admin/settings-form"

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Business details, appointment hours and integrations.
          </p>
        </div>
        <SettingsForm />
      </div>
      <SiteFooter />
    </div>
  )
}
