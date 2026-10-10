import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/auth"
import { db, type Order, type Appointment, type Shipment, type Review } from "@/lib/db"

export interface CustomerContext {
  userId: string
  name: string
  firstName: string
  email: string | null
  timezone: string | null
  language: string | null
}

/**
 * Resolves the signed-in customer, or redirects to sign-in.
 * Every customer page uses this so there is one place enforcing auth.
 */
export async function getCustomerContext(): Promise<CustomerContext> {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login?callbackUrl=/dashboard")

  const user = await db.user.findUnique({ id: session.user.id })
  if (!user) redirect("/login?callbackUrl=/dashboard")

  return {
    userId: user.id,
    name: user.name ?? "there",
    firstName: (user.name ?? "there").split(" ")[0],
    email: user.email,
    timezone: user.timezone,
    language: user.language,
  }
}

export interface CustomerSnapshot {
  orders: Order[]
  appointments: Appointment[]
  shipments: Shipment[]
  reviews: Review[]
}

export async function getCustomerData(customerId: string): Promise<CustomerSnapshot> {
  const [orders, appointments, shipments, reviews] = await Promise.all([
    db.order.findMany({ customerId }),
    db.appointment.findMany({ customerId }),
    db.shipment.findMany({}),
    db.review.findMany({ customerId }),
  ])

  // Shipments are keyed by order, so keep only this customer's.
  const orderIds = new Set(orders.map((o) => o.id))
  return {
    orders,
    appointments,
    shipments: shipments.filter((s) => orderIds.has(s.orderId)),
    reviews,
  }
}

export function orderTotal(order: Order): number {
  return order.subtotal + order.serviceFee + order.handling + order.shipping
}

export function isr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`
}

export const STATUS_STYLE: Record<string, string> = {
  pending: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  purchasing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  qc_pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  qc_approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  paid: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  packed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  shipped: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

/** Items per order, for counts on list rows. */
export async function itemsByOrder(orderIds: string[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  await Promise.all(
    orderIds.map(async (id) => {
      const items = await db.orderItem.findMany({ orderId: id })
      counts[id] = items.reduce((sum, it) => sum + it.quantity, 0)
    })
  )
  return counts
}
