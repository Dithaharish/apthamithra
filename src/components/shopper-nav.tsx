"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SignOutButton } from "@/components/sign-out-button"
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Users,
  ClipboardList,
  Star,
  User as UserIcon,
} from "lucide-react"

const items = [
  { href: "/shopper", label: "Today", icon: LayoutDashboard },
  { href: "/shopper/appointments", label: "Appointments", icon: Calendar },
  { href: "/shopper/orders", label: "Shopping Orders", icon: ShoppingBag },
  { href: "/shopper/customers", label: "My Customers", icon: Users },
  { href: "/shopper/tasks", label: "Task Board", icon: ClipboardList },
  { href: "/shopper/profile", label: "My Profile", icon: UserIcon },
]

export function ShopperNav() {
  const pathname = usePathname()
  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 hidden lg:block">
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
        Shopper Workspace
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="h-4 w-4" /> {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span>Your rating shows to customers</span>
        </div>
        <SignOutButton />
      </div>
    </aside>
  )
}
