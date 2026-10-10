import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"

interface AppointmentPayload {
  date?: string
  time?: string
  mode?: string
  language?: string
  purpose?: string
  notes?: string
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "You must be signed in to book an appointment." }, { status: 401 })
  }

  try {
    const { date, time, mode, language, purpose, notes }: AppointmentPayload = await req.json()
    if (!date || !time || !mode || !purpose) {
      return NextResponse.json({ error: "Date, time, mode and purpose are required." }, { status: 400 })
    }

    const appointment = await db.appointment.create({
      data: {
        customerId: session.user.id,
        date,
        time,
        mode: mode as "video" | "app" | "phone",
        language,
        purpose,
        notes,
        timezone: "Asia/Kolkata",
      },
    })

    return NextResponse.json({ ok: true, appointment })
  } catch {
    return NextResponse.json({ error: "Could not book appointment." }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const appointments = await db.appointment.findMany({ customerId: session.user.id })
  return NextResponse.json({ appointments })
}
