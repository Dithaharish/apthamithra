export const instant = false

import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock } from "lucide-react"
import { getCustomerContext, getCustomerData, isr, orderTotal, STATUS_STYLE, itemsByOrder } from "@/lib/customer"
import { ORDER_STATUS_LABEL } from "@/lib/order-status"

export default async function CustomerQuotesPage() {
  const customer = await getCustomerContext()
  const { orders } = await getCustomerData(customer.userId)
  const counts = await itemsByOrder(orders.map((o) => o.id))

  // A quotation is an order that has not yet been paid for.
  const quotes = orders.filter((o) => o.status !== "cancelled" && o.shipping === 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Quotes</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Quotations awaiting your approval before anything is purchased.
        </p>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No open quotations right now.
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => (
            <div key={q.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-zinc-500">{q.id}</div>
                  <div className="text-sm text-zinc-500">
                    {q.createdAt.toISOString().split("T")[0]} · {counts[q.id] ?? 0} items
                  </div>
                </div>
                <Badge className={STATUS_STYLE[q.status]}>
                  {q.status === "pending" ? <Clock className="h-3.5 w-3.5 mr-1" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />}
                  {ORDER_STATUS_LABEL[q.status]}
                </Badge>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <div className="text-xs text-zinc-500">Items</div>
                  <div className="font-medium">{isr(q.subtotal)}</div>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <div className="text-xs text-zinc-500">Service (12%)</div>
                  <div className="font-medium">{isr(q.serviceFee)}</div>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <div className="text-xs text-zinc-500">Handling</div>
                  <div className="font-medium">{isr(q.handling)}</div>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
                  <div className="text-xs text-amber-700 dark:text-amber-300">Total so far</div>
                  <div className="font-semibold">{isr(orderTotal(q))}</div>
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-500">
                Shipping is calculated after quality-check weight is confirmed.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
