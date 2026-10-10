import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

interface RegisterPayload {
  email?: string
  password?: string
  name?: string
  country?: string
  timezone?: string
  language?: string
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, country, timezone, language }: RegisterPayload = await req.json()
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, name and password are required" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }
    const existing = await db.user.findUnique({ email })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: { email, passwordHash, name, country, timezone, language },
    })
    return NextResponse.json({ ok: true, id: user.id })
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
