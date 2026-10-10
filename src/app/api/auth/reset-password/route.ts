import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

/**
 * Step 2 of password reset: consume the token and set a new password.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Reset token is required." }, { status: 400 })
    }
    if (!password || String(password).length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
    }

    const user = await db.user.findByToken("resetToken", token)
    if (!user) {
      return NextResponse.json({ error: "This reset link is invalid or has already been used." }, { status: 400 })
    }
    if (!user.resetExpiresAt || user.resetExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(String(password), 10)

    // Clearing the token makes it single-use.
    await db.user.update(
      { id: user.id },
      { passwordHash, resetToken: null, resetExpiresAt: null } as never
    )

    return NextResponse.json({ ok: true, message: "Your password has been updated. You can now sign in." })
  } catch {
    return NextResponse.json({ error: "Could not reset the password." }, { status: 500 })
  }
}
