
export const instant = false

import { Badge } from "@/components/ui/badge"

import { MapPin, Languages, Star, CheckCircle } from "lucide-react"
import { getShopperContext } from "@/lib/shopper"
import { ShopperAvailabilityToggle } from "@/components/shopper-availability-toggle"
import { ShopperProfileEditor } from "@/components/shopper-profile-editor"

export default async function ShopperProfilePage() {
  const ctx = await getShopperContext()
  if (!ctx) return null

  const { shopper, user } = ctx

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          This is what customers see when your appointment is assigned.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-2xl">
              {shopper.name.slice(0, 1)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{shopper.name}</h2>
              <div className="text-sm text-zinc-500">{user.email}</div>
              <div className="mt-2 flex items-center gap-2">
                {shopper.verified && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Verified
                  </Badge>
                )}
                <span className="text-sm flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> {shopper.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          <ShopperProfileEditor shopper={shopper} />
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-zinc-400" />
            <span>{shopper.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-zinc-400" />
            <span>{shopper.languages.join(", ")}</span>
          </div>
        </div>

        {shopper.bio && (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{shopper.bio}</p>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-semibold">Availability</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Turn this off while you are at the market so new appointments are not
          assigned to you.
        </p>
        <div className="mt-4">
          <ShopperAvailabilityToggle shopperId={shopper.id} available={shopper.available} />
        </div>
      </div>
    </div>
  )
}
