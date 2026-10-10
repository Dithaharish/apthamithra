import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { isUuid } from "@/lib/validate"

interface ShopperPayload {
  name?: string
  city?: string
  languages?: string[]
  bio?: string
  available?: boolean
  verified?: boolean
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Admin only." }, { status: 403 }) }
  }
  return { session }
}

export async function GET() {
  const gate = await requireAdmin()
  if (gate.error) return gate.error
  const shoppers = await db.shopper.findMany()
  return NextResponse.json({ shoppers })
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (gate.error) return gate.error

  try {
    const body: ShopperPayload = await req.json()
    const { name, city, languages, bio, available, verified } = body

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Shopper name is required." }, { status: 400 })
    }
    if (!city || !String(city).trim()) {
      return NextResponse.json({ error: "City is required." }, { status: 400 })
    }

    const parsedLanguages = Array.isArray(languages)
      ? languages.map((l) => String(l).trim()).filter(Boolean)
      : []
    if (parsedLanguages.length === 0) {
      return NextResponse.json({ error: "Add at least one language." }, { status: 400 })
    }

    const shopper = await db.shopper.create({
      data: {
        userId: gate.session!.user.id,
        name: String(name).trim(),
        city: String(city).trim(),
        languages: parsedLanguages,
        bio: bio ? String(bio).trim() : null,
        available: available ?? true,
        verified: verified ?? false,
      },
    })

    return NextResponse.json({ ok: true, shopper })
  } catch {
    return NextResponse.json({ error: "Could not create the shopper." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin()
  if (gate.error) return gate.error

  try {
    const { id, ...body }: ShopperPayload & { id?: string } = await req.json()
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Unknown shopper." }, { status: 400 })
    }

    const existing = await db.shopper.findUnique({ id })
    if (!existing) {
      return NextResponse.json({ error: "Shopper not found." }, { status: 404 })
    }

    const patch: Partial<typeof existing> = {}
    if (body.name !== undefined) patch.name = String(body.name).trim()
    if (body.city !== undefined) patch.city = String(body.city).trim()
    if (body.languages !== undefined) {
      const langs = Array.isArray(body.languages) ? body.languages.map((l) => String(l).trim()).filter(Boolean) : []
      if (langs.length === 0) {
        return NextResponse.json({ error: "Add at least one language." }, { status: 400 })
      }
      patch.languages = langs
    }
    if (body.bio !== undefined) patch.bio = body.bio ? String(body.bio).trim() : null
    if (body.available !== undefined) patch.available = Boolean(body.available)
    if (body.verified !== undefined) patch.verified = Boolean(body.verified)

    const shopper = await db.shopper.update({ id }, patch)
    return NextResponse.json({ ok: true, shopper })
  } catch {
    return NextResponse.json({ error: "Could not update the shopper." }, { status: 500 })
  }
}
