import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { isUuid } from "@/lib/validate"

interface ReviewPayload {
  orderId?: string
  rating?: number
  title?: string
  body?: string
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }

  try {
    const { orderId, rating, title, body }: ReviewPayload = await req.json()

    if (!isUuid(orderId)) {
      return NextResponse.json({ error: "Unknown order." }, { status: 400 })
    }

    const parsedRating = Number(rating)
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Rating must be a whole number from 1 to 5." }, { status: 400 })
    }
    if (!body || String(body).trim().length < 10) {
      return NextResponse.json({ error: "Please write at least 10 characters." }, { status: 400 })
    }

    const order = await db.order.findUnique({ id: orderId })
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    // Customers may only review their own orders.
    if (order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Not your order." }, { status: 403 })
    }

    // Only delivered orders are reviewable, and only once.
    if (order.status !== "delivered") {
      return NextResponse.json({ error: "Reviews open once an order is delivered." }, { status: 400 })
    }
    const existing = await db.review.findMany({ orderId: order.id })
    if (existing.some((r) => r.customerId === session.user.id)) {
      return NextResponse.json({ error: "You have already reviewed this order." }, { status: 409 })
    }

    const review = await db.review.create({
      data: {
        customerId: session.user.id,
        orderId: order.id,
        rating: parsedRating,
        title: title ? String(title).trim() : null,
        body: String(body).trim(),
        status: "pending",
        helpful: 0,
      },
    })

    return NextResponse.json({ ok: true, review })
  } catch {
    return NextResponse.json({ error: "Could not submit review." }, { status: 500 })
  }
}
