export const instant = false

import { ShopManager } from "@/components/admin/shop-manager"
import { db } from "@/lib/db"

export default async function AdminShopsPage() {
  const shops = await db.shop.findMany()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Shops</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Your trusted shop network. Customers can ask for these by name.
        </p>
      </div>
      <ShopManager shops={shops} />
    </div>
  )
}
