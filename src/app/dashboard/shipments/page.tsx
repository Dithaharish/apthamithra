export const instant = false

import { Badge } from "@/components/ui/badge"
import { Truck, MapPin, Package } from "lucide-react"
import { getCustomerContext, getCustomerData, isr, STATUS_STYLE } from "@/lib/customer"
import { ORDER_STATUS_LABEL } from "@/lib/order-status"

export default async function CustomerShipmentsPage() {
  const customer = await getCustomerContext()
  const { orders, shipments } = await getCustomerData(customer.userId)

  const rows = orders
    .filter((o) => shipments.some((s) => s.orderId === o.id))
    .map((order) => ({ order, shipment: shipments.find((s) => s.orderId === order.id)! }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Shipments</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Live tracking and delivery status.</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No shipments yet. Tracking appears once an order is shipped.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map(({ order, shipment }) => (
            <div key={order.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <div className="font-mono text-xs">{order.id}</div>
                    <div className="text-sm font-medium">{shipment.courier}</div>
                  </div>
                </div>
                <Badge className={STATUS_STYLE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
              </div>

              <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <div className="text-xs text-zinc-500">Tracking number</div>
                  <div className="font-mono text-xs">{shipment.trackingNo ?? "Pending"}</div>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <div className="text-xs text-zinc-500">Weight</div>
                  <div className="font-medium">{shipment.weight ? `${shipment.weight} kg` : "—"}</div>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <div className="text-xs text-zinc-500">Order value</div>
                  <div className="font-medium">{isr(order.subtotal + order.serviceFee + order.handling + order.shipping)}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <MapPin className="h-4 w-4 text-zinc-400" /> {shipment.destination}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                <Package className="h-3.5 w-3.5" /> Dispatched {shipment.createdAt.toISOString().split("T")[0]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
