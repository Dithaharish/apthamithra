
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { DashboardNav } from "@/components/dashboard-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex">
        <DashboardNav />
        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full">
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}