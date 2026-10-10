import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { isUuid } from "@/lib/validate"

interface ShopPayload {
  name?: string
  city?: string
  area?: string
  category?: string[]
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
  const shops = await db.shop.findMany()
  return NextResponse.json({ shops })
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (gate.error) return gate.error

  try {
    const { name, city, area, category, verified }: ShopPayload = await req.json()

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Shop name is required." }, { status: 400 })
    }
    if (!city || !String(city).trim()) {
      return NextResponse.json({ error: "City is required." }, { status: 400 })
    }

    const categories = Array.isArray(category)
      ? category.map((c) => String(c).trim()).filter(Boolean)
      : []

    const shop = await db.shop.create({
      data: {
        name: String(name).trim(),
        city: String(city).trim(),
        area: area ? String(area).trim() : null,
        category: categories,
        verified: Boolean(verified),
      },
    })

    return NextResponse.json({ ok: true, shop })
  } catch {
    return NextResponse.json({ error: "Could not create the shop." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin()
  if (gate.error) return gate.error

  try {
    const { id, ...body }: ShopPayload & { id?: string } = await req.json()
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Unknown shop." }, { status: 400 })
    }

    const existing = await db.shop.findMany()
    if (!existing.some((s) => s.id === id)) {
      return NextResponse.json({ error: "Shop not found." }, { status: 404 })
    }

    const patch: Record<string, unknown> = {}
    if (body.name !== undefined) patch.name = String(body.name).trim()
    if (body.city !== undefined) patch.city = String(body.city).trim()
    if (body.area !== undefined) patch.area = body.area ? String(body.area).trim() : null
    if (body.category !== undefined) {
      patch.category = Array.isArray(body.category)
        ? body.category.map((c) => String(c).trim()).filter(Boolean)
        : []
    }
    if (body.verified !== undefined) patch.verified = Boolean(body.verified)

    const shop = await db.shop.update({ id }, patch)
    return NextResponse.json({ ok: true, shop })
  } catch {
    return NextResponse.json({ error: "Could not update the shop." }, { status: 500 })
  }
}
