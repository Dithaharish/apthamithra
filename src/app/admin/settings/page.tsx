import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Globe, Clock, MessageSquare, CreditCard } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Configure business, notifications, and integrations.</p>
      </div>
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4 text-amber-600" /> Business Details</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div><Label>Business Name</Label><Input className="mt-1.5" defaultValue="Apthamithra" /></div>
            <div><Label>Support Email</Label><Input className="mt-1.5" defaultValue="support@apthamithra.com" /></div>
            <div><Label>WhatsApp Number</Label><Input className="mt-1.5" defaultValue="+91 98765 43210" /></div>
            <div><Label>Service Fee (%)</Label><Input className="mt-1.5" type="number" defaultValue="12" /></div>
          </div>
          <div className="mt-4"><Label>Address (India)</Label><Textarea className="mt-1.5" defaultValue="Karol Bagh, New Delhi, Delhi 110005" rows={2} /></div>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-amber-600" /> Appointment Hours</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div><Label>Start Time (IST)</Label><Input className="mt-1.5" defaultValue="08:00" /></div>
            <div><Label>End Time (IST)</Label><Input className="mt-1.5" defaultValue="22:00" /></div>
            <div><Label>Slot Duration (min)</Label><Input className="mt-1.5" type="number" defaultValue="20" /></div>
            <div><Label>Reminder Before (min)</Label><Input className="mt-1.5" type="number" defaultValue="60" /></div>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-amber-600" /> Notifications</h2>
          <div className="mt-4 space-y-3">
            {["Email confirmations", "WhatsApp reminders", "SMS for missed calls", "Push for order updates"].map(n => (
              <div key={n} className="flex items-center justify-between text-sm"><span>{n}</span><Badge className="bg-green-100 text-green-700">Enabled</Badge></div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4 text-amber-600" /> Integrations</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div><Label>Stripe API Key</Label><Input className="mt-1.5" type="password" placeholder="sk_live_..." /></div>
            <div><Label>Razorpay Key ID</Label><Input className="mt-1.5" placeholder="rzp_live_..." /></div>
            <div><Label>SendGrid / Resend API Key</Label><Input className="mt-1.5" type="password" placeholder="re_..." /></div>
            <div><Label>Twilio SID</Label><Input className="mt-1.5" placeholder="AC..." /></div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button className="gap-1.5"><Save className="h-4 w-4" /> Save Changes</Button>
        </div>
      </div>
    </div>
  )
}