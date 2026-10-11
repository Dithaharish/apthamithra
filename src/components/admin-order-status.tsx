"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ORDER_STATUS_LABEL } from "@/lib/order-status"
import type { OrderStatus } from "@/lib/order-status"

export function AdminOrderStatus({
  orderId,
  currentStatus,
  flow,
}: {
  orderId: string
  currentStatus: OrderStatus
  flow: OrderStatus[]
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function change(next: OrderStatus) {
    setBusy(true)
    setError("")
    setSaved(false)
    const res = await fetch("/api/shopper/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: next }),
    })
    setBusy(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Update failed.")
      return
    }
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={currentStatus} onValueChange={(v) => change(v as OrderStatus)} disabled={busy}>
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[...flow, "cancelled" as OrderStatus].map((s) => (
            <SelectItem key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {saved && <span className="text-xs text-green-600">Saved</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
