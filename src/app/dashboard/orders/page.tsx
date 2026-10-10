export const instant = false

import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ShoppingBag, MapPin, Star, Camera, Truck, CheckCircle, Clock, X } from "lucide-react"
import { getCustomerContext, getCustomerData, isr, orderTotal, STATUS_STYLE, itemsByOrder } from "@/lib/customer"
import { ORDER_STATUS_LABEL } from "@/lib/db"

const statusIcon: Record<string, typeof Clock> = {
  pending: Clock,
  purchasing: ShoppingBag,
  qc_pending: Camera,
  qc_approved: CheckCircle,
  paid: CheckCircle,
  packed: ShoppingBag,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: X,
}

export default async function CustomerOrdersPage() {
  const customer = await getCustomerContext()
  const { orders, shipments } = await getCustomerData(customer.userId)
  const counts = await itemsByOrder(orders.map((o) => o.id))

  const trackingFor = (orderId: string) => shipments.find((s) => s.orderId === orderId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Every purchase from market to doorstep.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No orders yet. <Link href="/book" className="font-medium text-amber-600 hover:underline">Book a consultation</Link> to start.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const Icon = statusIcon[o.status] ?? Clock
            const shipment = trackingFor(o.id)
            return (
              <div key={o.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link href={`/dashboard/orders/${o.id}`} className="font-mono text-xs hover:underline">{o.id}</Link>
                    <div className="text-xs text-zinc-500">
                      {o.createdAt.toISOString().split("T")[0]} · {counts[o.id] ?? 0} items
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{isr(orderTotal(o))}</span>
                    <Badge className={STATUS_STYLE[o.status]}>
                      <Icon className="h-3.5 w-3.5 mr-1" />
                      {ORDER_STATUS_LABEL[o.status]}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                    <div className="text-xs text-zinc-500">Destination</div>
                    <div className="font-medium flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{o.destination || "Not set"}</div>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                    <div className="text-xs text-zinc-500">Tracking</div>
                    <div className="font-mono text-xs">{shipment?.trackingNo ?? "—"}</div>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                    <div className="text-xs text-zinc-500">Courier</div>
                    <div className="font-medium">{shipment?.courier ?? "—"}</div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/orders/${o.id}`}
                    className="inline-flex items-center h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    View details
                  </Link>
                  {o.status === "qc_pending" && (
                    <span className="inline-flex items-center h-9 px-4 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-sm font-medium">
                      <Camera className="h-4 w-4 mr-1.5" /> QC awaiting your approval
                    </span>
                  )}
                  {o.status === "delivered" && (
                    <Link
                      href={`/dashboard/orders/${o.id}#review`}
                      className="inline-flex items-center h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Star className="h-4 w-4 mr-1.5" /> Leave a review
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
