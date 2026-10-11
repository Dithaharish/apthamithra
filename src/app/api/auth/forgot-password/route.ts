import { NextRequest, NextResponse } from "next/server"
import { db, randomToken } from "@/lib/db"
import { resetEmail, sendEmail } from "@/lib/email"
import { normalizeEmail } from "@/lib/normalize"

const RESET_TTL_MS = 60 * 60 * 1000 // 1 hour

function baseUrl(req: NextRequest): string {
  return process.env.NEXTAUTH_URL || req.nextUrl.origin
}

/**
 * Step 1 of password reset. Always answers 200 so the response cannot be used
 * to discover which emails have accounts.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    const generic = {
      ok: true,
      message: "If an account exists for that address, a reset link is on its way.",
    }

    const user = await db.user.findUnique({ email: normalizeEmail(email) })
    if (!user || !user.passwordHash) {
      return NextResponse.json(generic)
    }

    const resetToken = randomToken()
    await db.user.update(
      { id: user.id },
      { resetToken, resetExpiresAt: new Date(Date.now() + RESET_TTL_MS) } as never
    )

    const link = `${baseUrl(req)}/reset-password?token=${resetToken}`
    await sendEmail({ to: user.email, ...resetEmail(user.name ?? "there", link) })

    return NextResponse.json(generic)
  } catch {
    // Never leak whether the failure was the lookup or the send.
    return NextResponse.json({
      ok: true,
      message: "If an account exists for that address, a reset link is on its way.",
    })
  }
}
