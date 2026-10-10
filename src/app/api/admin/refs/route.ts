import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"

/**
 * Returns a small set of real record ids so tooling and tests do not have to
 * hard-code seeded identifiers. Admin only.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 })
  }

  const [shoppers, customers, appointments, orders, reviews] = await Promise.all([
    db.shopper.findMany(),
    db.user.findMany({ role: "CUSTOMER" }),
    db.appointment.findMany(),
    db.order.findMany(),
    db.review.findMany(),
  ])

  return NextResponse.json({
    refs: {
      shoppers: shoppers.map((s) => s.id),
      customers: customers.map((u) => u.id),
      appointments: appointments.map((a) => a.id),
      orders: orders.map((o) => o.id),
      reviews: reviews.map((r) => r.id),
      // An order that has not been delivered, for testing review guards.
      undeliveredOrder: orders.find((o) => o.status !== "delivered")?.id ?? null,
    },
  })
}
