"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { LogOut, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Ends the session and lands on the home page.
 *
 * `signOut` from next-auth/react fetches a CSRF token and posts to
 * /api/auth/signout, so the session cookie is cleared server-side rather than
 * just dropped locally. Without that, the middleware would still see a valid
 * token and bounce the user straight back into a protected route.
 */
export function SignOutButton({
  className,
  callbackUrl = "/",
  label = "Sign Out",
}: {
  className?: string
  callbackUrl?: string
  label?: string
}) {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    setBusy(true)
    try {
      await signOut({ callbackUrl, redirect: true })
    } catch {
      // Even if the helper fails, force a client navigation so the user is not
      // stranded on a page they can no longer use.
      router.push(callbackUrl)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={busy}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-60",
        className
      )}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {busy ? "Signing out..." : label}
    </button>
  )
}
