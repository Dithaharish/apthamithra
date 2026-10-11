"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, ShoppingBag, FileText, Truck, User, Settings } from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/book", label: "Book Appointment", icon: Calendar },
  { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/shipments", label: "Shipments", icon: Truck },
  { href: "/dashboard/quotes", label: "Quotes", icon: FileText },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

export function DashboardNav() {
  const pathname = usePathname()
  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 hidden lg:block">
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Customer Dashboard</div>
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
      <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"><Settings className="h-4 w-4" /> Admin Panel</Link>
        <SignOutButton />
      </div>
    </aside>
  )
}