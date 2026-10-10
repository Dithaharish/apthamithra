export const instant = false

import { ShopperManager } from "@/components/admin/shopper-manager"
import { db } from "@/lib/db"

export default async function AdminShoppersPage() {
  const shoppers = await db.shopper.findMany()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Shoppers</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Your personal-shopping team. Add, edit and manage availability.
        </p>
      </div>
      <ShopperManager shoppers={shoppers} />
    </div>
  )
}
