
import Link from "next/link"
import { ShoppingBag, Users, Calendar, Star, DollarSign, Clock } from "lucide-react"
import { db, ORDER_STATUS_LABEL } from "@/lib/db"

export default async function AdminDashboardPage() {
  const allOrders = await db.order.findMany()
  const allAppointments = await db.appointment.findMany()
  const allCustomers = await db.user.findMany({ role: "CUSTOMER" })
  const allShoppers = await db.shopper.findMany()

  const revenue = allOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.subtotal + o.serviceFee + o.handling + o.shipping, 0)
  const todaysAppointments = allAppointments
    .filter((a) => a.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)

  const customerName = (id: string) => allCustomers.find((u) => u.id === id)?.name ?? "Customer"
  const modeIcon = { video: "Video", app: "App", phone: "Phone" } as const

  const stats = [
    { label: "Orders", value: String(allOrders.length), icon: ShoppingBag, color: "text-amber-600" },
    { label: "Revenue (INR)", value: `₹${Math.round(revenue).toLocaleString("en-IN")}`, icon: DollarSign, color: "text-emerald-600" },
    { label: "Customers", value: String(allCustomers.length), icon: Users, color: "text-sky-600" },
    { label: "Shoppers", value: String(allShoppers.length), icon: Star, color: "text-purple-600" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Live figures from the current data set.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">{s.label}</span>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="mt-2 text-2xl font-semibold">{s.value}</div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-amber-600 hover:underline">
              All orders
            </Link>
          </div>
          {allOrders.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No orders yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
              {allOrders.slice(0, 6).map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs hover:underline">
                      {o.id}
                    </Link>
                    <div className="text-xs text-zinc-500">{customerName(o.customerId)}</div>
                  </div>
                  <span className="text-sm">
                    ₹{(o.subtotal + o.serviceFee + o.handling + o.shipping).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" /> Next appointments
          </h2>
          {todaysAppointments.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">Nothing booked for today.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {todaysAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{customerName(a.customerId)}</div>
                    <div className="text-xs text-zinc-500">
                      {modeIcon[a.mode]} · {a.shopperId ? "Assigned" : "Unassigned"}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-amber-600">{a.time}</div>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/admin/appointments"
            className="mt-4 inline-flex items-center gap-1 text-sm text-amber-600 hover:underline"
          >
            <Calendar className="h-4 w-4" /> Manage appointments
          </Link>
        </div>
      </div>
    </div>
  )
}
