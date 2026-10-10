import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ShoppingBag, Truck, Star } from "lucide-react"

const stats = [
  { label: "Total Orders", value: "12", icon: ShoppingBag, color: "text-amber-600" },
  { label: "Active Shipments", value: "2", icon: Truck, color: "text-sky-600" },
  { label: "Upcoming Appointments", value: "1", icon: Calendar, color: "text-emerald-600" },
  { label: "Avg Rating", value: "4.9", icon: Star, color: "text-purple-600" },
]

const orders = [
  { id: "ORD-2026-0101", date: "Oct 8, 2026", items: 8, status: "In Transit", total: "₹48,500", tracking: "DHL-9876543210" },
  { id: "ORD-2026-0098", date: "Sep 24, 2026", items: 3, status: "Delivered", total: "₹12,200", tracking: "—", rating: 5 },
  { id: "ORD-2026-0087", date: "Sep 5, 2026", items: 5, status: "QC Pending", total: "₹21,400", tracking: "—", rating: null },
]

const statusColor: Record<string, string> = {
  "In Transit": "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "Delivered": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "QC Pending": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, Raj 👋</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Here is what is happening with your shopping.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">{s.label}</span>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="mt-2 text-3xl font-semibold">{s.value}</div>
            </div>
          )
        })}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <a href="/dashboard/orders" className="text-sm text-amber-600 hover:underline">View all</a>
          </div>
          <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {orders.map(o => (
              <div key={o.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-sm">{o.id}</div>
                  <div className="text-xs text-zinc-500">{o.date} • {o.items} items</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{o.total}</div>
                  <Badge className={statusColor[o.status]}>{o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-amber-600" /> Next Appointment</h2>
          <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
            <div className="text-sm font-medium">Video Consultation</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Wed, Oct 14, 2026</div>
            <div className="mt-2 text-sm flex items-center gap-1.5"><Clock className="h-4 w-4 text-amber-600" /> 7:30 PM IST (9:00 AM EST)</div>
            <div className="mt-3 text-xs text-zinc-500">Purpose: Wedding sarees for 40 guests</div>
            <button className="mt-3 w-full rounded-lg bg-amber-500 text-white text-sm py-2 font-medium">Join Call</button>
          </div>
        </div>
      </div>
    </div>
  )
}