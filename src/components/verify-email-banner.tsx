"use client"
import { useState } from "react"
import { MailWarning, CheckCircle, Loader2 } from "lucide-react"

export function VerifyEmailBanner() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [message, setMessage] = useState("")

  async function resend() {
    setState("sending")
    setMessage("")
    try {
      const res = await fetch("/api/auth/verify-email")
      const data = await res.json()
      if (!res.ok) {
        setState("error")
        setMessage(data.error ?? "Could not send the link.")
        return
      }
      setState("sent")
      setMessage(data.message ?? "Verification link sent.")
    } catch {
      setState("error")
      setMessage("Could not send the link.")
    }
  }

  if (state === "sent") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 p-4 text-sm">
        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <p className="text-green-800 dark:text-green-300">{message}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-4">
      <div className="flex items-start gap-3 text-sm">
        <MailWarning className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-300">Confirm your email address</p>
          <p className="text-amber-700 dark:text-amber-400">
            Booking an appointment and receiving updates works better once your email is confirmed.
          </p>
          {state === "error" && <p className="mt-1 text-red-600 dark:text-red-400">{message}</p>}
        </div>
      </div>
      <button
        onClick={resend}
        disabled={state === "sending"}
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
      >
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
        {state === "sending" ? "Sending..." : "Resend link"}
      </button>
    </div>
  )
}
