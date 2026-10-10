import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isUuid } from "@/lib/validate"

/**
 * Public order lookup by tracking number or order id.
 *
 * Deliberately returns a minimal, non-sensitive view — no customer name, email,
 * address or payment details. Anyone with a tracking number can see where a
 * parcel is, which is what couriers offer too.
 */
export async function GET(req: NextRequest) {
  const query = (req.nextUrl.searchParams.get("q") ?? "").trim()
  if (!query) {
    return NextResponse.json({ error: "Enter a tracking number or order id." }, { status: 400 })
  }

  // Shipments are looked up by tracking number.
  const shipments = await db.shipment.findMany({})
  const byTracking = shipments.find(
    (s) => s.trackingNo && s.trackingNo.toLowerCase() === query.toLowerCase()
  )

  let order = null
  if (byTracking) {
    order = await db.order.findUnique({ id: byTracking.orderId })
  } else if (isUuid(query)) {
    order = await db.order.findUnique({ id: query })
  }

  if (!order) {
    return NextResponse.json(
      { error: "No shipment found for that reference. Check the number and try again." },
      { status: 404 }
    )
  }

  const shipment = shipments.find((s) => s.orderId === order.id) ?? null
  const items = await db.orderItem.findMany({ orderId: order.id })
  const qcs = await db.qcImage.findMany({ orderId: order.id })

  return NextResponse.json({
    order: {
      id: order.id,
      status: order.status,
      destination: order.destination,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      itemCount: items.reduce((sum, it) => sum + it.quantity, 0),
      qcApproved: qcs.length > 0 && qcs.every((q) => q.approved),
    },
    shipment: shipment
      ? {
          courier: shipment.courier,
          trackingNo: shipment.trackingNo,
          weight: shipment.weight,
          destination: shipment.destination,
          createdAt: shipment.createdAt,
        }
      : null,
  })
}
