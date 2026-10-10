"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Camera, Truck, Package } from "lucide-react"
import type { OrderStatus } from "@/lib/db"

export function ShopperOrderActions({
  orderId,
  currentStatus,
  flow,
}: {
  orderId: string
  currentStatus: OrderStatus
  flow: OrderStatus[]
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const index = flow.indexOf(currentStatus)
  const next = index >= 0 && index < flow.length - 1 ? flow[index + 1] : null

  async function advance() {
    if (!next) return
    setPending(true)
    setError("")
    const res = await fetch("/api/shopper/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: next }),
    })
    setPending(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Update failed.")
      return
    }
    router.refresh()
  }

  // Generic "mark as" action so operational states can be set directly.
  async function setStatus(status: OrderStatus) {
    setPending(true)
    setError("")
    const res = await fetch("/api/shopper/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status }),
    })
    setPending(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Update failed.")
      return
    }
    router.refresh()
  }

  const Icon =
    next === "purchasing"
      ? Package
      : next === "qc_pending"
      ? Camera
      : next === "shipped"
      ? Truck
      : ArrowRight

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {next && (
          <Button size="sm" variant="secondary" onClick={advance} disabled={pending}>
            <Icon className="h-4 w-4 mr-1.5" />
            {pending ? "Saving..." : `Advance to ${next.replace(/_/g, " ")}`}
          </Button>
        )}
        {currentStatus === "purchasing" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStatus("qc_pending")}
            disabled={pending}
          >
            <Camera className="h-4 w-4 mr-1.5" /> Send for QC approval
          </Button>
        )}
        {(currentStatus === "packed" || currentStatus === "paid") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStatus("shipped")}
            disabled={pending}
          >
            <Truck className="h-4 w-4 mr-1.5" /> Mark shipped
          </Button>
        )}
      </div>
    </div>
  )
}
