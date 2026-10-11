export const instant = false

import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Clock, ShoppingBag, Truck, Star, ArrowRight, Package } from "lucide-react"
import { getCustomerContext, getCustomerData, isr, orderTotal, STATUS_STYLE, itemsByOrder } from "@/lib/customer"
import { ORDER_STATUS_LABEL } from "@/lib/order-status"

export default async function DashboardPage() {
  const customer = await getCustomerContext()
  const { orders, appointments, reviews } = await getCustomerData(customer.userId)

  const openOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled")
  const upcoming = appointments
    .filter((a) => a.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date))
  const counts = await itemsByOrder(openOrders.map((o) => o.id))

  const stats = [
    { label: "Total orders", value: String(orders.length), icon: ShoppingBag, color: "text-amber-600" },
    { label: "Active orders", value: String(openOrders.length), icon: Package, color: "text-sky-600" },
    { label: "Appointments", value: String(upcoming.length), icon: Calendar, color: "text-emerald-600" },
    { label: "Reviews given", value: String(reviews.length), icon: Star, color: "text-purple-600" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {customer.firstName}</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          {customer.timezone ? `Times shown in IST. Your timezone: ${customer.timezone}` : "Here is what is happening with your shopping."}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">{s.label}</span>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="mt-2 text-3xl font-semibold">{s.value}</div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-amber-600 hover:underline">View all</Link>
          </div>

          {orders.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
              <p className="text-sm text-zinc-500">No orders yet.</p>
              <Link href="/book" className="mt-3 inline-block text-sm font-medium text-amber-600 hover:underline">
                Book a consultation to get started
              </Link>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <Link href={`/dashboard/orders/${o.id}`} className="font-mono text-xs hover:underline">{o.id}</Link>
                    <div className="text-xs text-zinc-500">
                      {o.createdAt.toISOString().split("T")[0]} · {counts[o.id] ?? 0} items
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{isr(orderTotal(o))}</span>
                    <Badge className={STATUS_STYLE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" /> Next appointment
          </h2>

          {upcoming.length === 0 ? (
            <div className="mt-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 text-sm text-zinc-500">
              Nothing booked.
              <Link href="/book" className="mt-2 block font-medium text-amber-600 hover:underline">Book an appointment</Link>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
              <div className="text-sm font-medium">{upcoming[0].purpose}</div>
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                {upcoming[0].date}
              </div>
              <div className="mt-2 text-sm flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-600" /> {upcoming[0].time} IST
              </div>
              <div className="mt-1 text-xs text-zinc-500 capitalize">{upcoming[0].mode} · {upcoming[0].language}</div>
              <Link
                href="/dashboard/appointments"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline"
              >
                Manage <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-semibold flex items-center gap-2">
          <Truck className="h-4 w-4 text-amber-600" /> Shipments in transit
        </h2>
        {openOrders.filter((o) => o.status === "shipped").length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No shipments on the way right now.</p>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {openOrders
              .filter((o) => o.status === "shipped")
              .map((o) => (
                <div key={o.id} className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4">
                  <div className="font-mono text-xs">{o.id}</div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{o.destination}</div>
                  <Link href={`/dashboard/orders/${o.id}`} className="mt-2 inline-block text-xs font-medium text-amber-600 hover:underline">
                    Track shipment
                  </Link>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
