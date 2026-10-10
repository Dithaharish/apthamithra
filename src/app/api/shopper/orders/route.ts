import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db, ORDER_FLOW } from "@/lib/db"
import type { OrderStatus } from "@/lib/db"

const SERVICE_RATE = 0.12
const HANDLING = 15

const VALID = new Set<OrderStatus>([...ORDER_FLOW, "cancelled"])

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }
  if (session.user.role !== "SHOPPER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Shopper or admin only." }, { status: 403 })
  }

  try {
    const { id, status } = await req.json()
    if (!id || !status) {
      return NextResponse.json({ error: "Order id and status required." }, { status: 400 })
    }
    if (!VALID.has(status)) {
      return NextResponse.json({ error: "Unknown status." }, { status: 400 })
    }

    const order = await db.order.findUnique({ id })
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    if (session.user.role === "SHOPPER" && order.shopperId) {
      const shopper = await db.shopper.findUnique({ userId: session.user.id })
      if (!shopper || order.shopperId !== shopper.id) {
        return NextResponse.json({ error: "Not your order." }, { status: 403 })
      }
    }

    const updated = await db.order.update({ id }, { status: status as OrderStatus })
    return NextResponse.json({ ok: true, order: updated })
  } catch {
    return NextResponse.json({ error: "Could not update order." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }
  if (session.user.role !== "SHOPPER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Shopper or admin only." }, { status: 403 })
  }

  try {
    const { appointmentId, customerId, destination, notes, items } = await req.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer required." }, { status: 400 })
    }
    if (!destination || !String(destination).trim()) {
      return NextResponse.json({ error: "Destination required." }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item required." }, { status: 400 })
    }

    // Shoppers may only raise orders for themselves.
    let shopperId: string | null = null
    if (session.user.role === "SHOPPER") {
      const shopper = await db.shopper.findUnique({ userId: session.user.id })
      if (!shopper) {
        return NextResponse.json({ error: "No shopper profile for this account." }, { status: 400 })
      }
      shopperId = shopper.id
    }

    const subtotal = items.reduce(
      (sum: number, it: { price?: number; quantity?: number }) =>
        sum + Number(it.price ?? 0) * Number(it.quantity ?? 1),
      0
    )
    if (subtotal <= 0) {
      return NextResponse.json({ error: "Item prices must be greater than zero." }, { status: 400 })
    }

    const serviceFee = Math.round(subtotal * SERVICE_RATE)

    const order = await db.order.create({
      data: {
        customerId,
        shopperId,
        appointmentId: appointmentId ?? null,
        status: "pending",
        subtotal,
        serviceFee,
        handling: HANDLING,
        shipping: 0,
        currency: "INR",
        destination: String(destination).trim(),
        notes: notes ?? null,
      },
    })

    for (const it of items) {
      const price = Number(it.price ?? 0)
      const quantity = Math.max(1, Number(it.quantity ?? 1))
      if (price <= 0) continue
      await db.orderItem.create({
        data: {
          orderId: order.id,
          name: String(it.name ?? "Item").trim() || "Item",
          shopName: it.shopName ?? null,
          price,
          quantity,
          status: "pending",
        },
      })
    }

    return NextResponse.json({ ok: true, order })
  } catch {
    return NextResponse.json({ error: "Could not create order." }, { status: 500 })
  }
}
