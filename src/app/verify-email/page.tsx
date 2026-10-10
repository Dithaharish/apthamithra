"use client"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

function Verify() {
  const params = useSearchParams()
  const token = params.get("token") ?? ""
  const missing = token === ""

  const [state, setState] = useState<"working" | "ok" | "error">(missing ? "error" : "working")
  const [message, setMessage] = useState(missing ? "This verification link is incomplete." : "")

  useEffect(() => {
    if (missing) return

    let active = true
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!active) return
        if (ok) {
          setState("ok")
          setMessage(d.message ?? "Your email address is confirmed.")
        } else {
          setState("error")
          setMessage(d.error ?? "This verification link is invalid or has expired.")
        }
      })
      .catch(() => {
        if (!active) return
        setState("error")
        setMessage("Could not verify your email. Please try again.")
      })

    return () => {
      active = false
    }
  }, [token, missing])

  return (
    <div className="text-center">
      {state === "working" && (
        <>
          <Loader2 className="h-10 w-10 text-amber-600 mx-auto animate-spin" />
          <p className="mt-3 font-medium">Confirming your email...</p>
        </>
      )}
      {state === "ok" && (
        <>
          <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
          <p className="mt-3 font-medium">{message}</p>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium text-amber-600 hover:underline">
            Continue to sign in
          </Link>
        </>
      )}
      {state === "error" && (
        <>
          <AlertTriangle className="h-10 w-10 text-amber-600 mx-auto" />
          <p className="mt-3 font-medium">{message}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-amber-600 hover:underline">
            Go to your dashboard
          </Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
            <Suspense fallback={<p className="text-sm text-zinc-500 text-center">Loading...</p>}>
              <Verify />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
