import Link from "next/link"
export const instant = false


import { Badge } from "@/components/ui/badge"
import { MapPin, Truck, CheckCircle, Clock, X } from "lucide-react"
import { db, ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/db"
import type { OrderStatus } from "@/lib/db"
import { AdminOrderStatus } from "@/components/admin-order-status"

const statusStyle: Record<OrderStatus, string> = {
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

const statusIcon: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  purchasing: CheckCircle,
  qc_pending: CheckCircle,
  qc_approved: CheckCircle,
  paid: CheckCircle,
  packed: CheckCircle,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: X,
}

export default async function AdminOrdersPage() {

  const all = await db.order.findMany()
  const customers = await db.user.findMany({ role: "CUSTOMER" })
  const shoppers = await db.shopper.findMany()

  const customerName = (id: string) => customers.find((u) => u.id === id)?.name ?? "Customer"
  const shopperName = (id: string | null) =>
    (id && shoppers.find((s) => s.id === id)?.name) || "Unassigned"

  const revenue = all
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.subtotal + o.serviceFee + o.handling + o.shipping, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          {all.length} order{all.length === 1 ? "" : "s"} · ₹{revenue.toLocaleString("en-IN")} total value
        </p>
      </div>

      {all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No orders yet. Shoppers raise them from appointment pages.
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
                {all.map((o) => {
                  const Icon = statusIcon[o.status]
                  const total = o.subtotal + o.serviceFee + o.handling + o.shipping
                  return (
                    <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="px-5 py-3 font-mono text-xs">
                        <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                          {o.id}
                        </Link>
                      </td>
                      <td className="px-5 py-3 font-medium">{customerName(o.customerId)}</td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {shopperName(o.shopperId)}
                      </td>
                      <td className="px-5 py-3 font-medium">₹{total.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {o.destination || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={statusStyle[o.status]}>
                            <Icon className="h-3.5 w-3.5 mr-1" />
                            {ORDER_STATUS_LABEL[o.status]}
                          </Badge>
                          <AdminOrderStatus
                            orderId={o.id}
                            currentStatus={o.status}
                            flow={ORDER_FLOW}
                          />
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
