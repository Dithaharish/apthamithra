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

  // Never expose the credential material.
  const safeUser = { ...user, passwordHash: undefined }
  return Response.json({ ok: true, authenticated: true, user: safeUser })
}
