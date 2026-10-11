import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db, type Shopper, type Order, type Appointment } from "@/lib/db"

export interface ShopperContext {
  user: { id: string; email: string | null; name: string | null; role: string }
  shopper: Shopper
}

/**
 * Resolve the signed-in shopper.
 *
 * A profile is never created implicitly. Doing so would silently turn any
 * account that reached this code into staff, which is a privilege-escalation
 * path — a customer whose id leaked through could gain a shopper profile and
 * see other customers' appointments. Staff profiles are created deliberately
 * from the admin panel instead.
 */
export async function getShopperContext(): Promise<ShopperContext | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const shopper = await db.shopper.findUnique({ userId: session.user.id })
  if (!shopper) return null

  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      role: session.user.role,
    },
    shopper,
  }
}

/** Appointments assigned to this shopper, unscheduled work first. */
export async function myAppointments(shopperId: string): Promise<Appointment[]> {
  const all = await db.appointment.findMany({ shopperId })
  return all.filter((a) => a.status !== "cancelled")
}

/** Orders this shopper is responsible for. */
export async function myOrders(shopperId: string): Promise<Order[]> {
  return db.order.findMany({ shopperId })
}

/** Customers this shopper has worked with. */
export async function myCustomers(shopperId: string) {
  const apts = await myAppointments(shopperId)
  const customerIds = Array.from(new Set(apts.map((a) => a.customerId)))
  const customers = await Promise.all(
    customerIds.map(async (customerId) => {
      const user = await db.user.findUnique({ id: customerId })
      const orders = (await myOrders(shopperId)).filter((o) => o.customerId === customerId)
      return { user, appointmentCount: apts.filter((a) => a.customerId === customerId).length, orders }
    })
  )
  return customers.filter((c) => c.user !== null) as Array<{
    user: NonNullable<Awaited<ReturnType<typeof db.user.findUnique>>>
    appointmentCount: number
    orders: Order[]
  }>
}
