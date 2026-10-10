import { CreditCard, DollarSign, Clock, X, CheckCircle } from "lucide-react"
import { db, ORDER_STATUS_LABEL } from "@/lib/db"

const methodLabel = (m: string) => m

export default async function AdminPaymentsPage() {

  const allPayments = await db.payment.findMany()
  const allOrders = await db.order.findMany()
  const customers = await db.user.findMany({ role: "CUSTOMER" })

  const paid = allPayments.filter((p) => p.status === "paid")
  const pending = allOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled")
  const totalValue = paid.reduce((sum, p) => sum + p.amount, 0)
  const orderValue = allOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.subtotal + o.serviceFee + o.handling + o.shipping, 0)

  const customerName = (id: string) => customers.find((u) => u.id === id)?.name ?? "Customer"

  const stats = [
    { label: "Collected", value: `₹${totalValue.toLocaleString("en-IN")}`, icon: CheckCircle, color: "text-emerald-600" },
    { label: "Order value", value: `₹${Math.round(orderValue).toLocaleString("en-IN")}`, icon: DollarSign, color: "text-sky-600" },
    { label: "In progress", value: String(pending.length), icon: Clock, color: "text-amber-600" },
    { label: "Transactions", value: String(allPayments.length), icon: CreditCard, color: "text-purple-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Recorded transactions across Stripe, Razorpay and bank transfer.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">{s.label}</span>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="mt-2 text-2xl font-semibold">{s.value}</div>
            </div>
          )
        })}
      </div>

      {allPayments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No payments recorded yet. Payments are logged when an order is marked paid.
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Payment</th>
                  <th className="text-left px-5 py-3 font-medium">Order</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Amount</th>
                  <th className="text-left px-5 py-3 font-medium">Method</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {allPayments.map((p) => {
                  const order = allOrders.find((o) => o.id === p.orderId)
                  const Icon = p.status === "paid" ? CheckCircle : p.status === "failed" ? X : Clock
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="px-5 py-3 font-mono text-xs">{p.id}</td>
                      <td className="px-5 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {p.orderId}
                        {order && (
                          <span className="ml-2 text-zinc-400">{ORDER_STATUS_LABEL[order.status]}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {order ? customerName(order.customerId) : "—"}
                      </td>
                      <td className="px-5 py-3 font-medium">₹{p.amount.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {methodLabel(p.method)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            p.status === "paid"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : p.status === "failed"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 mr-1" />
                          {p.status}
                        </span>
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
