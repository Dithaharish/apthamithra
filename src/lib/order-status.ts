/**
 * Order lifecycle vocabulary.
 *
 * Kept separate from `db.ts` on purpose: `db.ts` imports the Supabase client,
 * and pulling it into a client component would bundle the whole data layer into
 * browser JavaScript. Constants that the UI needs live here instead.
 */

export type OrderStatus =
  | "pending"
  | "purchasing"
  | "qc_pending"
  | "qc_approved"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"

export const ORDER_FLOW: OrderStatus[] = [
  "pending",
  "purchasing",
  "qc_pending",
  "qc_approved",
  "paid",
  "packed",
  "shipped",
  "delivered",
]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Awaiting confirmation",
  purchasing: "Shopping in progress",
  qc_pending: "QC awaiting approval",
  qc_approved: "QC approved",
  paid: "Payment confirmed",
  packed: "Packed & ready",
  shipped: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export function nextOrderStatus(current: OrderStatus): OrderStatus | null {
  const index = ORDER_FLOW.indexOf(current)
  if (index < 0 || index === ORDER_FLOW.length - 1) return null
  return ORDER_FLOW[index + 1]
}

/**
 * Shared money constants. Defined here rather than in a route or component so
 * the marketing calculator, the shopper's quotation form and the server all
 * compute the same figure.
 */
export const SERVICE_RATE = 0.12
export const HANDLING = 15

/**
 * Legal order transitions.
 *
 * The normal path is one step forward along ORDER_FLOW. Regressions are
 * explicit: a customer rejecting QC sends the order back to purchasing, and
 * anything not yet delivered or cancelled may be cancelled. Nothing else is
 * allowed — in particular a cancelled order cannot be revived and a pending
 * order cannot be shipped without going through QC and payment.
 */
const ALLOWED_REGRESSIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  qc_pending: ["purchasing"],
  qc_approved: ["qc_pending"],
  paid: ["qc_approved"],
  packed: ["paid"],
  shipped: ["packed"],
  delivered: ["shipped"],
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true
  if (from === "delivered" || from === "cancelled") return false

  // Any non-terminal order may be cancelled.
  if (to === "cancelled") return true

  const regressions = ALLOWED_REGRESSIONS[from] ?? []
  if (regressions.includes(to)) return true

  return nextOrderStatus(from) === to
}
