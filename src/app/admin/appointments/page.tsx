
export const instant = false


import { Badge } from "@/components/ui/badge"
import { Calendar, Phone, Video, MessageSquare, User as UserIcon, Star } from "lucide-react"
import { db } from "@/lib/db"
import type { AppointmentStatus } from "@/lib/db"
import { AssignShopper } from "@/components/assign-shopper"

const modeIcon = { video: Video, app: Phone, phone: MessageSquare } as const

const statusStyle: Record<AppointmentStatus, string> = {
  scheduled: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  rescheduled: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
}

export default async function AdminAppointmentsPage() {

  const all = await db.appointment.findMany()
  const customers = await db.user.findMany({ role: "CUSTOMER" })
  const shoppers = await db.shopper.findMany()

  const customerName = (id: string) => customers.find((u) => u.id === id)?.name ?? "Customer"
  const shopperName = (id: string | null) =>
    (id && shoppers.find((s) => s.id === id)?.name) || "Unassigned"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          {all.length} consultation{all.length === 1 ? "" : "s"} across the team.
          Assign a shopper to each one.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <div className="text-sm text-zinc-500">Scheduled</div>
          <div className="mt-2 text-2xl font-semibold">
            {all.filter((a) => a.status === "scheduled").length}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <div className="text-sm text-zinc-500">Unassigned</div>
          <div className="mt-2 text-2xl font-semibold">
            {all.filter((a) => !a.shopperId).length}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <div className="text-sm text-zinc-500">Available shoppers</div>
          <div className="mt-2 text-2xl font-semibold">
            {shoppers.filter((s) => s.available).length}
          </div>
        </div>
      </div>

      {all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No appointments booked yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">ID</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">When</th>
                  <th className="text-left px-5 py-3 font-medium">Mode</th>
                  <th className="text-left px-5 py-3 font-medium">Purpose</th>
                  <th className="text-left px-5 py-3 font-medium">Assigned shopper</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {all.map((a) => {
                  const ModeIcon = modeIcon[a.mode]
                  return (
                    <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="px-5 py-3 font-mono text-xs">{a.id}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-zinc-400" />
                          {customerName(a.customerId)}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> {a.date} · {a.time}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <ModeIcon className="h-4 w-4 text-zinc-500" />
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{a.purpose}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {a.shopperId ? (
                            <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              {shopperName(a.shopperId)}
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-xs">Unassigned</span>
                          )}
                          <AssignShopper
                            appointmentId={a.id}
                            currentShopperId={a.shopperId}
                            shoppers={shoppers.map((s) => ({ id: s.id, name: s.name, city: s.city }))}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge className={statusStyle[a.status]}>{a.status}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
