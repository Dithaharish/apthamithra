import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { isUuid } from "@/lib/validate"

const VALID = new Set(["approved", "rejected", "pending"])

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 })
  }

  try {
    const { id, status } = await req.json()
    if (!id || !status) {
      return NextResponse.json({ error: "Review id and status required." }, { status: 400 })
    }
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 })
    }
    if (!VALID.has(status)) {
      return NextResponse.json({ error: "Unknown status." }, { status: 400 })
    }

    const updated = await db.review.update({ id }, { status })
    if (!updated) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 })
    }
    return NextResponse.json({ ok: true, review: updated })
  } catch {
    return NextResponse.json({ error: "Could not moderate review." }, { status: 500 })
  }
}
