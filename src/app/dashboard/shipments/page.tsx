
import { Badge } from "@/components/ui/badge"

import { MapPin, CreditCard, Camera, FileText } from "lucide-react"

const timeline = [
  { date: "Oct 8, 2026", time: "10:00", title: "Order confirmed", desc: "Customer approved quotation of ₹48,500", done: true },
  { date: "Oct 9, 2026", time: "11:30", title: "Purchasing started", desc: "Shopper visited Karol Bagh, Delhi — 8 items", done: true },
  { date: "Oct 10, 2026", time: "09:00", title: "QC photos uploaded", desc: "5 photos + 2 videos shared for approval", done: true },
  { date: "Oct 11, 2026", time: "14:20", title: "QC Approved", desc: "Customer approved all items", done: true },
  { date: "Oct 12, 2026", time: "08:00", title: "Payment received", desc: "₹48,500 via Stripe", done: true },
  { date: "Oct 13, 2026", time: "15:00", title: "Packed", desc: "Export-grade packing complete", done: true },
  { date: "Oct 14, 2026", time: "09:30", title: "Shipped", desc: "DHL Express — AWB DHL-9876543210", done: true, highlight: true },
  { date: "Oct 16, 2026", time: null, title: "Estimated delivery", desc: "New Jersey, USA", done: false, pending: true },
]

export default function ShipmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Shipments</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Live tracking and customs status.</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">ORD-2026-0101</div>
              <div className="text-xs text-zinc-500">DHL Express • AWB DHL-9876543210</div>
            </div>
            <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">In Transit</Badge>
          </div>
          <div className="mt-6 relative pl-6 space-y-0">
            {timeline.map((t, i) => (
              <div key={i} className="relative pb-6 last:pb-0">
                <div className="absolute -left-[1.35rem] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950" style={{ background: t.done ? t.highlight ? "#0ea5e9" : "#22c55e" : "#d4d4d4" }} />
                {i < timeline.length - 1 && <div className="absolute -left-[1.35rem] top-3 w-px h-full bg-zinc-200 dark:bg-zinc-700" />}
                <div className={t.highlight ? "font-medium" : ""}>
                  {t.date}{t.time ? ` • ${t.time}` : ""} — {t.title}
                  {t.highlight && <Badge className="ml-2 bg-sky-100 text-sky-700 text-[10px]">Current</Badge>}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <div className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-600" /> Destination</div>
            <div className="mt-2 text-sm">New Jersey, USA</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <div className="text-sm font-medium flex items-center gap-2"><CreditCard className="h-4 w-4 text-amber-600" /> Payment</div>
            <div className="mt-2 text-sm">₹48,500 • Paid via Stripe</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <div className="text-sm font-medium flex items-center gap-2"><Camera className="h-4 w-4 text-amber-600" /> QC Approved</div>
            <div className="mt-2 text-sm">5 photos • 2 videos • All approved</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <div className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-amber-600" /> Customs</div>
            <div className="mt-2 text-sm">Declaration prepared • Awaiting clearance</div>
          </div>
        </div>
      </div>
    </div>
  )
}