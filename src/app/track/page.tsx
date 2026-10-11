export const instant = false

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, MapPin, Camera, CheckCircle, Clock, Search } from "lucide-react"
import { db } from "@/lib/db"
import { ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/order-status"
import { isUuid } from "@/lib/validate"

const STAGE_ICON: Record<string, typeof Clock> = {
  pending: Clock,
  purchasing: Package,
  qc_pending: Camera,
  qc_approved: CheckCircle,
  paid: CheckCircle,
  packed: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: Clock,
}

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? "").trim()

  let result: {
    order: { id: string; status: string; destination: string; createdAt: Date; updatedAt: Date; itemCount: number; qcApproved: boolean }
    shipment: { courier: string; trackingNo: string | null; weight: number | null; destination: string; createdAt: Date } | null
  } | null = null
  let notFound = false

  if (query) {
    const shipments = await db.shipment.findMany({})
    const byTracking = shipments.find(
      (s) => s.trackingNo && s.trackingNo.toLowerCase() === query.toLowerCase()
    )
    const order = byTracking
      ? await db.order.findUnique({ id: byTracking.orderId })
      : isUuid(query)
      ? await db.order.findUnique({ id: query })
      : null

    if (!order) {
      notFound = true
    } else {
      const items = await db.orderItem.findMany({ orderId: order.id })
      const qcs = await db.qcImage.findMany({ orderId: order.id })
      const shipment = shipments.find((s) => s.orderId === order.id) ?? null
      result = {
        order: {
          id: order.id,
          status: order.status,
          destination: order.destination,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          itemCount: items.reduce((sum, it) => sum + it.quantity, 0),
          qcApproved: qcs.length > 0 && qcs.every((x) => x.approved),
        },
        shipment: shipment
          ? {
              courier: shipment.courier,
              trackingNo: shipment.trackingNo,
              weight: shipment.weight,
              destination: shipment.destination,
              createdAt: shipment.createdAt,
            }
          : null,
      }
    }
  }

  const currentIndex = result ? ORDER_FLOW.indexOf(result.order.status as never) : -1

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center text-white mx-auto">
            <Truck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Track your order</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Enter the tracking number or order reference we sent you.
          </p>
        </div>

        <form action="/track" method="get" className="mt-8 flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              name="q"
              defaultValue={query}
              placeholder="e.g. DHL-9876543210"
              className="flex h-12 w-full rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="h-12 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 transition-colors"
          >
            Track
          </button>
        </form>

        {notFound && (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-6 text-center">
            <p className="font-medium text-amber-800 dark:text-amber-300">Nothing found for that reference</p>
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
              Check the number and try again. If it still fails, message us on WhatsApp with
              your order reference and we will look it up.
            </p>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-zinc-500">{result.order.id}</div>
                  <div className="text-sm text-zinc-500">
                    Placed {result.order.createdAt.toISOString().split("T")[0]} · {result.order.itemCount} items
                  </div>
                </div>
                <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                  {ORDER_STATUS_LABEL[result.order.status as never]}
                </Badge>
              </div>

              {currentIndex >= 0 && (
                <ol className="mt-6 space-y-4">
                  {ORDER_FLOW.map((stage, i) => {
                    const done = i <= currentIndex
                    const Icon = STAGE_ICON[stage] ?? Clock
                    return (
                      <li key={stage} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            done ? "bg-amber-500 text-white" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <div className={`text-sm font-medium ${done ? "" : "text-zinc-400"}`}>
                            {ORDER_STATUS_LABEL[stage]}
                          </div>
                          {done && i === currentIndex && (
                            <div className="text-xs text-zinc-500">Current stage</div>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>

            {result.shipment ? (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <h2 className="font-semibold flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amber-600" /> Shipment
                </h2>
                <dl className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                    <dt className="text-xs text-zinc-500">Courier</dt>
                    <dd className="font-medium">{result.shipment.courier}</dd>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                    <dt className="text-xs text-zinc-500">Tracking number</dt>
                    <dd className="font-mono text-xs">{result.shipment.trackingNo ?? "Pending"}</dd>
                  </div>
                  {result.shipment.weight && (
                    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                      <dt className="text-xs text-zinc-500">Weight</dt>
                      <dd className="font-medium">{result.shipment.weight} kg</dd>
                    </div>
                  )}
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                    <dt className="text-xs text-zinc-500">Dispatched</dt>
                    <dd className="font-medium">{result.shipment.createdAt.toISOString().split("T")[0]}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-sm text-zinc-500">
                <Package className="h-6 w-6 mx-auto mb-2" />
                Not shipped yet. Tracking appears once your order leaves India.
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h2 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" /> Destination
              </h2>
              <p className="mt-2 text-sm">{result.order.destination || "Not set"}</p>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-zinc-500">
          Full order details are available when you{" "}
          <a href="/login" className="text-amber-600 hover:underline">sign in</a>.
          Values shown exclude your personal and payment details.
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}
