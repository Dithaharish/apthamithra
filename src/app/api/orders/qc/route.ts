import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { isUuid } from "@/lib/validate"

/**
 * Customer approves (or rejects) the quality-check photos on their order.
 * Approving advances the order from qc_pending to qc_approved.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }

  try {
    const { orderId, approved } = await req.json()
    if (!isUuid(orderId)) {
      return NextResponse.json({ error: "Unknown order." }, { status: 400 })
    }
    if (typeof approved !== "boolean") {
      return NextResponse.json({ error: "approved must be true or false." }, { status: 400 })
    }

    const order = await db.order.findUnique({ id: orderId })
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }
    if (order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Not your order." }, { status: 403 })
    }
    if (order.status !== "qc_pending") {
      return NextResponse.json({ error: "This order is not awaiting QC approval." }, { status: 400 })
    }

    // Mark every QC record with the customer's decision.
    const images = await db.qcImage.findMany({ orderId: order.id })
    for (const image of images) {
      await db.qcImage.update({ id: image.id }, { approved })
    }

    // Approval advances the order; rejection holds it for the shopper.
    const nextStatus = approved ? "qc_approved" : "purchasing"
    const updated = await db.order.update({ id: order.id }, { status: nextStatus })

    return NextResponse.json({ ok: true, order: updated })
  } catch {
    return NextResponse.json({ error: "Could not record your decision." }, { status: 500 })
  }
}
