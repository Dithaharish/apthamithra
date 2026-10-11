export const instant = false

import Link from "next/link"
import { Badge } from "@/components/ui/badge"

import { MapPin, Languages, Mail, Phone, Clock } from "lucide-react"
import { getCustomerContext } from "@/lib/customer"
import { db } from "@/lib/db"
import { AddressBook } from "@/components/address-book"

export default async function CustomerProfilePage() {
  const customer = await getCustomerContext()
  const user = await db.user.findUnique({ id: customer.userId })
  const addresses = await db.address.findMany({ customerId: customer.userId })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Manage your account and delivery details.</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-2xl">
              {customer.firstName.slice(0, 1)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{customer.name}</h2>
              <div className="text-sm text-zinc-500">{customer.email}</div>
              <div className="mt-2"><Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Active customer</Badge></div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-zinc-400" />
            <span>{user?.country ?? "Not set"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-400" />
            <span className="font-mono text-xs">{user?.timezone ?? "Not set"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-zinc-400" />
            <span>{user?.language ?? "Not set"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-zinc-400" />
            <span>{user?.phone ?? "No phone on file"}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-amber-600" /> Address book
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Where we ship internationally. Addresses inside India are handled by our team.
        </p>
        <div className="mt-4">
          <AddressBook addresses={addresses} />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-semibold">Notifications</h2>
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-zinc-600 dark:text-zinc-400">
            Appointment reminders are sent 24 hours and 1 hour before your slot. Order updates are sent at
            every stage change. Notification channels are configured from the{" "}
            <Link href="/admin/settings" className="text-amber-600 hover:underline">admin settings</Link>.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-6">
        <h2 className="font-semibold flex items-center gap-2">
          <Mail className="h-4 w-4 text-amber-600" /> Signed in as
        </h2>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">{customer.email}</p>
      </div>
    </div>
  )
}
