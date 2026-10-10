
import { getServerSession } from "next-auth"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { DashboardNav } from "@/components/dashboard-nav"
import { VerifyEmailBanner } from "@/components/verify-email-banner"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Only customers land here, so show the nudge to anyone unverified.
  const session = await getServerSession(authOptions)
  const user = session?.user ? await db.user.findUnique({ id: session.user.id }) : null
  const needsVerification = Boolean(user && !user.emailVerified)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex">
        <DashboardNav />
        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full">
          {needsVerification && (
            <div className="mb-6">
              <VerifyEmailBanner />
            </div>
          )}
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}