
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const quotes = [
  { id: "Q-2026-0101", date: "Oct 8, 2026", items: 8, subtotal: "₹42,300", service: "₹5,076", handling: "₹1,100", shipping: "₹12,000", total: "₹60,476", status: "approved" },
  { id: "Q-2026-0098", date: "Sep 24, 2026", items: 3, subtotal: "₹10,500", service: "₹1,260", handling: "₹800", shipping: "₹4,200", total: "₹16,760", status: "approved" },
  { id: "Q-2026-0087", date: "Sep 5, 2026", items: 5, subtotal: "₹18,200", service: "₹2,184", handling: "₹950", shipping: "₹8,500", total: "₹29,834", status: "pending" },
]

const statusColor: Record<string, string> = {
  approved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Quotes</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Review quotations before approving purchases.</p>
      </div>
      <div className="space-y-4">
        {quotes.map(q => (
          <div key={q.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{q.id}</div>
                <div className="text-xs text-zinc-500">{q.date} • {q.items} items</div>
              </div>
              <Badge className={statusColor[q.status]}>{q.status}</Badge>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3"><div className="text-xs text-zinc-500">Items</div><div className="font-medium">{q.subtotal}</div></div>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3"><div className="text-xs text-zinc-500">Service (12%)</div><div className="font-medium">{q.service}</div></div>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3"><div className="text-xs text-zinc-500">Handling</div><div className="font-medium">{q.handling}</div></div>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3"><div className="text-xs text-zinc-500">Shipping</div><div className="font-medium">{q.shipping}</div></div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3"><div className="text-xs text-amber-700 dark:text-amber-300">Total</div><div className="font-semibold">{q.total}</div></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline">View Details</Button>
              {q.status === "pending" && <><Button size="sm" variant="secondary">Approve</Button><Button size="sm" variant="ghost">Request Changes</Button></>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}