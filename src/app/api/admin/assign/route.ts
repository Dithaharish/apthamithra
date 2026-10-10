import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { isUuid } from "@/lib/validate"

/**
 * Assign or clear the shopper responsible for an appointment.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 })
  }

  try {
    const { appointmentId, shopperId } = await req.json()
    if (!appointmentId) {
      return NextResponse.json({ error: "appointmentId required." }, { status: 400 })
    }
    if (!isUuid(appointmentId)) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 })
    }

    const appointment = await db.appointment.findUnique({ id: appointmentId })
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 })
    }

    if (shopperId) {
      const shopper = await db.shopper.findUnique({ id: shopperId })
      if (!shopper) {
        return NextResponse.json({ error: "Shopper not found." }, { status: 404 })
      }
    }

    const updated = await db.appointment.update(
      { id: appointmentId },
      { shopperId: shopperId ?? null }
    )
    return NextResponse.json({ ok: true, appointment: updated })
  } catch {
    return NextResponse.json({ error: "Could not assign shopper." }, { status: 500 })
  }
}
