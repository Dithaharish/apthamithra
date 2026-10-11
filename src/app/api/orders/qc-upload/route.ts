import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { isUuid } from "@/lib/validate"

/**
 * Shopper uploads quality-check photos for an order, then submits it for the
 * customer's approval.
 *
 * There was previously no way to attach QC evidence at all, so every order
 * stayed stuck at "QC awaiting approval" with nothing for the customer to look
 * at, and the customer's approval buttons were hidden whenever the list was
 * empty.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }
  if (session.user.role !== "SHOPPER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Shopper or admin only." }, { status: 403 })
  }

  try {
    const { orderId, captions } = await req.json()

    if (!isUuid(orderId)) {
      return NextResponse.json({ error: "Unknown order." }, { status: 400 })
    }

    const order = await db.order.findUnique({ id: orderId })
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    if (session.user.role === "SHOPPER") {
      const shopper = await db.shopper.findUnique({ userId: session.user.id })
      if (!shopper || order.shopperId !== shopper.id) {
        return NextResponse.json({ error: "Not your order." }, { status: 403 })
      }
    }

    if (!Array.isArray(captions) || captions.length === 0) {
      return NextResponse.json({ error: "Add at least one quality-check photo." }, { status: 400 })
    }
    if (captions.length > 8) {
      return NextResponse.json({ error: "At most 8 photos per submission." }, { status: 400 })
    }

    // QC is collected while shopping, before the customer is asked to approve.
    if (order.status !== "purchasing" && order.status !== "pending") {
      return NextResponse.json(
        { error: `Quality checks are captured while shopping. This order is "${order.status}".` },
        { status: 409 }
      )
    }

    let added = 0
    for (const caption of captions) {
      const text = String(caption ?? "").trim()
      if (!text) continue
      await db.qcImage.create({ data: { orderId: order.id, caption: text, approved: false } })
      added++
    }

    if (added === 0) {
      return NextResponse.json({ error: "Give each photo a caption." }, { status: 400 })
    }

    // Move the order into the customer's approval queue.
    const next: Record<string, unknown> = { status: "qc_pending" }
    const updated = await db.order.update({ id: order.id }, next)

    return NextResponse.json({ ok: true, order: updated, photosAdded: added })
  } catch {
    return NextResponse.json({ error: "Could not save the quality checks." }, { status: 500 })
  }
}
