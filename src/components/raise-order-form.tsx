"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Shop } from "@/lib/db"

interface Row {
  name: string
  shopId: string
  price: string
  quantity: string
}

const EMPTY: Row = { name: "", shopId: "", price: "", quantity: "1" }

export function RaiseOrderForm({
  appointmentId,
  customerId,
  shopperId,
  shops,
}: {
  appointmentId: string
  customerId: string
  shopperId: string
  shops: Shop[]
}) {
  const [rows, setRows] = useState<Row[]>([{ ...EMPTY }])
  const [destination, setDestination] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState<string | null>(null)
  const router = useRouter()

  const SERVICE_RATE = 0.12
  const HANDLING = 15

  function update(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  const valid = rows.filter((r) => r.name.trim() && Number(r.price) > 0)
  const subtotal = valid.reduce((sum, r) => sum + Number(r.price) * Number(r.quantity || 1), 0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (valid.length === 0) {
      setError("Add at least one item with a name and a price.")
      return
    }
    if (!destination.trim()) {
      setError("Enter the shipping destination.")
      return
    }

    setBusy(true)
    const res = await fetch("/api/shopper/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId,
        customerId,
        shopperId,
        destination,
        notes,
        items: valid.map((r) => ({
          name: r.name.trim(),
          shopId: r.shopId || null,
          price: Number(r.price),
          quantity: Number(r.quantity || 1),
        })),
      }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(data.error ?? "Could not create the order.")
      return
    }

    setCreated(data.order?.id ?? null)
    setRows([{ ...EMPTY }])
    setNotes("")
    router.refresh()
  }

  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <h2 className="font-semibold">Raise a shopping list</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Build the quotation from the call. Items, fees and shipping are added
        automatically.
      </p>

      {created && (
        <p className="mt-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 px-3 py-2 text-sm text-green-700 dark:text-green-300">
          Order {created} created and sent to the customer for approval.
        </p>
      )}

      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="grid sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-4">
                <Label className="text-xs">Item</Label>
                <Input
                  value={row.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder="e.g. Silk saree — Kanjivaram"
                />
              </div>
              <div className="sm:col-span-4">
                <Label className="text-xs">Shop</Label>
                <Select value={row.shopId} onValueChange={(v) => update(i, { shopId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select shop" /></SelectTrigger>
                  <SelectContent>
                    {shops.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={row.price}
                  onChange={(e) => update(i, { price: e.target.value })}
                  placeholder="2500"
                />
              </div>
              <div className="sm:col-span-1">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) => update(i, { quantity: e.target.value })}
                />
              </div>
              <div className="sm:col-span-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                  disabled={rows.length === 1}
                  aria-label="Remove item"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, { ...EMPTY }])}>
          + Add item
        </Button>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="destination">Shipping destination</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="New Jersey, USA"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes for the customer</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4 text-sm space-y-1">
          <div className="flex justify-between"><span>Items</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between"><span>Service fee (12%)</span><span>₹{Math.round(subtotal * SERVICE_RATE).toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between"><span>Handling</span><span>₹{subtotal > 0 ? HANDLING : 0}</span></div>
          <div className="flex justify-between font-medium border-t border-zinc-200 dark:border-zinc-700 pt-1">
            <span>Quotation total</span>
            <span>
              ₹{(subtotal + Math.round(subtotal * SERVICE_RATE) + (subtotal > 0 ? HANDLING : 0)).toLocaleString("en-IN")}
            </span>
          </div>
          <p className="pt-1 text-xs text-zinc-500">Shipping is calculated after QC weight.</p>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create order"}
        </Button>
      </form>
    </section>
  )
}
