import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Truck, Package, Star, Camera, CreditCard } from "lucide-react"

const orders = [
  { id: "ORD-2026-0101", date: "Oct 8, 2026", status: "shipped", total: "₹48,500", tracking: "DHL-9876543210", courier: "DHL Express", items: 8, to: "New Jersey, USA", eta: "Oct 16, 2026", paid: true },
  { id: "ORD-2026-0098", date: "Sep 24, 2026", status: "delivered", total: "₹12,200", tracking: "—", courier: "—", items: 3, to: "London, UK", eta: "Delivered", paid: true },
  { id: "ORD-2026-0087", date: "Sep 5, 2026", status: "qc_pending", total: "₹21,400", tracking: "—", courier: "—", items: 5, to: "Toronto, Canada", eta: "Awaiting QC", paid: false },
  { id: "ORD-2026-0071", date: "Aug 19, 2026", status: "purchasing", total: "₹9,800", tracking: "—", courier: "—", items: 2, to: "Dubai, UAE", eta: "In progress", paid: true },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "Awaiting Confirmation", color: "bg-zinc-100 text-zinc-700", icon: Clock },
  purchasing: { label: "Shopping in Progress", color: "bg-blue-100 text-blue-700", icon: Package },
  qc_pending: { label: "QC Pending Your Approval", color: "bg-amber-100 text-amber-700", icon: Camera },
  qc_approved: { label: "QC Approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  paid: { label: "Payment Confirmed", color: "bg-purple-100 text-purple-700", icon: CreditCard },
  packed: { label: "Packed & Ready", color: "bg-indigo-100 text-indigo-700", icon: Package },
  shipped: { label: "In Transit", color: "bg-sky-100 text-sky-700", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle },
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Track every purchase from market to doorstep.</p>
      </div>
      <div className="space-y-4">
        {orders.map(o => {
          const sc = statusConfig[o.status]
          const Icon = sc.icon
          return (
            <div key={o.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{o.id}</div>
                  <div className="text-xs text-zinc-500">{o.date} • {o.items} items • {o.to}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={sc.color}><Icon className="h-3.5 w-3.5 mr-1" />{sc.label}</Badge>
                  <span className="font-semibold">{o.total}</span>
                </div>
              </div>
              <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3"><div className="text-xs text-zinc-500">Courier</div><div className="font-medium">{o.courier}</div></div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3"><div className="text-xs text-zinc-500">Tracking</div><div className="font-medium font-mono text-xs">{o.tracking}</div></div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3"><div className="text-xs text-zinc-500">ETA</div><div className="font-medium">{o.eta}</div></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/dashboard/shipments"><Button size="sm" variant="outline">View Shipment</Button></Link>
                {o.status === "qc_pending" && <Button size="sm" variant="secondary">Review QC Photos</Button>}
                {o.status === "delivered" && <Button size="sm" variant="ghost" className="gap-1.5"><Star className="h-4 w-4" /> Leave Review</Button>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}