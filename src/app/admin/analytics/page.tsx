export const instant = false

import Link from "next/link"
import {
  ShoppingBag,
  Users,
  DollarSign,
  Star,
  Truck,
  Package,
  TrendingUp,
} from "lucide-react"
import { db } from "@/lib/db"
import { ORDER_STATUS_LABEL } from "@/lib/order-status"

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`
}

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0
  return Math.round((part / whole) * 100)
}

/**
 * Analytics computed from the database.
 *
 * The previous version of this page was a set of hardcoded constants
 * ("1,248 orders", "₹48.6L revenue") that contradicted the live Overview page
 * and were internally inconsistent — the country figures summed to 126 against
 * a stated total of 1,248. Everything here is derived from the same rows the
 * rest of the admin panel reads.
 */
export default async function AdminAnalyticsPage() {
  const [orders, appointments, customers, shoppers, payments, reviews, items] = await Promise.all([
    db.order.findMany(),
    db.appointment.findMany(),
    db.user.findMany({ role: "CUSTOMER" }),
    db.shopper.findMany(),
    db.payment.findMany(),
    db.review.findMany(),
    db.orderItem.findMany({}),
  ])

  const live = orders.filter((o) => o.status !== "cancelled")
  const orderTotal = (o: (typeof orders)[number]) => o.subtotal + o.serviceFee + o.handling + o.shipping

  const revenue = live.reduce((sum, o) => sum + orderTotal(o), 0)
  const collected = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const delivered = live.filter((o) => o.status === "delivered").length
  const approvedReviews = reviews.filter((r) => r.status === "approved")
  const avgRating = approvedReviews.length
    ? approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length
    : 0

  const stats = [
    { label: "Orders", value: String(orders.length), icon: ShoppingBag, color: "text-amber-600", note: `${live.length} excluding cancelled` },
    { label: "Order value", value: inr(revenue), icon: DollarSign, color: "text-emerald-600", note: `${inr(collected)} collected` },
    { label: "Customers", value: String(customers.length), icon: Users, color: "text-sky-600", note: `${shoppers.length} shoppers` },
    { label: "Avg rating", value: avgRating ? avgRating.toFixed(1) : "—", icon: Star, color: "text-purple-600", note: `${approvedReviews.length} approved review${approvedReviews.length === 1 ? "" : "s"}` },
  ]

  // Orders grouped by the shop named on their line items. An order with no
  // recognised shop name is grouped under its first item's shop, else "Other".
  const shopOf = new Map<string, { orders: Set<string>; revenue: number }>()
  for (const item of items) {
    const order = orders.find((o) => o.id === item.orderId)
    if (!order || order.status === "cancelled") continue
    const name = item.shopName ?? "Other"
    const bucket = shopOf.get(name) ?? { orders: new Set<string>(), revenue: 0 }
    bucket.orders.add(item.orderId)
    bucket.revenue += item.price * item.quantity
    shopOf.set(name, bucket)
  }
  const topCategories = [...shopOf.entries()]
    .map(([name, b]) => ({ name, orders: b.orders.size, revenue: b.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
  const categoryMax = Math.max(1, ...topCategories.map((c) => c.revenue))

  // Customers grouped by country.
  const byCountry = new Map<string, number>()
  for (const c of customers) {
    const key = c.country ?? "Unknown"
    byCountry.set(key, (byCountry.get(key) ?? 0) + 1)
  }
  const countryRows = [...byCountry.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)

  // Where orders currently sit in the lifecycle.
  const stageRows = Object.entries(ORDER_STATUS_LABEL)
    .map(([status, label]) => ({ status, label, count: orders.filter((o) => o.status === status).length }))
    .filter((r) => r.count > 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Every figure below is computed from the live database.
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
              <div className="mt-2 text-2xl font-semibold">{s.value}</div>
              <div className="mt-1 text-xs text-zinc-500">{s.note}</div>
            </div>
          )
        })}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No orders yet. Figures will appear as soon as shoppers raise orders.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600" /> Top shops by value
            </h2>
            {topCategories.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">No order items recorded yet.</p>
            ) : (
              <div className="mt-5 space-y-4">
                {topCategories.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-zinc-500">{inr(c.revenue)}</span>
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {c.orders} order{c.orders === 1 ? "" : "s"}
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct(c.revenue, categoryMax)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-600" /> Customers by country
            </h2>
            {countryRows.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">No customers registered yet.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {countryRows.map((c) => (
                  <div key={c.country}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.country}</span>
                      <span className="text-zinc-500">
                        {c.count} ({pct(c.count, customers.length)}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: `${pct(c.count, customers.length)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-600" /> Orders by stage
            </h2>
            <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
              {stageRows.map((r) => (
                <div key={r.status} className="py-2.5 flex items-center justify-between text-sm">
                  <span>{r.label}</span>
                  <span className="font-medium">
                    {r.count} ({pct(r.count, orders.length)}%)
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4 text-sky-600" /> Fulfilment
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Delivered</dt>
                <dd className="font-medium">
                  {delivered} ({pct(delivered, live.length)}% of live orders)
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">In transit</dt>
                <dd className="font-medium">{orders.filter((o) => o.status === "shipped").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Awaiting QC approval</dt>
                <dd className="font-medium">{orders.filter((o) => o.status === "qc_pending").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Payments recorded</dt>
                <dd className="font-medium">{payments.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Appointments booked</dt>
                <dd className="font-medium">{appointments.length}</dd>
              </div>
            </dl>
            <Link href="/admin/orders" className="mt-4 inline-block text-sm text-amber-600 hover:underline">
              Open orders
            </Link>
          </section>
        </div>
      )}
    </div>
  )
}
