"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalIcon, Clock, Globe2 } from "lucide-react"

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM",
]

export function AppointmentBookingForm() {
  const router = useRouter()
  const { status } = useSession()

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [mode, setMode] = useState("")
  const [lang, setLang] = useState("")
  const [purpose, setPurpose] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Dates are resolved on the client so prerendering does not embed a
  // build-time timestamp.
  const [today, setToday] = useState("")
  const [maxDate, setMaxDate] = useState("")

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setToday(new Date().toISOString().split("T")[0])
      setMaxDate(new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0])
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (status === "unauthenticated") {
      await signIn(undefined, { redirect: false })
      router.push(`/login?next=/book`)
      return
    }

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time, mode, language: lang, purpose, notes }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || "Could not book appointment. Please try again.")
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-950/30 p-8 text-center">
        <div className="text-3xl mb-2">Appointment booked</div>
        <h3 className="font-semibold text-green-800 dark:text-green-300">We will call you at the scheduled time</h3>
        <p className="mt-2 text-sm text-green-700 dark:text-green-400">
          Reminders are sent 24 hours and 1 hour before. Bring your shopping list and any photo references.
        </p>
        <div className="mt-5 inline-block text-left text-sm bg-white dark:bg-zinc-900 rounded-xl border border-green-200 dark:border-green-900 p-4">
          <div><strong>Date:</strong> {date} at {time} IST</div>
          <div><strong>Mode:</strong> {mode}</div>
          <div><strong>Purpose:</strong> {purpose}</div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button variant="secondary" onClick={() => setSubmitted(false)}>Book another</Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {status === "unauthenticated" && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
          You will be asked to sign in or create an account to confirm the booking.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date" className="flex items-center gap-1.5 text-sm">
            <CalIcon className="h-4 w-4" /> Date (IST)
          </Label>
          <Input
            id="date"
            type="date"
            min={today}
            max={maxDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="time" className="flex items-center gap-1.5 text-sm">
            <Clock className="h-4 w-4" /> Time (IST)
          </Label>
          <Select value={time} onValueChange={setTime} required>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select time" /></SelectTrigger>
            <SelectContent>
              {timeSlots.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mode" className="flex items-center gap-1.5 text-sm">
            <Globe2 className="h-4 w-4" /> Mode
          </Label>
          <Select value={mode} onValueChange={setMode} required>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video (Zoom / Google Meet)</SelectItem>
              <SelectItem value="app">App Call</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="lang" className="text-sm">Preferred Language</Label>
          <Select value={lang} onValueChange={setLang} required>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Language" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Gujarati">Gujarati</SelectItem>
              <SelectItem value="Tamil">Tamil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="purpose" className="text-sm">Shopping Purpose</Label>
        <Input
          id="purpose"
          placeholder="e.g. Wedding sarees, Diwali groceries, Ayurveda"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm">Notes / Item List</Label>
        <Textarea
          id="notes"
          placeholder="Share what you need, shop preference, budget, any photo reference..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-1.5"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-zinc-500">Free 20-minute consultation. No commitment.</p>
        <Button type="submit" size="lg" variant="secondary" disabled={loading}>
          {loading ? "Booking..." : "Book Appointment"}
        </Button>
      </div>
    </form>
  )
}
