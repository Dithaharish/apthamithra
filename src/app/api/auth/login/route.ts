import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

interface LoginPayload {
  email?: string
  password?: string
}

/**
 * Credential verification helper. The actual session is issued by the
 * NextAuth credentials provider mounted at /api/auth/[...nextauth].
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password }: LoginPayload = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    const user = await db.user.findUnique({ email })
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    return NextResponse.json({ ok: true, id: user.id, email: user.email, name: user.name, role: user.role })
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
