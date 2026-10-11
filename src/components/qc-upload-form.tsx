"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Loader2, Plus, X } from "lucide-react"

/**
 * Lets the shopper record quality-check evidence for an order and hand it to
 * the customer for approval.
 *
 * Actual image binaries need object storage, which is not configured. Captions
 * are the interim record: they give the customer something to approve against
 * and move the order out of the dead "nothing to approve" state. Swap the
 * caption fields for file inputs once a storage bucket exists.
 */
export function QCUploadForm({ orderId }: { orderId: string }) {
  const [captions, setCaptions] = useState<string[]>([""])
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const router = useRouter()

  function set(i: number, value: string) {
    setCaptions((prev) => prev.map((c, idx) => (idx === i ? value : c)))
  }

  function add() {
    if (captions.length >= 8) return
    setCaptions((prev) => [...prev, ""])
  }

  function remove(i: number) {
    setCaptions((prev) => (prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i)))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const cleaned = captions.map((c) => c.trim()).filter(Boolean)
    if (cleaned.length === 0) {
      setError("Add at least one photo description.")
      return
    }

    setBusy(true)
    try {
      const res = await fetch("/api/orders/qc-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, captions: cleaned }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Could not save the quality checks.")
        return
      }
      setDone(`Sent ${data.photosAdded ?? cleaned.length} item(s) to the customer for approval.`)
      setCaptions([""])
      router.refresh()
    } catch {
      setError("Could not reach the server. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <p className="mt-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3 text-sm text-green-700 dark:text-green-300">
        {done}
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Quality-check evidence</Label>
        <Button type="button" size="sm" variant="ghost" onClick={add} disabled={captions.length >= 8}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add photo
        </Button>
      </div>

      {captions.map((c, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={c}
            onChange={(e) => set(i, e.target.value)}
            placeholder={i === 0 ? "e.g. Front view with shop bill" : "e.g. Weave close-up"}
            aria-label={`Photo ${i + 1} description`}
          />
          {captions.length > 1 && (
            <Button type="button" size="icon" variant="ghost" onClick={() => remove(i)} aria-label={`Remove photo ${i + 1}`}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      <p className="text-xs text-zinc-500">
        3–5 photos plus a short video is the aim. The customer must approve before anything is packed.
      </p>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button type="submit" size="sm" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Camera className="h-4 w-4 mr-1.5" />}
        {busy ? "Sending..." : "Send for customer approval"}
      </Button>
    </form>
  )
}
