import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { canTransitionOrder, SERVICE_RATE, HANDLING } from "@/lib/order-status"
import { isUuid } from "@/lib/validate"
import type { OrderStatus } from "@/lib/order-status"

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
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    const order = await db.order.findUnique({ id })
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    // A shopper must be the assigned shopper. An unassigned order belongs to
    // nobody, so it is not writable by any shopper — admins can still assign it.
    if (session.user.role === "SHOPPER") {
      const shopper = await db.shopper.findUnique({ userId: session.user.id })
      if (!shopper || order.shopperId !== shopper.id) {
        return NextResponse.json({ error: "Not your order." }, { status: 403 })
      }
    }

    // Lifecycle is a state machine, not a free choice of status. Without this an
    // order could jump from pending to shipped, skipping QC and payment.
    const next = status as OrderStatus
    if (!canTransitionOrder(order.status, next)) {
      return NextResponse.json(
        { error: `An order cannot go from "${order.status}" to "${next}".` },
        { status: 409 }
      )
    }

    const patch: Partial<typeof order> = { status: next }

    // Reaching "packed" or "shipped" requires a shipping figure, otherwise the
    // customer is quoted a total that omits international freight.
    if (next === "packed" || next === "shipped") {
      if (!order.shipping || order.shipping <= 0) {
        return NextResponse.json(
          { error: "Add a shipping amount before packing or shipping this order." },
          { status: 400 }
        )
      }
    }

    // Record the transaction the moment money is confirmed, so the payments page
    // reflects reality instead of staying empty.
    if (next === "paid") {
      const existing = await db.payment.findMany({ orderId: order.id })
      if (existing.length === 0) {
        await db.payment.create({
          data: {
            orderId: order.id,
            amount: order.subtotal + order.serviceFee + order.handling + order.shipping,
            currency: order.currency,
            method: "Stripe",
            status: "paid",
          },
        })
      }
    }

    const updated = await db.order.update({ id }, patch)
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
    if (!isUuid(customerId)) {
      return NextResponse.json({ error: "Unknown customer." }, { status: 400 })
    }
    if (appointmentId && !isUuid(appointmentId)) {
      return NextResponse.json({ error: "Unknown appointment." }, { status: 400 })
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

    // Validate and normalise every line BEFORE writing anything. Previously the
    // subtotal was computed from the raw submitted values while the insert loop
    // silently dropped non-positive prices and clamped quantities, so a
    // fractional quantity threw mid-way and left an order whose total did not
    // match its own line items.
    const lines = []
    for (const it of items) {
      const price = Number(it.price ?? 0)
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ error: "Every item needs a price greater than zero." }, { status: 400 })
      }
      const rawQty = Number(it.quantity ?? 1)
      if (!Number.isInteger(rawQty) || rawQty < 1) {
        return NextResponse.json({ error: "Item quantity must be a whole number of 1 or more." }, { status: 400 })
      }
      const name = String(it.name ?? "").trim()
      if (!name) {
        return NextResponse.json({ error: "Every item needs a name." }, { status: 400 })
      }
      lines.push({ name, shopName: it.shopName ?? null, price, quantity: rawQty })
    }

    // Subtotal is derived from exactly the rows that will be persisted, so the
    // amount charged always matches the item list shown to the customer.
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
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

    let inserted = 0
    for (const line of lines) {
      await db.orderItem.create({
        data: {
          orderId: order.id,
          name: line.name,
          shopName: line.shopName,
          price: line.price,
          quantity: line.quantity,
          status: "pending",
        },
      })
      inserted++
    }

    return NextResponse.json({ ok: true, order, itemCount: inserted })
  } catch {
    return NextResponse.json({ error: "Could not create order." }, { status: 500 })
  }
}
