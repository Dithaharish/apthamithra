import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AppointmentBookingForm } from "@/components/appointment-booking-form"

export const instant = false

export default function DashboardBookPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-amber-600 hover:underline">← Back to Dashboard</Link>
          <h1 className="mt-2 text-2xl font-semibold">Book Appointment</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">Pick a slot. We convert IST ↔ your local timezone.</p>
        </div>
        <AppointmentBookingForm />
      </main>
      <SiteFooter />
    </div>
  )
}