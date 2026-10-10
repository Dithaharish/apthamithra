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

export function AssignShopper({
  appointmentId,
  currentShopperId,
  shoppers,
}: {
  appointmentId: string
  currentShopperId: string | null
  shoppers: Array<{ id: string; name: string; city: string }>
}) {
  const [value, setValue] = useState<string>(currentShopperId ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function assign(next: string) {
    setBusy(true)
    setError("")
    setSaved(false)
    const res = await fetch("/api/admin/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, shopperId: next || null }),
    })
    setBusy(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Assignment failed.")
      return
    }
    setValue(next)
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={assign} disabled={busy}>
        <SelectTrigger className="h-8 w-40 text-xs">
          <SelectValue placeholder="Assign shopper" />
        </SelectTrigger>
        <SelectContent>
          {shoppers.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name} — {s.city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {saved && <span className="text-xs text-green-600">Assigned</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
