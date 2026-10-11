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
