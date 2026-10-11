import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ ok: true, authenticated: false, user: null })
  }
  const user = await db.user.findUnique({ id: session.user.id })
  if (!user) {
    return Response.json({ ok: true, authenticated: false, user: null })
  }

  // Whitelist rather than spreading the row. The user record also holds
  // passwordHash and the live reset / verification tokens, and a reset token is
  // a bearer credential that grants account takeover for the next hour.
  return Response.json({
    ok: true,
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      country: user.country,
      timezone: user.timezone,
      language: user.language,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  })
}
