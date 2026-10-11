"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, Loader2 } from "lucide-react"

export function ShippingForm({ orderId }: { orderId: string }) {
  const [shipping, setShipping] = useState("")
  const [weight, setWeight] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const amount = Number(shipping)
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Enter a shipping amount of zero or more.")
      return
    }
    const w = Number(weight)
    if (!Number.isFinite(w) || w <= 0) {
      setError("Enter the packed weight in kilograms.")
      return
    }

    setBusy(true)
    try {
      const res = await fetch("/api/orders/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, shipping: amount, weight: w }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Could not save the shipping details.")
        return
      }
      router.refresh()
    } catch {
      setError("Could not reach the server. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`ship-amt-${orderId}`} className="text-xs">Shipping charge (₹)</Label>
          <Input
            id={`ship-amt-${orderId}`}
            type="number"
            min={0}
            value={shipping}
            onChange={(e) => setShipping(e.target.value)}
            placeholder="12000"
          />
        </div>
        <div>
          <Label htmlFor={`ship-wt-${orderId}`} className="text-xs">Packed weight (kg)</Label>
          <Input
            id={`ship-wt-${orderId}`}
            type="number"
            min={0.1}
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="8.4"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Truck className="h-4 w-4 mr-1.5" />}
        {busy ? "Saving..." : "Set shipping"}
      </Button>
    </form>
  )
}
