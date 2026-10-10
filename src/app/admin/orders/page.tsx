export const instant = false

import Link from "next/link"
import { MapPin, Truck, CheckCircle, Clock, X, Search } from "lucide-react"
import { db, ORDER_STATUS_LABEL } from "@/lib/db"
import type { OrderStatus } from "@/lib/db"
import { AdminOrderStatus } from "@/components/admin-order-status"

const statusIcon: Record<string, typeof Clock> = {
  pending: Clock,
  purchasing: CheckCircle,
  qc_pending: Clock,
  qc_approved: CheckCircle,
  paid: CheckCircle,
  packed: CheckCircle,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: X,
}

const PAGE_SIZE = 20

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  purchasing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  qc_pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  qc_approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  paid: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  packed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  shipped: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>
}) {
  const { q = "", page = "1", status = "" } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  // Fetch one extra row to know whether a next page exists.
  const { rows, total } = await db.order.findPage(where, {
    limit: PAGE_SIZE + 1,
    offset,
    search: { columns: ["destination", "notes"], term: q },
  })

  const hasMore = rows.length > PAGE_SIZE
  const pageRows = hasMore ? rows.slice(0, PAGE_SIZE) : rows
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const [customers, shoppers] = await Promise.all([
    db.user.findMany({ role: "CUSTOMER" }),
    db.shopper.findMany(),
  ])

  const customerName = (id: string) => customers.find((u) => u.id === id)?.name ?? "Customer"
  const shopperName = (id: string | null) =>
    (id && shoppers.find((s) => s.id === id)?.name) || "Unassigned"

  const qs = (over: Record<string, string | number>) => {
    const params = new URLSearchParams({ q, page: String(currentPage), status })
    for (const [k, v] of Object.entries(over)) params.set(k, String(v))
    return `/admin/orders?${params.toString()}`
  }

  const STATUSES: OrderStatus[] = ["pending", "purchasing", "qc_pending", "paid", "packed", "shipped", "delivered", "cancelled"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          {total} order{total === 1 ? "" : "s"} in total
        </p>
      </div>

      <form action="/admin/orders" method="get" className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search destination or notes..."
            className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 px-5 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 transition-colors"
        >
          Filter
        </button>
      </form>

      {pageRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No orders match this filter.
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Order</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Shopper</th>
                  <th className="text-left px-5 py-3 font-medium">Total</th>
                  <th className="text-left px-5 py-3 font-medium">Destination</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {pageRows.map((o) => {
                  const Icon = statusIcon[o.status] ?? Clock
                  const total = o.subtotal + o.serviceFee + o.handling + o.shipping
                  return (
                    <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="px-5 py-3 font-mono text-xs">
                        <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                          {o.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-5 py-3 font-medium">{customerName(o.customerId)}</td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{shopperName(o.shopperId)}</td>
                      <td className="px-5 py-3 font-medium">₹{Math.round(total).toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {o.destination || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[o.status]}`}
                          >
                            <Icon className="h-3.5 w-3.5 mr-1" />
                            {ORDER_STATUS_LABEL[o.status]}
                          </span>
                          <AdminOrderStatus orderId={o.id} currentStatus={o.status} flow={["pending", "purchasing", "qc_pending", "qc_approved", "paid", "packed", "shipped", "delivered"]} />
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={qs({ page: currentPage - 1 })} className="inline-flex h-9 items-center px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Previous
              </Link>
            )}
            {hasMore && (
              <Link href={qs({ page: currentPage + 1 })} className="inline-flex h-9 items-center px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
