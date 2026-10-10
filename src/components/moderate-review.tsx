"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"

export function ModerateReview({ reviewId }: { reviewId: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function decide(status: "approved" | "rejected") {
    setBusy(true)
    setError("")
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reviewId, status }),
    })
    setBusy(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Could not moderate.")
      return
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" onClick={() => decide("approved")} disabled={busy}>
        <ThumbsUp className="h-4 w-4 mr-1" /> Approve
      </Button>
      <Button size="sm" variant="ghost" onClick={() => decide("rejected")} disabled={busy}>
        <ThumbsDown className="h-4 w-4 mr-1" /> Reject
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
