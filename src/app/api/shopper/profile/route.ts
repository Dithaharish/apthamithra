import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { isUuid } from "@/lib/validate"

interface ProfilePatch {
  shopperId?: string
  available?: boolean
  name?: string
  city?: string
  languages?: unknown
  bio?: unknown
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }

  try {
    const body: ProfilePatch = await req.json()
    const { shopperId, available, name, city, languages, bio } = body

    if (!shopperId || typeof shopperId !== "string") {
      return NextResponse.json({ error: "shopperId required." }, { status: 400 })
    }
    if (!isUuid(shopperId)) {
      return NextResponse.json({ error: "Unknown shopper." }, { status: 400 })
    }

    // Only an admin may edit another shopper's profile.
    if (session.user.role !== "ADMIN") {
      const own = await db.shopper.findUnique({ userId: session.user.id })
      if (!own || own.id !== shopperId) {
        return NextResponse.json({ error: "Not allowed." }, { status: 403 })
      }
    }

    const patch: Record<string, unknown> = {}

    if (available !== undefined) {
      if (typeof available !== "boolean") {
        return NextResponse.json({ error: "available must be true or false." }, { status: 400 })
      }
      patch.available = available
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 })
      }
      patch.name = name.trim()
    }

    if (city !== undefined) {
      if (typeof city !== "string" || !city.trim()) {
        return NextResponse.json({ error: "City cannot be empty." }, { status: 400 })
      }
      patch.city = city.trim()
    }

    if (languages !== undefined) {
      const langs = Array.isArray(languages) ? languages.map((l) => String(l).trim()).filter(Boolean) : []
      if (langs.length === 0) {
        return NextResponse.json({ error: "List at least one language." }, { status: 400 })
      }
      patch.languages = langs
    }

    if (bio !== undefined) {
      patch.bio = bio === null || bio === "" ? null : String(bio).trim()
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 })
    }

    const updated = await db.shopper.update({ id: shopperId }, patch)
    if (!updated) {
      return NextResponse.json({ error: "Shopper not found." }, { status: 404 })
    }
    return NextResponse.json({ ok: true, shopper: updated })
  } catch {
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 })
  }
}
