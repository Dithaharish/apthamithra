"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { User } from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"

/**
 * Sign-in / sign-out controls for the site header.
 *
 * Reads the session client-side so the header can react to auth state without
 * every page having to pass it down. The dashboard sidebars are desktop-only
 * (`hidden lg:block`), so this is also the only way to sign out on a phone.
 */
export function HeaderAuth() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="h-9 w-20" aria-hidden />
  }

  if (session?.user) {
    const home =
      session.user.role === "ADMIN" ? "/admin" : session.user.role === "SHOPPER" ? "/shopper" : "/dashboard"

    return (
      <div className="flex items-center gap-2">
        <Link
          href={home}
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <User className="h-4 w-4" />
          {session.user.name ?? "Account"}
        </Link>
        <SignOutButton
          label="Log out"
          className="w-auto px-3 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30"
        />
      </div>
    )
  }

  return (
    <Link href="/login" className="hidden sm:inline-flex text-sm font-medium px-4 py-2 hover:underline">
      Log in
    </Link>
  )
}
