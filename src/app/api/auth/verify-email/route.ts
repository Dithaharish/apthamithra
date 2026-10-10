import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * Confirms an email address using the token mailed on registration.
 */
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Verification token is required." }, { status: 400 })
    }

    const user = await db.user.findByToken("verifyToken", token)
    if (!user) {
      return NextResponse.json({ error: "This verification link is invalid." }, { status: 400 })
    }
    if (user.emailVerified) {
      return NextResponse.json({ ok: true, alreadyVerified: true })
    }

    await db.user.update(
      { id: user.id },
      { emailVerified: true, verifyToken: null } as never
    )

    return NextResponse.json({ ok: true, message: "Your email address is confirmed." })
  } catch {
    return NextResponse.json({ error: "Could not verify your email." }, { status: 500 })
  }
}

/**
 * Re-sends the verification link to the signed-in user.
 */
export async function GET(req: NextRequest) {
  const { getServerSession } = await import("next-auth")
  const { authOptions } = await import("@/auth")
  const { verificationEmail, sendEmail } = await import("@/lib/email")
  const { randomToken } = await import("@/lib/db")

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }

  const user = await db.user.findUnique({ id: session.user.id })
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 })
  }
  if (user.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true })
  }

  const verifyToken = randomToken()
  await db.user.update({ id: user.id }, { verifyToken } as never)

  const base = process.env.NEXTAUTH_URL || req.nextUrl.origin
  const link = `${base}/verify-email?token=${verifyToken}`
  await sendEmail({ to: user.email, ...verificationEmail(user.name ?? "there", link) })

  return NextResponse.json({ ok: true, message: "Verification link sent." })
}
