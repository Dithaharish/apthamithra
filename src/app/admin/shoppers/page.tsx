import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Languages, CheckCircle, Calendar, Package } from "lucide-react"
import { db } from "@/lib/db"

export default async function AdminShoppersPage() {

  const all = await db.shopper.findMany()
  const appointments = await db.appointment.findMany()
  const orders = await db.order.findMany()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Shoppers</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Your personal-shopping team and their live workload.
        </p>
      </div>

      {all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No shopper profiles yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {all.map((s) => {
            const load = appointments.filter((a) => a.shopperId === s.id).length
            const activeOrders = orders.filter(
              (o) => o.shopperId === s.id && o.status !== "delivered" && o.status !== "cancelled"
            ).length

            return (
              <div
                key={s.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center font-semibold text-amber-700 dark:text-amber-300">
                      {s.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-zinc-500">{s.id}</div>
                    </div>
                  </div>
                  {s.available ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      Available
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      Busy
                    </Badge>
                  )}
                </div>

                <div className="mt-3 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-zinc-400" /> {s.city}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Languages className="h-4 w-4 text-zinc-400" /> {s.languages.join(", ")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> {s.rating.toFixed(1)}
                  </div>
                  {s.verified && (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle className="h-4 w-4" /> Verified
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <Calendar className="h-3 w-3 mr-1" />
                    {load} appointment{load === 1 ? "" : "s"}
                  </Badge>
                  <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <Package className="h-3 w-3 mr-1" />
                    {activeOrders} active order{activeOrders === 1 ? "" : "s"}
                  </Badge>
                </div>

                {s.bio && <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{s.bio}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
