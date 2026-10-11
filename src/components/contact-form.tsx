"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Loader2, Send } from "lucide-react"

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // Client-side check first; the API validates the same rules regardless.
    if (form.name.trim().length < 2) {
      setError("Please tell us your name.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("A valid email address is required.")
      return
    }
    if (form.message.trim().length < 10) {
      setError("Please write at least 10 characters.")
      return
    }

    setBusy(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Could not send your message.")
        return
      }
      setSent(true)
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch {
      setError("Could not reach the server. Please check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 p-6 text-center">
        <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
        <p className="mt-3 font-medium text-green-800 dark:text-green-300">Message sent</p>
        <p className="mt-2 text-sm text-green-700 dark:text-green-400">
          We have your enquiry and will reply to your email shortly.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setSent(false)}>
          Send another
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      <div>
        <Label htmlFor="c-name">Name</Label>
        <Input id="c-name" className="mt-1.5" value={form.name} onChange={(e) => set("name", e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="c-email">Email</Label>
        <Input id="c-email" type="email" className="mt-1.5" value={form.email} onChange={(e) => set("email", e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="c-subject">Subject</Label>
        <Input id="c-subject" className="mt-1.5" value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Optional" />
      </div>
      <div>
        <Label htmlFor="c-message">Message</Label>
        <Textarea id="c-message" rows={5} className="mt-1.5" value={form.message} onChange={(e) => set("message", e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
        {busy ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
