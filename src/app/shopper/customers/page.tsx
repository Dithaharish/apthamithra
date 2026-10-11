import { Badge } from "@/components/ui/badge"
export const instant = false


import Link from "next/link"
import { Users, MapPin, Languages, Mail, ShoppingBag } from "lucide-react"
import { getShopperContext, myCustomers } from "@/lib/shopper"
import { ORDER_STATUS_LABEL } from "@/lib/order-status"

export default async function ShopperCustomersPage() {
  const ctx = await getShopperContext()
  if (!ctx) return null

  const customers = await myCustomers(ctx.shopper.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Customers</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          NRIs you have consulted with, including their pending orders.
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No customers assigned yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {customers.map(({ user, appointmentCount, orders }) => (
            <div
              key={user.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center font-medium text-amber-700 dark:text-amber-300">
                  {(user.name ?? "C").slice(0, 1)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{user.name ?? "Customer"}</div>
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {user.email}
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {user.country ?? "—"} · {user.timezone ?? "—"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Languages className="h-3.5 w-3.5" /> {user.language ?? "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <Users className="h-3 w-3 mr-1" />
                  {appointmentCount} appointment{appointmentCount === 1 ? "" : "s"}
                </Badge>
                <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  {orders.length} order{orders.length === 1 ? "" : "s"}
                </Badge>
              </div>

              {orders.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {orders.slice(0, 3).map((o) => (
                    <li key={o.id} className="flex justify-between">
                      <Link href={`/shopper/orders/${o.id}`} className="hover:underline">
                        {o.id}
                      </Link>
                      <span>{ORDER_STATUS_LABEL[o.status]}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
