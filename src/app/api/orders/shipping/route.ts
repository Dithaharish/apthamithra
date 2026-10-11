import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { isUuid } from "@/lib/validate"

/**
 * Sets the shipping charge on an order, and the courier and tracking number
 * when the order reaches "shipped".
 *
 * Shipping was previously hardcoded to 0 at creation and could never be
 * changed, so every quotation shown to a customer omitted international
 * freight entirely. Recording the shipment is what makes the customer's
 * Shipments page and the tracking number real.
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
    const { orderId, shipping, weight, courier, trackingNo } = await req.json()

    if (!isUuid(orderId)) {
      return NextResponse.json({ error: "Unknown order." }, { status: 400 })
    }

    const order = await db.order.findUnique({ id: orderId })
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    // A shopper may only act on orders assigned to them.
    if (session.user.role === "SHOPPER") {
      const shopper = await db.shopper.findUnique({ userId: session.user.id })
      if (!shopper || order.shopperId !== shopper.id) {
        return NextResponse.json({ error: "Not your order." }, { status: 403 })
      }
    }

    const patch: Record<string, unknown> = {}

    if (shipping !== undefined) {
      const amount = Number(shipping)
      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json({ error: "Shipping must be zero or more." }, { status: 400 })
      }
      // Shipping cannot be set after the order has already shipped.
      if (order.status === "shipped" || order.status === "delivered") {
        return NextResponse.json({ error: "Shipping is locked once the order has shipped." }, { status: 400 })
      }
      patch.shipping = Math.round(amount)
    }

    if (weight !== undefined) {
      const w = Number(weight)
      if (!Number.isFinite(w) || w <= 0) {
        return NextResponse.json({ error: "Weight must be greater than zero." }, { status: 400 })
      }
      patch.weight = w
    }

    if (courier !== undefined || trackingNo !== undefined) {
      if (order.status !== "shipped") {
        return NextResponse.json({ error: "Courier details are recorded when the order ships." }, { status: 400 })
      }
      const existing = await db.shipment.findMany({ orderId: order.id })
      if (existing.length === 0) {
        const created = await db.shipment.create({
          data: {
            orderId: order.id,
            courier: String(courier ?? "").trim() || "To be confirmed",
            trackingNo: trackingNo ? String(trackingNo).trim() : null,
            weight: weight !== undefined ? Number(weight) : null,
            destination: order.destination,
          },
        })
        return NextResponse.json({ ok: true, shipment: created })
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 })
    }

    const updated = await db.order.update({ id: order.id }, patch)
    return NextResponse.json({ ok: true, order: updated })
  } catch {
    return NextResponse.json({ error: "Could not save the shipping details." }, { status: 500 })
  }
}
