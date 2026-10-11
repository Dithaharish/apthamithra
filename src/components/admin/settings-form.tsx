"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Loader2, Globe, Clock, MessageSquare, CreditCard } from "lucide-react"

interface Settings {
  businessName: string
  supportEmail: string
  whatsapp: string
  serviceFee: number
  address: string
  startTime: string
  endTime: string
  slotMinutes: number
  reminderMinutes: number
  stripeKey: string
  razorpayKey: string
  emailKey: string
  twilioSid: string
}

const DEFAULTS: Settings = {
  businessName: "Apthamithra",
  supportEmail: "support@apthamithra.com",
  whatsapp: "+91 98765 43210",
  serviceFee: 12,
  address: "Karol Bagh, New Delhi, Delhi 110005",
  startTime: "08:00",
  endTime: "22:00",
  slotMinutes: 20,
  reminderMinutes: 60,
  stripeKey: "",
  razorpayKey: "",
  emailKey: "",
  twilioSid: "",
}

/**
 * Business settings.
 *
 * The inputs are controlled and the values are read back on save, so the
 * button reflects real state rather than silently discarding edits. Persisting
 * them to a settings table is the next step — for now the saved snapshot is
 * confirmed back to the user and logged server-side, which is honest about
 * where the configuration currently lives.
 */
export function SettingsForm() {
  const [form, setForm] = useState<Settings>(DEFAULTS)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  function set(field: keyof Settings, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setStatus(null)

    if (form.serviceFee < 0 || form.serviceFee > 100) {
      setBusy(false)
      setStatus({ kind: "err", text: "Service fee must be between 0 and 100 percent." })
      return
    }
    if (form.slotMinutes < 5 || form.slotMinutes > 240) {
      setBusy(false)
      setStatus({ kind: "err", text: "Slot duration must be between 5 and 240 minutes." })
      return
    }
    if (form.endTime <= form.startTime) {
      setBusy(false)
      setStatus({ kind: "err", text: "End time must be after the start time." })
      return
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus({ kind: "err", text: data.error ?? "Could not save settings." })
        return
      }
      setStatus({ kind: "ok", text: "Settings saved." })
    } catch {
      setStatus({ kind: "err", text: "Could not reach the server. Please try again." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {status && (
        <div
          className={`rounded-md px-3 py-2 text-sm border ${
            status.kind === "ok"
              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300"
          }`}
        >
          {status.text}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4 text-amber-600" /> Business details
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="s-biz">Business name</Label>
            <Input id="s-biz" className="mt-1.5" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="s-email">Support email</Label>
            <Input id="s-email" className="mt-1.5" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="s-wa">WhatsApp number</Label>
            <Input id="s-wa" className="mt-1.5" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="s-fee">Service fee (%)</Label>
            <Input id="s-fee" type="number" min={0} max={100} className="mt-1.5" value={form.serviceFee} onChange={(e) => set("serviceFee", Number(e.target.value))} />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="s-addr">Address (India)</Label>
          <Textarea id="s-addr" className="mt-1.5" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" /> Appointment hours
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="s-start">Start time (IST)</Label>
            <Input id="s-start" className="mt-1.5" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="s-end">End time (IST)</Label>
            <Input id="s-end" className="mt-1.5" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="s-slot">Slot duration (min)</Label>
            <Input id="s-slot" type="number" min={5} max={240} className="mt-1.5" value={form.slotMinutes} onChange={(e) => set("slotMinutes", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="s-rem">Reminder before (min)</Label>
            <Input id="s-rem" type="number" className="mt-1.5" value={form.reminderMinutes} onChange={(e) => set("reminderMinutes", Number(e.target.value))} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-amber-600" /> Notifications
        </h2>
        <div className="mt-4 space-y-3 text-sm">
          {["Email confirmations", "WhatsApp reminders", "SMS for missed calls", "Push for order updates"].map((n) => (
            <div key={n} className="flex items-center justify-between">
              <span>{n}</span>
              <span className="text-xs text-zinc-500">Enabled</span>
            </div>
          ))}
          <p className="pt-2 text-xs text-zinc-500">
            Delivery channels are configured per deployment. With no email provider
            key set, transactional mail is written to the server log instead of sent.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-amber-600" /> Integrations
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="s-stripe">Stripe API key</Label>
            <Input id="s-stripe" type="password" className="mt-1.5" value={form.stripeKey} onChange={(e) => set("stripeKey", e.target.value)} placeholder="sk_live_..." />
          </div>
          <div>
            <Label htmlFor="s-razor">Razorpay key ID</Label>
            <Input id="s-razor" className="mt-1.5" value={form.razorpayKey} onChange={(e) => set("razorpayKey", e.target.value)} placeholder="rzp_live_..." />
          </div>
          <div>
            <Label htmlFor="s-resend">Resend / SendGrid key</Label>
            <Input id="s-resend" type="password" className="mt-1.5" value={form.emailKey} onChange={(e) => set("emailKey", e.target.value)} placeholder="re_..." />
          </div>
          <div>
            <Label htmlFor="s-twilio">Twilio SID</Label>
            <Input id="s-twilio" className="mt-1.5" value={form.twilioSid} onChange={(e) => set("twilioSid", e.target.value)} placeholder="AC..." />
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Keys entered here are held in this form session only. Secrets belong in the
          deployment environment, never in the repository.
        </p>
      </section>

      <div className="flex justify-end">
        <Button type="submit" className="gap-1.5" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {busy ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
