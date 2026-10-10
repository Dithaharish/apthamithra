import { Badge } from "@/components/ui/badge"
export const instant = false

import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { getShopperContext, myOrders, myCustomers } from "@/lib/shopper"
import { ORDER_STATUS_LABEL } from "@/lib/db"

export default async function ShopperOrdersPage() {
  const ctx = await getShopperContext()
  if (!ctx) return null

  const orders = await myOrders(ctx.shopper.id)
  const customers = await myCustomers(ctx.shopper.id)

  const customerName = (id: string) =>
    customers.find((c) => c.user.id === id)?.user.name ?? "Customer"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Shopping Orders</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Every job you are handling, with its current stage.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No orders yet. Raise one from an appointment page.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-zinc-500">{o.id}</div>
                  <div className="font-medium">{customerName(o.customerId)}</div>
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {o.destination || "Destination pending"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ₹{(o.subtotal + o.serviceFee + o.handling + o.shipping).toLocaleString("en-IN")}
                  </div>
                  <Badge>{ORDER_STATUS_LABEL[o.status]}</Badge>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/shopper/orders/${o.id}`}
                  className="inline-flex items-center gap-1 h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Manage <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
