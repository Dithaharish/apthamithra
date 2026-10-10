"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, CheckCircle } from "lucide-react"

const MAX = 5

export function ReviewForm({ orderId }: { orderId: string }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (rating === 0) {
      setError("Please choose a star rating.")
      return
    }
    if (body.trim().length < 10) {
      setError("Please write at least 10 characters.")
      return
    }

    setBusy(true)
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, rating, title, body }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(data.error ?? "Could not submit your review.")
      return
    }
    setDone(true)
    router.refresh()
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 p-5 text-sm">
        <div className="flex items-center gap-2 font-medium text-green-800 dark:text-green-300">
          <CheckCircle className="h-4 w-4" /> Thank you — your review has been submitted
        </div>
        <p className="mt-1 text-green-700 dark:text-green-400">
          It will appear on the site once our team has approved it.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label className="text-sm">Your rating</Label>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: MAX }).map((_, i) => {
            const value = i + 1
            const active = (hover || rating) >= value
            return (
              <button
                key={value}
                type="button"
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                className="p-1 rounded transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <Star className={`h-6 w-6 ${active ? "text-amber-500 fill-amber-500" : "text-zinc-300 dark:text-zinc-600"}`} />
              </button>
            )
          })}
          <span className="ml-2 text-sm text-zinc-500">
            {rating > 0 ? `${rating} of ${MAX}` : "Not rated yet"}
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="review-title">Headline (optional)</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Wedding sarees exceeded expectations"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="review-body">Your review</Label>
        <Textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="How did the shopping, quality checks and delivery go?"
          className="mt-1.5"
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button type="submit" disabled={busy}>
        {busy ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  )
}
