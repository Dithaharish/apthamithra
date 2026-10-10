"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Calendar, ShoppingBag, Star, MessageSquare, Settings, DollarSign, ClipboardList, Package } from "lucide-react"

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/shoppers", label: "Shoppers", icon: Star },
  { href: "/admin/shops", label: "Shops", icon: Package },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/shopper", label: "Shopper workspace", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 hidden lg:block">
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Admin Panel</div>
      <nav className="space-y-1">
        {items.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", active ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800")}>
              <Icon className="h-4 w-4" /> {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}