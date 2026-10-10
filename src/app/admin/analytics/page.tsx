

import { ShoppingBag, Users, Star, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"

const stats = [
  { label: "Total Orders", value: "1,248", change: "+12%", up: true, icon: ShoppingBag, color: "text-amber-600" },
  { label: "Revenue (INR)", value: "₹48.6L", change: "+18%", up: true, icon: DollarSign, color: "text-emerald-600" },
  { label: "Active Customers", value: "1,842", change: "+8%", up: true, icon: Users, color: "text-sky-600" },
  { label: "Avg Rating", value: "4.9", change: "+0.2", up: true, icon: Star, color: "text-purple-600" },
]

const topCategories = [
  { name: "Sarees & Textiles", orders: 38, revenue: "₹18.4L", growth: "+22%" },
  { name: "Sweets & Groceries", orders: 24, revenue: "₹6.2L", growth: "+15%" },
  { name: "Ayurveda & Herbs", orders: 12, revenue: "₹3.1L", growth: "+30%" },
  { name: "Jewelry", orders: 9, revenue: "₹9.8L", growth: "+18%" },
  { name: "Religious & Festival", orders: 15, revenue: "₹2.4L", growth: "+12%" },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Business performance and trends.</p>
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
              <div className={`mt-1 text-xs flex items-center gap-1 ${s.up ? "text-emerald-600" : "text-red-600"}`}>
                {s.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />} {s.change} this month
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold">Top Categories</h2>
          <div className="mt-5 space-y-4">
            {topCategories.map(c => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-emerald-600 text-xs">{c.growth}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500 mt-1">
                  <span>{c.orders} orders</span>
                  <span>{c.revenue}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(c.orders * 3, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="font-semibold">Country-wise Orders</h2>
          <div className="mt-5 space-y-3">
            {[
              { country: "USA", orders: 48, pct: 38 },
              { country: "UK", orders: 26, pct: 21 },
              { country: "Canada", orders: 18, pct: 14 },
              { country: "UAE", orders: 22, pct: 18 },
              { country: "Australia", orders: 12, pct: 9 },
            ].map(c => (
              <div key={c.country}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.country}</span>
                  <span className="text-zinc-500">{c.orders} orders</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}