"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CheckCircle, AlertTriangle } from "lucide-react"

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Both passwords must match.")
      return
    }

    setBusy(true)
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(data.error ?? "Could not reset your password.")
      return
    }
    setDone(true)
    setTimeout(() => router.push("/login"), 2000)
  }

  if (!token) {
    return (
      <div className="text-center">
        <AlertTriangle className="h-10 w-10 text-amber-600 mx-auto" />
        <p className="mt-3 font-medium">This link is incomplete</p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Use the full link from your email, or request a new one.
        </p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm font-medium text-amber-600 hover:underline">
          Request a new link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
        <p className="mt-3 font-medium">Password updated</p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Taking you to sign in...</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="mt-1.5"
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Updating..." : "Set new password"}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-2xl mx-auto">A</div>
            <h1 className="mt-4 text-2xl font-semibold">Choose a new password</h1>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <Suspense fallback={<p className="text-sm text-zinc-500 text-center">Loading...</p>}>
              <ResetForm />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
