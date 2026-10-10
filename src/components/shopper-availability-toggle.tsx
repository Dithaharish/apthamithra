"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

export function ShopperAvailabilityToggle({
  shopperId,
  available,
}: {
  shopperId: string
  available: boolean
}) {
  const [current, setCurrent] = useState(available)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function toggle(next: boolean) {
    setBusy(true)
    setError("")
    const res = await fetch("/api/shopper/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopperId, available: next }),
    })
    setBusy(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Could not update availability.")
      return
    }
    setCurrent(next)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={current ? "secondary" : "outline"}
          onClick={() => toggle(true)}
          disabled={busy || current}
        >
          <CheckCircle className="h-4 w-4 mr-1.5" /> Available
        </Button>
        <Button
          size="sm"
          variant={!current ? "secondary" : "outline"}
          onClick={() => toggle(false)}
          disabled={busy || !current}
        >
          <XCircle className="h-4 w-4 mr-1.5" /> Busy at market
        </Button>
      </div>
      <p className="text-xs text-zinc-500">
        Currently: {current ? "available for new appointments" : "marked busy"}
      </p>
    </div>
  )
}
