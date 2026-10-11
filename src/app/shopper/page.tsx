import { Badge } from "@/components/ui/badge"
export const instant = false


import Link from "next/link"
import {
  Calendar,
  Phone,
  Video,
  MessageSquare,
  ShoppingBag,
  Clock,
  MapPin,
  Languages,
  Star,
  ArrowRight,
} from "lucide-react"
import { getShopperContext, myAppointments, myOrders, myCustomers } from "@/lib/shopper"
import { ORDER_STATUS_LABEL } from "@/lib/order-status"

const modeIcon = { video: Video, app: Phone, phone: MessageSquare } as const

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}

export default async function ShopperDashboardPage() {
  const ctx = await getShopperContext()
  if (!ctx) return null

  const { shopper } = ctx
  const appointments = await myAppointments(shopper.id)
  const orders = await myOrders(shopper.id)
  const customers = await myCustomers(shopper.id)

  const openOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled")
  const liveOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled")
  const upcoming = appointments
    .filter((a) => a.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)
  const todayAppointments = upcoming

  const stats = [
    { label: "Appointments", value: String(appointments.length), icon: Calendar, color: "text-amber-600" },
    { label: "Active orders", value: String(openOrders.length), icon: ShoppingBag, color: "text-sky-600" },
    { label: "Customers", value: String(customers.length), icon: Star, color: "text-purple-600" },
    { label: "Rating", value: shopper.rating.toFixed(1), icon: Star, color: "text-amber-500" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Good to see you, {shopper.name.split(" ")[0]}</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Your assigned appointments and shopping jobs.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {shopper.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Languages className="h-4 w-4" /> {shopper.languages.join(", ")}
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">{s.label}</span>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="mt-2 text-3xl font-semibold">{s.value}</div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm">
        <span className="font-medium">Availability: </span>
        {shopper.available ? (
          <span className="text-green-700 dark:text-green-400">Available for new appointments</span>
        ) : (
          <span className="text-amber-700 dark:text-amber-400">Marked busy — update from My Profile</span>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" /> My schedule
            </h2>
            <Link href="/shopper/appointments" className="text-sm text-amber-600 hover:underline">
              All
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No appointments assigned to you.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {todayAppointments.map((a) => {
                const ModeIcon = modeIcon[a.mode]
                return (
                  <div key={a.id} className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{a.time}</span>
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        <ModeIcon className="h-3.5 w-3.5 mr-1" />
                        {a.mode}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{a.purpose}</div>
                    <div className="mt-1 text-xs text-zinc-500">Language: {a.language}</div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-amber-600" /> Active shopping jobs
            </h2>
            <Link href="/shopper/orders" className="text-sm text-amber-600 hover:underline">
              All
            </Link>
          </div>
          {liveOrders.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No active orders right now.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {liveOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{o.id}</span>
                    <span className="text-sm font-medium">
                      {inr(o.subtotal + o.serviceFee + o.handling + o.shipping)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">{ORDER_STATUS_LABEL[o.status]}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" /> Upcoming appointments
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">Nothing booked yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {upcoming.map((a) => {
              const ModeIcon = modeIcon[a.mode]
              return (
                <div key={a.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <ModeIcon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{a.purpose}</div>
                      <div className="text-xs text-zinc-500">
                        {a.date} • {a.time} IST • {a.language}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/shopper/appointments/${a.id}`}
                    className="inline-flex items-center gap-1 h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
