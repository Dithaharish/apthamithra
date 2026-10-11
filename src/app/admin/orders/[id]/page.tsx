import { Badge } from "@/components/ui/badge"
export const instant = false


import { Store, MapPin, DollarSign, Package, Camera, Truck } from "lucide-react"
import { db } from "@/lib/db"
import { ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/order-status"
import { AdminOrderStatus } from "@/components/admin-order-status"

/**
 * Order detail pages are rendered on demand, so prerendering a list of ids is
 * only an optimisation. If the database is unreachable during the build —
 * credentials not yet present, network blocked — return an empty list rather
 * than failing the whole build. Any id will still work at request time.
 */
export async function generateStaticParams() {
  try {
    const orders = await db.order.findMany()
    return orders.map((o) => ({ id: o.id }))
  } catch (err) {
    console.warn("generateStaticParams skipped for orders:", err instanceof Error ? err.message : err)
    return []
  }
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await db.order.findUnique({ id })
  if (!order) {
    return <p className="text-sm text-zinc-500">Order not found.</p>
  }

  const customer = await db.user.findUnique({ id: order.customerId })
  const shoppers = await db.shopper.findMany()
  const shopList = await db.shop.findMany()
  const items = await db.orderItem.findMany({ orderId: id })
  const payments = await db.payment.findMany({ orderId: id })
  const shipments = await db.shipment.findMany({ orderId: id })
  const qcs = await db.qcImage.findMany({ orderId: id })

  const total = order.subtotal + order.serviceFee + order.handling + order.shipping
  const currentIndex = ORDER_FLOW.indexOf(order.status)
  const shopperName =
    (order.shopperId && shoppers.find((s) => s.id === order.shopperId)?.name) || "Unassigned"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{order.id}</h1>
        <p className="text-sm text-zinc-500">
          {customer?.name ?? "Customer"} · {customer?.email}
        </p>
      </div>

      {currentIndex >= 0 && (
        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold text-sm">Lifecycle</h2>
          <ol className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {ORDER_FLOW.map((stage, i) => (
              <li key={stage} className="flex items-center gap-2 text-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    i <= currentIndex ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                />
                <span className={i <= currentIndex ? "font-medium" : "text-zinc-400"}>
                  {ORDER_STATUS_LABEL[stage]}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <AdminOrderStatus orderId={order.id} currentStatus={order.status} flow={ORDER_FLOW} />
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-600" /> Items
            </h2>
            {items.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No items.</p>
            ) : (
              <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((item) => (
                  <li key={item.id} className="py-3 flex justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-zinc-500 inline-flex items-center gap-1">
                        <Store className="h-3 w-3" />
                        {(item.shopName && shopList.find((s) => s.name === item.shopName)?.name) ||
                          item.shopName ||
                          "Not set"}
                      </div>
                    </div>
                    <div className="text-sm">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")} × {item.quantity}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Camera className="h-4 w-4 text-amber-600" /> QC photos
            </h2>
            {qcs.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">None uploaded.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {qcs.map((qc) => (
                  <li key={qc.id} className="flex items-center justify-between">
                    <span>{qc.caption ?? "QC photo"}</span>
                    <Badge className={qc.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                      {qc.approved ? "Approved" : "Pending"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {shipments.length > 0 && (
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h2 className="font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-600" /> Shipment
              </h2>
              <div className="mt-3 text-sm space-y-1">
                {shipments.map((s) => (
                  <div key={s.id} className="flex justify-between">
                    <span>{s.courier}</span>
                    <span className="font-mono text-xs">{s.trackingNo ?? "Pending"}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="font-semibold text-sm">Assigned shopper</h2>
            <p className="mt-2 text-sm">{shopperName}</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-600" /> Destination
            </h2>
            <p className="mt-2 text-sm">{order.destination || "Not set"}</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-600" /> Charges
            </h2>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><dt>Items</dt><dd>₹{order.subtotal.toLocaleString("en-IN")}</dd></div>
              <div className="flex justify-between"><dt>Service</dt><dd>₹{order.serviceFee.toLocaleString("en-IN")}</dd></div>
              <div className="flex justify-between"><dt>Handling</dt><dd>₹{order.handling.toLocaleString("en-IN")}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>₹{order.shipping.toLocaleString("en-IN")}</dd></div>
              <div className="flex justify-between font-semibold border-t border-zinc-200 dark:border-zinc-700 pt-1">
                <dt>Total</dt>
                <dd>₹{total.toLocaleString("en-IN")}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="font-semibold text-sm">Payments</h2>
            {payments.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">No payment recorded.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.method}</span>
                    <span>
                      ₹{p.amount.toLocaleString("en-IN")} · {p.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
