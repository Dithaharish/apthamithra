import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { sendEmail, verificationEmail } from "@/lib/email"

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

    // Mail the verification link. A delivery failure must not fail registration,
    // so the account still exists and the link can be re-sent from the dashboard.
    try {
      const base = new URL(req.url).origin
      const link = `${base}/verify-email?token=${user.verifyToken}`
      await sendEmail({ to: user.email, ...verificationEmail(user.name ?? "there", link) })
    } catch (err) {
      console.error("Verification email failed:", err)
    }

    return NextResponse.json({ ok: true, id: user.id })
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
