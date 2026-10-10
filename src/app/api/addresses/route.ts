import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db, type Address } from "@/lib/db"
import { isUuid } from "@/lib/validate"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }
  const addresses = await db.address.findMany({ customerId: session.user.id })
  return NextResponse.json({ addresses })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }

  try {
    const { name, line1, city, state, postal, country, isDefault } = await req.json()

    if (!name || !line1 || !city || !postal || !country) {
      return NextResponse.json(
        { error: "Label, address line, city, postcode and country are required." },
        { status: 400 }
      )
    }

    // A customer can only add addresses to their own account.
    const address = await db.address.create({
      data: {
        customerId: session.user.id,
        name: String(name).trim(),
        line1: String(line1).trim(),
        city: String(city).trim(),
        state: state ? String(state).trim() : null,
        postal: String(postal).trim(),
        country: String(country).trim(),
        isDefault: Boolean(isDefault),
      },
    })

    return NextResponse.json({ ok: true, address })
  } catch {
    return NextResponse.json({ error: "Could not save the address." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }

  try {
    const { id } = await req.json()
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Unknown address." }, { status: 400 })
    }

    const addresses = await db.address.findMany({ customerId: session.user.id })
    const own = addresses.find((a: Address) => a.id === id)
    if (!own) {
      return NextResponse.json({ error: "Not your address." }, { status: 403 })
    }

    const deleted = await db.address.delete({ id })
    if (!deleted) {
      return NextResponse.json({ error: "Address not found." }, { status: 404 })
    }

    return NextResponse.json({ ok: true, id })
  } catch {
    return NextResponse.json({ error: "Could not delete the address." }, { status: 500 })
  }
}
