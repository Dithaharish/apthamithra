import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Calendar, Globe2, Video, ShieldCheck } from "lucide-react"
import { AppointmentBookingForm } from "@/components/appointment-booking-form"

export default function BookPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Badge className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Free Consultation</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Book your appointment</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">Pick a slot that works for your timezone. We handle IST ↔ local time automatically.</p>
            <AppointmentBookingForm />
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <h3 className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4 text-amber-600" /> Choose a time</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Slots shown in your local time. Reminders sent 24h & 1h before.</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <h3 className="font-medium flex items-center gap-2"><Video className="h-4 w-4 text-amber-600" /> Choose a mode</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Video (Zoom/Meet), App, or Phone — whichever is easiest for you.</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <h3 className="font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-600" /> What to share</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Shop preference, budget, item list, any photo reference. We will share a quote before purchasing.</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <h3 className="font-medium flex items-center gap-2"><Globe2 className="h-4 w-4 text-amber-600" /> Languages</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">English, Hindi, Gujarati, Tamil — matched to your profile.</p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}