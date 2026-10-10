import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Bell, Pencil } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Manage your account and preferences.</p>
      </div>
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-2xl">RM</div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Raj Mehta</h2>
            <div className="text-sm text-zinc-500">raj.mehta@email.com</div>
            <div className="mt-2"><Badge className="bg-green-100 text-green-700">Active Customer</Badge></div>
          </div>
          <Button variant="outline" className="gap-1.5"><Pencil className="h-4 w-4" /> Edit</Button>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div><Label>Full Name</Label><Input className="mt-1.5" defaultValue="Raj Mehta" /></div>
          <div><Label>Email</Label><Input className="mt-1.5" defaultValue="raj.mehta@email.com" /></div>
          <div><Label>Phone</Label><Input className="mt-1.5" placeholder="+1 ..." /></div>
          <div><Label>Country</Label><Select defaultValue="USA"><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USA">USA</SelectItem><SelectItem value="UK">UK</SelectItem><SelectItem value="Canada">Canada</SelectItem><SelectItem value="UAE">UAE</SelectItem><SelectItem value="Australia">Australia</SelectItem></SelectContent></Select></div>
          <div><Label>Timezone</Label><Select defaultValue="America/New_York"><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="America/New_York">Eastern</SelectItem><SelectItem value="America/Chicago">Central</SelectItem><SelectItem value="America/Los_Angeles">Pacific</SelectItem><SelectItem value="Europe/London">London</SelectItem><SelectItem value="Asia/Dubai">Dubai</SelectItem><SelectItem value="Australia/Sydney">Sydney</SelectItem><SelectItem value="Asia/Kolkata">India (IST)</SelectItem></SelectContent></Select></div>
          <div><Label>Preferred Language</Label><Select defaultValue="English"><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="English">English</SelectItem><SelectItem value="Hindi">Hindi</SelectItem><SelectItem value="Gujarati">Gujarati</SelectItem><SelectItem value="Tamil">Tamil</SelectItem></SelectContent></Select></div>
        </div>
        <div className="mt-6 flex justify-end"><Button variant="secondary">Save Changes</Button></div>
      </div>
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-600" /> Saved Addresses</h2>
        <div className="mt-4 space-y-3">
          {[
            { name: "Home", line: "123 Oak Street, Apt 4B", city: "New Jersey, USA 07001", default: true },
            { name: "Office", line: "456 Market Street", city: "New York, USA 10001", default: false },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4">
              <div>
                <div className="font-medium flex items-center gap-2">{a.name}{a.default && <Badge className="bg-amber-100 text-amber-700 text-[10px]">Default</Badge>}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{a.line}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{a.city}</div>
              </div>
              <div className="flex gap-2"><Button size="sm" variant="ghost">Edit</Button><Button size="sm" variant="ghost">Delete</Button></div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-4 gap-1.5"><MapPin className="h-4 w-4" /> Add Address</Button>
      </div>
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-amber-600" /> Notifications</h2>
        <div className="mt-4 space-y-3">
          {["Email appointment reminders", "WhatsApp order updates", "SMS for missed calls", "Marketing emails"].map(n => (
            <div key={n} className="flex items-center justify-between text-sm"><span>{n}</span><Badge className="bg-green-100 text-green-700">Enabled</Badge></div>
          ))}
        </div>
      </div>
    </div>
  )
}