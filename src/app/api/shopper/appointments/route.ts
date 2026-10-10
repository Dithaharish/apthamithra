import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import type { AppointmentStatus } from "@/lib/db"

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "rescheduled",
]

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
      return NextResponse.json({ error: "Appointment id and status required." }, { status: 400 })
    }
    if (!APPOINTMENT_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Unknown status." }, { status: 400 })
    }

    const appointment = await db.appointment.findUnique({ id })
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 })
    }

    // A shopper may only update appointments assigned to them; admins may
    // update any appointment.
    if (session.user.role === "SHOPPER") {
      const shopper = await db.shopper.findUnique({ userId: session.user.id })
      if (!shopper || appointment.shopperId !== shopper.id) {
        return NextResponse.json({ error: "Not your appointment." }, { status: 403 })
      }
    }

    const updated = await db.appointment.update({ id }, { status: status as AppointmentStatus })
    return NextResponse.json({ ok: true, appointment: updated })
  } catch {
    return NextResponse.json({ error: "Could not update appointment." }, { status: 500 })
  }
}
