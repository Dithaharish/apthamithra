import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Calendar, MapPin, Languages, Mail } from "lucide-react"
import { db } from "@/lib/db"

export default async function AdminCustomersPage() {

  const all = await db.user.findMany({ role: "CUSTOMER" })
  const appointments = await db.appointment.findMany()
  const orders = await db.order.findMany()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          {all.length} registered NRI customer{all.length === 1 ? "" : "s"}.
        </p>
      </div>

      {all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No customers registered yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Country</th>
                  <th className="text-left px-5 py-3 font-medium">Language</th>
                  <th className="text-left px-5 py-3 font-medium">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {all.map((c) => {
                  const aptCount = appointments.filter((a) => a.customerId === c.id).length
                  const orderCount = orders.filter((o) => o.customerId === c.id).length
                  return (
                    <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center font-medium text-amber-700 dark:text-amber-300 text-xs">
                            {(c.name ?? "C").slice(0, 1)}
                          </div>
                          <div className="font-medium">{c.name ?? "Customer"}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" /> {c.email}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {c.country ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Languages className="h-3.5 w-3.5" /> {c.language ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            <Calendar className="h-3 w-3 mr-1" />
                            {aptCount}
                          </Badge>
                          <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            {orderCount}
                          </Badge>
                        </div>
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
