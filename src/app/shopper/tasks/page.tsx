import { Badge } from "@/components/ui/badge"
export const instant = false

import Link from "next/link"
import { ClipboardList, Camera, Truck, Package, CheckCircle } from "lucide-react"
import { getShopperContext, myAppointments, myOrders, myCustomers } from "@/lib/shopper"
import { ORDER_STATUS_LABEL } from "@/lib/db"
import type { OrderStatus } from "@/lib/db"

interface Task {
  id: string
  title: string
  detail: string
  stage: "Consult" | "Purchase" | "Quality" | "Pack & ship"
  href: string
}

const stageMeta = {
  Consult: { icon: ClipboardList, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  Purchase: { icon: Package, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  Quality: { icon: Camera, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  "Pack & ship": { icon: Truck, color: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
} as const

function stageFor(status: OrderStatus): Task["stage"] {
  if (status === "purchasing") return "Purchase"
  if (status === "qc_pending") return "Quality"
  if (status === "paid" || status === "packed" || status === "shipped") return "Pack & ship"
  return "Purchase"
}

export default async function ShopperTasksPage() {
  const ctx = await getShopperContext()
  if (!ctx) return null

  const appointments = await myAppointments(ctx.shopper.id)
  const orders = await myOrders(ctx.shopper.id)
  const customers = await myCustomers(ctx.shopper.id)
  const customerName = (id: string) =>
    customers.find((c) => c.user.id === id)?.user.name ?? "Customer"

  const tasks: Task[] = []

  for (const a of appointments) {
    if (a.status === "scheduled" || a.status === "in_progress") {
      tasks.push({
        id: `task-${a.id}`,
        title: `Consult: ${a.purpose}`,
        detail: `${customerName(a.customerId)} · ${a.date} at ${a.time} IST (${a.mode})`,
        stage: "Consult",
        href: `/shopper/appointments/${a.id}`,
      })
    }
  }

  for (const o of orders) {
    if (o.status === "delivered" || o.status === "cancelled") continue
    tasks.push({
      id: `task-${o.id}`,
      title: `Order ${o.id}`,
      detail: `${customerName(o.customerId)} · ${ORDER_STATUS_LABEL[o.status]}`,
      stage: stageFor(o.status),
      href: `/shopper/orders/${o.id}`,
    })
  }

  const order: Task["stage"][] = ["Consult", "Purchase", "Quality", "Pack & ship"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Task Board</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Everything needing your attention, grouped by stage.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {order.map((stage) => {
          const meta = stageMeta[stage]
          const Icon = meta.icon
          const items = tasks.filter((t) => t.stage === stage)
          return (
            <section
              key={stage}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Icon className="h-4 w-4 text-zinc-500" /> {stage}
                </h2>
                <span className="text-xs text-zinc-500">{items.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-zinc-400">Nothing here</p>
                ) : (
                  items.map((t) => (
                    <Link
                      key={t.id}
                      href={t.href}
                      className="block rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="text-sm font-medium">{t.title}</div>
                      <div className="mt-1 text-xs text-zinc-500">{t.detail}</div>
                      <Badge className={`mt-2 ${meta.color}`}>{stage}</Badge>
                    </Link>
                  ))
                )}
              </div>
            </section>
          )
        })}
      </div>

      {tasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
          All clear. No open tasks.
        </div>
      )}
    </div>
  )
}
