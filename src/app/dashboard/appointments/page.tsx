export const instant = false

import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, Phone, MessageSquare, Languages, CheckCircle, X, RefreshCw } from "lucide-react"
import { getCustomerContext, getCustomerData } from "@/lib/customer"

const modeIcon = { video: Video, app: Phone, phone: MessageSquare } as const

const statusStyle: Record<string, string> = {
  scheduled: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  rescheduled: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
}

export default async function CustomerAppointmentsPage() {
  const customer = await getCustomerContext()
  const { appointments } = await getCustomerData(customer.userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Your consultations. Our team joins you at the scheduled time.
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No appointments booked yet.
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((a) => {
            const ModeIcon = modeIcon[a.mode]
            return (
              <div key={a.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <ModeIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium">{a.purpose}</div>
                      <div className="text-xs text-zinc-500">{a.date} at {a.time} IST</div>
                    </div>
                  </div>
                  <Badge className={statusStyle[a.status]}>{a.status}</Badge>
                </div>

                <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Calendar className="h-4 w-4 text-zinc-400" /> {a.date}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Languages className="h-4 w-4 text-zinc-400" /> {a.language}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 capitalize">
                    <Clock className="h-4 w-4 text-zinc-400" /> {a.mode} call
                  </div>
                </div>

                {a.notes && (
                  <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3 text-sm">
                    <span className="font-medium">Your notes: </span>
                    {a.notes}
                  </div>
                )}

                {a.status === "scheduled" && (
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> Reschedule free up to 12 hours before</span>
                    <span className="inline-flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Reminder sent 24h and 1h before</span>
                  </div>
                )}
                {a.status === "cancelled" && (
                  <p className="mt-3 text-xs text-zinc-500 inline-flex items-center gap-1"><X className="h-3.5 w-3.5" /> Cancelled</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
