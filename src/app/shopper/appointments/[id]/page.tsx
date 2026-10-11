import Link from "next/link"
export const instant = false

import { Badge } from "@/components/ui/badge"

import { Video, Phone, MessageSquare, Languages, Clock, MapPin, Package } from "lucide-react"
import { getShopperContext } from "@/lib/shopper"
import { db } from "@/lib/db"
import { ORDER_FLOW } from "@/lib/order-status"
import { ShopperOrderActions } from "@/components/shopper-order-actions"
import { AppointmentStatusControl } from "@/components/appointment-status-control"
import { RaiseOrderForm } from "@/components/raise-order-form"

const modeIcon = { video: Video, app: Phone, phone: MessageSquare } as const

export default async function ShopperAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const ctx = await getShopperContext()
  if (!ctx) return null

  const appointment = await db.appointment.findUnique({ id })
  // Scope to the calling shopper. Answering 404 rather than 403 avoids
  // confirming which appointment ids exist.
  if (!appointment || appointment.shopperId !== ctx.shopper.id) {
    return <p className="text-sm text-zinc-500">Appointment not found.</p>
  }

  const customer = await db.user.findUnique({ id: appointment.customerId })
  const address = (await db.address.findMany({ customerId: appointment.customerId }))[0] ?? null
  const relatedOrders = (await db.order.findMany({ appointmentId: id })).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  const items = await Promise.all(
    relatedOrders.map(async (o) => ({
      order: o,
      items: await db.orderItem.findMany({ orderId: o.id }),
    }))
  )

  const ModeIcon = modeIcon[appointment.mode]

  return (
    <div className="space-y-6">
      <div>
        <Link href="/shopper/appointments" className="text-sm text-amber-600 hover:underline">
          ← Back to appointments
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{appointment.purpose}</h1>
            <p className="text-sm text-zinc-500">
              {appointment.date} at {appointment.time} IST
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>
              <ModeIcon className="h-3.5 w-3.5 mr-1" />
              {appointment.mode}
            </Badge>
            <Badge>{appointment.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Call controls */}
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold">Consultation</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Join the call at the scheduled time. Record what the customer wants
              so the order can be raised accurately.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <AppointmentStatusControl
                appointmentId={appointment.id}
                currentStatus={appointment.status}
              />
            </div>
          </section>

          {/* Orders for this appointment */}
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-600" /> Orders from this call
            </h2>
            {items.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                No order raised yet. Create the shopping list below once the call
                is done.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {items.map(({ order, items: orderItems }) => (
                  <div key={order.id} className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{order.id}</span>
                      <span className="text-sm">{order.status}</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm">
                      {orderItems.map((it) => (
                        <li key={it.id} className="flex justify-between">
                          <span>
                            {it.name} x{it.quantity}
                          </span>
                          <span className="text-zinc-500">₹{it.price.toLocaleString("en-IN")}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3">
                      <ShopperOrderActions
                        orderId={order.id}
                        currentStatus={order.status}
                        flow={ORDER_FLOW}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Raise a shopping list */}
          <RaiseOrderForm
            appointmentId={appointment.id}
            customerId={appointment.customerId}
            shopperId={ctx.shopper.id}
            shops={await db.shop.findMany()}
          />
        </div>

        {/* Customer context */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="font-semibold text-sm">Customer</h2>
            <div className="mt-3 text-sm font-medium">{customer?.name ?? "Unknown"}</div>
            <div className="text-xs text-zinc-500">{customer?.email}</div>
            <div className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {customer?.country ?? "—"}
              </div>
              <div className="flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5" /> {appointment.language}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {customer?.timezone ?? "—"}
              </div>
              {address && (
                <div className="flex items-start gap-1.5 pt-1">
                  <MapPin className="h-3.5 w-3.5 mt-0.5" />
                  <span>
                    {address.line1}, {address.city}, {address.country}
                  </span>
                </div>
              )}
            </div>
          </div>

          {appointment.notes && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <h2 className="font-semibold text-sm">Customer notes</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{appointment.notes}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
