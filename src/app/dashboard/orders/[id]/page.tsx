export const instant = false

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Store, MapPin, DollarSign, Package, Camera, Truck, Star } from "lucide-react"
import { getCustomerContext, getCustomerData, isr, orderTotal, STATUS_STYLE } from "@/lib/customer"
import { db, ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/db"
import { ReviewForm } from "@/components/review-form"
import { QCApproval } from "@/components/qc-approval"

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customer = await getCustomerContext()

  const order = await db.order.findUnique({ id })
  if (!order || order.customerId !== customer.userId) {
    return <p className="text-sm text-zinc-500">Order not found.</p>
  }

  const [items, qcs, shipments, shopList] = await Promise.all([
    db.orderItem.findMany({ orderId: id }),
    db.qcImage.findMany({ orderId: id }),
    db.shipment.findMany({ orderId: id }),
    db.shop.findMany(),
  ])
  const { reviews } = await getCustomerData(customer.userId)
  const myReview = reviews.find((r) => r.orderId === order.id)

  const total = orderTotal(order)
  const currentIndex = ORDER_FLOW.indexOf(order.status)
  const shopName =
    (order.shopId && shopList.find((s) => s.id === order.shopId)?.name) ||
    items[0]?.shopName ||
    "Not set"
  const shipment = shipments[0]

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/orders" className="text-sm text-amber-600 hover:underline">← Back to orders</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold font-mono">{order.id}</h1>
            <p className="text-sm text-zinc-500">Placed {order.createdAt.toISOString().split("T")[0]}</p>
          </div>
          <Badge className={STATUS_STYLE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
        </div>
      </div>

      {currentIndex >= 0 && (
        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold text-sm">Progress</h2>
          <ol className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {ORDER_FLOW.map((stage, i) => (
              <li key={stage} className="flex items-center gap-2 text-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${i <= currentIndex ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />
                <span className={i <= currentIndex ? "font-medium" : "text-zinc-400"}>{ORDER_STATUS_LABEL[stage]}</span>
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
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-zinc-500 inline-flex items-center gap-1">
                        <Store className="h-3 w-3" /> {shopName}
                      </div>
                    </div>
                    <div className="text-sm text-right">
                      <div>{isr(item.price * item.quantity)}</div>
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
                Quality-check photos are shared here before anything is packed.
              </p>
            ) : (
              <>
                <ul className="mt-4 space-y-2 text-sm">
                  {qcs.map((qc) => (
                    <li key={qc.id} className="flex items-center justify-between">
                      <span>{qc.caption ?? "QC photo"}</span>
                      <Badge className={qc.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                        {qc.approved ? "Approved" : "Awaiting your approval"}
                      </Badge>
                    </li>
                  ))}
                </ul>
                {order.status === "qc_pending" && <QCApproval orderId={order.id} />}
              </>
            )}
          </section>

          {order.status === "delivered" && (
            <section id="review" className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h2 className="font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" /> Your review
              </h2>
              {myReview ? (
                <div className="mt-4">
                  {myReview.title && <div className="font-medium">{myReview.title}</div>}
                  <div className="mt-1 flex items-center gap-1 text-amber-500">
                    {"★".repeat(myReview.rating)}
                    <span className="ml-2 text-xs text-zinc-500">({myReview.status})</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{myReview.body}</p>
                </div>
              ) : (
                <div className="mt-4">
                  <ReviewForm orderId={order.id} />
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-600" /> Charges
            </h2>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><dt>Items</dt><dd>{isr(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Service (12%)</dt><dd>{isr(order.serviceFee)}</dd></div>
              <div className="flex justify-between"><dt>Handling</dt><dd>{isr(order.handling)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{isr(order.shipping)}</dd></div>
              <div className="flex justify-between font-semibold border-t border-zinc-200 dark:border-zinc-700 pt-1">
                <dt>Total</dt>
                <dd>{isr(total)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-600" /> Destination
            </h2>
            <p className="mt-2 text-sm">{order.destination || "Not set"}</p>
          </div>

          {shipment && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-600" /> Shipment
              </h2>
              <div className="mt-2 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-zinc-500">Courier</span><span>{shipment.courier}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Tracking</span><span className="font-mono text-xs">{shipment.trackingNo ?? "Pending"}</span></div>
                {shipment.weight && (
                  <div className="flex justify-between"><span className="text-zinc-500">Weight</span><span>{shipment.weight} kg</span></div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
