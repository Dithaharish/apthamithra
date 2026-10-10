import { Badge } from "@/components/ui/badge"
export const instant = false

import Link from "next/link"
import { Calendar, Phone, Video, MessageSquare, Languages, Clock } from "lucide-react"
import { getShopperContext, myAppointments, myCustomers } from "@/lib/shopper"

const modeIcon = { video: Video, app: Phone, phone: MessageSquare } as const

const statusStyle: Record<string, string> = {
  scheduled: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  rescheduled: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
}

export default async function ShopperAppointmentsPage() {
  const ctx = await getShopperContext()
  if (!ctx) return null

  const appointments = await myAppointments(ctx.shopper.id)
  const customers = await myCustomers(ctx.shopper.id)

  const customerName = (id: string) =>
    customers.find((c) => c.user.id === id)?.user.name ?? "Customer"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Consultations assigned to you. Open one to start the call and take notes.
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No appointments assigned yet. The admin assigns consultations from the
          admin appointments page.
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((a) => {
            const ModeIcon = modeIcon[a.mode]
            return (
              <div
                key={a.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <ModeIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium">{customerName(a.customerId)}</div>
                      <div className="text-xs text-zinc-500">
                        {a.date} at {a.time} IST
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusStyle[a.status]}>{a.status}</Badge>
                    <Link
                      href={`/shopper/appointments/${a.id}`}
                      className="inline-flex items-center h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Open
                    </Link>
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Calendar className="h-4 w-4 text-zinc-400" /> {a.purpose}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Languages className="h-4 w-4 text-zinc-400" /> {a.language}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Clock className="h-4 w-4 text-zinc-400" /> {a.mode}
                  </div>
                </div>

                {a.notes && (
                  <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3 text-sm">
                    <span className="font-medium">Customer notes: </span>
                    {a.notes}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
