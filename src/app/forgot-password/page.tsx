"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MailCheck } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    // We show the same confirmation regardless, so the response is not a
    // way to test whether an address has an account.
    setBusy(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-2xl mx-auto">A</div>
            <h1 className="mt-4 text-2xl font-semibold">Reset your password</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400 text-sm">
              We&apos;ll email you a link to set a new one.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            {sent ? (
              <div className="text-center">
                <MailCheck className="h-10 w-10 text-green-600 mx-auto" />
                <p className="mt-3 font-medium">Check your inbox</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  If an account exists for <strong>{email}</strong>, a reset link is on its way. The link
                  expires in one hour.
                </p>
                <Link href="/login" className="mt-4 inline-block text-sm font-medium text-amber-600 hover:underline">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Remembered it?{" "}
            <Link href="/login" className="text-amber-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
