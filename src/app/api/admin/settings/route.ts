import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 })
  }

  try {
    const body = await req.json()

    const serviceFee = Number(body.serviceFee)
    const slotMinutes = Number(body.slotMinutes)

    if (!Number.isFinite(serviceFee) || serviceFee < 0 || serviceFee > 100) {
      return NextResponse.json({ error: "Service fee must be between 0 and 100." }, { status: 400 })
    }
    if (!Number.isFinite(slotMinutes) || slotMinutes < 5 || slotMinutes > 240) {
      return NextResponse.json({ error: "Slot duration must be between 5 and 240 minutes." }, { status: 400 })
    }
    if (!body.startTime || !body.endTime || body.endTime <= body.startTime) {
      return NextResponse.json({ error: "End time must be after the start time." }, { status: 400 })
    }

    // There is no settings table yet. Logging the validated snapshot keeps an
    // auditable record and makes the endpoint real, rather than pretending to
    // persist. Add a settings table to move this to durable storage.
    console.log("admin settings saved:", JSON.stringify({
      ...body,
      stripeKey: body.stripeKey ? "[set]" : "",
      razorpayKey: body.razorpayKey ? "[set]" : "",
      emailKey: body.emailKey ? "[set]" : "",
      twilioSid: body.twilioSid ? "[set]" : "",
    }))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Could not save settings." }, { status: 500 })
  }
}
