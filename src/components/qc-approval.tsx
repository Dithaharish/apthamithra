"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw } from "lucide-react"

export function QCApproval({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState<string | null>(null)
  const router = useRouter()

  async function decide(approved: boolean) {
    setBusy(true)
    setError("")
    const res = await fetch("/api/orders/qc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, approved }),
    })
    setBusy(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Could not record your decision.")
      return
    }
    setDone(approved ? "approved" : "rejected")
    router.refresh()
  }

  if (done) {
    return (
      <p className="mt-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3 text-sm">
        {done === "approved"
          ? "Approved. Our team will pack and ship your order."
          : "Sent back. Our shopper will contact you with alternatives."}
      </p>
    )
  }

  return (
    <div className="mt-4 space-y-2">
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <p className="text-sm font-medium">Do these match what you asked for?</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => decide(true)} disabled={busy}>
          <CheckCircle className="h-4 w-4 mr-1.5" /> {busy ? "Saving..." : "Approve and continue"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => decide(false)} disabled={busy}>
          <RotateCcw className="h-4 w-4 mr-1.5" /> Request changes
        </Button>
      </div>
      <p className="text-xs text-zinc-500">Nothing is packed or shipped until you approve.</p>
    </div>
  )
}
