import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }

  try {
    const { shopperId, available } = await req.json()
    if (typeof available !== "boolean") {
      return NextResponse.json({ error: "available must be true or false." }, { status: 400 })
    }
    if (!shopperId) {
      return NextResponse.json({ error: "shopperId required." }, { status: 400 })
    }

    // A shopper may only change their own availability.
    if (session.user.role !== "ADMIN") {
      const own = await db.shopper.findUnique({ userId: session.user.id })
      if (!own || own.id !== shopperId) {
        return NextResponse.json({ error: "Not allowed." }, { status: 403 })
      }
    }

    const updated = await db.shopper.update({ id: shopperId }, { available })
    return NextResponse.json({ ok: true, shopper: updated })
  } catch {
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 })
  }
}
