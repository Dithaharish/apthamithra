import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Video, Phone, MessageSquare, MapPin, Star, CheckCircle, X, Pencil } from "lucide-react"

const appointments = [
  { id: "APT-2026-0042", date: "Wed, Oct 14, 2026", time: "7:30 PM IST (9:00 AM EST)", mode: "video", purpose: "Wedding sarees for 40 guests", shopper: "Priya — Delhi", status: "scheduled", notes: "Budget ₹2,500/saree" },
  { id: "APT-2026-0039", date: "Wed, Oct 7, 2026", time: "6:00 PM IST", mode: "app", purpose: "Monthly groceries + Diwali sweets", shopper: "Anil — Mumbai", status: "completed", notes: "" },
  { id: "APT-2026-0031", date: "Thu, Oct 2, 2026", time: "10:00 AM IST", mode: "phone", purpose: "Ayurvedic herbs", shopper: "Ravi — Kerala", status: "completed", notes: "" },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  scheduled: { label: "Scheduled", color: "bg-amber-100 text-amber-700", icon: Clock },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: X },
  rescheduled: { label: "Rescheduled", color: "bg-blue-100 text-blue-700", icon: Pencil },
}

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">Manage your consultations.</p>
        </div>
        <Link href="/dashboard/book"><Button variant="secondary">Book New</Button></Link>
      </div>
      <div className="space-y-4">
        {appointments.map(a => {
          const sc = statusConfig[a.status]
          const Icon = sc.icon
          const modeIcon = a.mode === "video" ? Video : a.mode === "app" ? Phone : MessageSquare
          const ModeIcon = modeIcon
          return (
            <div key={a.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{a.id}</div>
                  <div className="text-xs text-zinc-500">{a.date} • {a.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={sc.color}><Icon className="h-3.5 w-3.5 mr-1" />{sc.label}</Badge>
                  <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"><ModeIcon className="h-3.5 w-3.5 mr-1" />{a.mode}</Badge>
                </div>
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-zinc-500">Purpose</div><div className="font-medium">{a.purpose}</div></div>
                <div><div className="text-xs text-zinc-500">Shopper</div><div className="font-medium flex items-center gap-1.5"><MapPin className="h-4 w-4 text-zinc-400" />{a.shopper}</div></div>
              </div>
              {a.notes && <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">📝 {a.notes}</div>}
              <div className="mt-4 flex flex-wrap gap-2">
                {a.status === "scheduled" && <><Button size="sm" variant="secondary">Join Call</Button><Button size="sm" variant="outline">Reschedule</Button><Button size="sm" variant="ghost">Cancel</Button></>}
                {a.status === "completed" && <><Button size="sm" variant="outline">View Summary</Button><Button size="sm" variant="ghost" className="gap-1.5"><Star className="h-4 w-4" /> Rate Shopper</Button></>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}