import Link from "next/link"
export const instant = false


import { Badge } from "@/components/ui/badge"
import { MapPin, Store, Package, Truck, Camera, DollarSign } from "lucide-react"
import { getShopperContext } from "@/lib/shopper"
import { db } from "@/lib/db"
import { ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/order-status"
import { ShopperOrderActions } from "@/components/shopper-order-actions"

export default async function ShopperOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const ctx = await getShopperContext()
  if (!ctx) return null

  const order = await db.order.findUnique({ id })
  // Scope to the calling shopper. Answering 404 rather than 403 avoids
  // confirming which order ids exist.
  if (!order || order.shopperId !== ctx.shopper.id) {
    return <p className="text-sm text-zinc-500">Order not found.</p>
  }

  const customer = await db.user.findUnique({ id: order.customerId })
  const items = await db.orderItem.findMany({ orderId: id })
  const qcs = await db.qcImage.findMany({ orderId: id })
  const shopList = await db.shop.findMany()
  const shopName = (fallback: string | null) =>
    (order.shopId && shopList.find((s) => s.id === order.shopId)?.name) ||
    fallback ||
    "Not set"

  const total = order.subtotal + order.serviceFee + order.handling + order.shipping
  const currentIndex = ORDER_FLOW.indexOf(order.status)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/shopper/orders" className="text-sm text-amber-600 hover:underline">
          ← Back to orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{order.id}</h1>
            <p className="text-sm text-zinc-500">
              {customer?.name ?? "Customer"} · {customer?.country ?? "—"}
            </p>
          </div>
          <Badge>{ORDER_STATUS_LABEL[order.status]}</Badge>
        </div>
      </div>

      {currentIndex >= 0 && (
        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold text-sm">Progress</h2>
          <ol className="mt-4 flex flex-wrap gap-y-3 gap-x-6">
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
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-600" /> Items
            </h2>
            {items.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No items recorded.</p>
            ) : (
              <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((item) => (
                  <li key={item.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-1">
                        <Store className="h-3 w-3" /> {shopName(item.shopName)}
                      </div>
                    </div>
                    <div className="text-sm text-right">
                      <div>₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                      <div className="text-xs text-zinc-500">x{item.quantity}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Camera className="h-4 w-4 text-amber-600" /> Quality check
            </h2>
            {qcs.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                No QC photos uploaded yet. Capture 3–5 photos plus a short video
                before anything ships.
              </p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {qcs.map((qc) => (
                  <li key={qc.id} className="flex items-center justify-between">
                    <span>{qc.caption ?? "QC photo"}</span>
                    <Badge className={qc.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                      {qc.approved ? "Approved" : "Awaiting approval"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-600" /> Charges
            </h2>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><dt>Items</dt><dd>₹{order.subtotal.toLocaleString("en-IN")}</dd></div>
              <div className="flex justify-between"><dt>Service (12%)</dt><dd>₹{order.serviceFee.toLocaleString("en-IN")}</dd></div>
              <div className="flex justify-between"><dt>Handling</dt><dd>₹{order.handling.toLocaleString("en-IN")}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>₹{order.shipping.toLocaleString("en-IN")}</dd></div>
              <div className="flex justify-between font-semibold border-t border-zinc-200 dark:border-zinc-700 pt-1">
                <dt>Total</dt>
                <dd>₹{total.toLocaleString("en-IN")}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-600" /> Destination
            </h2>
            <p className="mt-2 text-sm">{order.destination || "Not set"}</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-600" /> Actions
            </h2>
            <div className="mt-3">
              <ShopperOrderActions
                orderId={order.id}
                currentStatus={order.status}
                flow={ORDER_FLOW}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
