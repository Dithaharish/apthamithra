export const instant = false

import Link from "next/link"
import { Mail, MapPin, Languages, Search, Calendar, ShoppingBag } from "lucide-react"
import { db } from "@/lib/db"

const PAGE_SIZE = 20

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q = "", page = "1" } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  const { rows, total } = await db.user.findPage({ role: "CUSTOMER" }, {
    limit: PAGE_SIZE + 1,
    offset,
    orderBy: { column: "created_at", ascending: false },
    search: { columns: ["name", "email", "country"], term: q },
  })

  const hasMore = rows.length > PAGE_SIZE
  const pageRows = hasMore ? rows.slice(0, PAGE_SIZE) : rows
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const [appointments, orders] = await Promise.all([
    db.appointment.findMany(),
    db.order.findMany(),
  ])

  const qs = (over: Record<string, string | number>) => {
    const params = new URLSearchParams({ q, page: String(currentPage) })
    for (const [k, v] of Object.entries(over)) params.set(k, String(v))
    return `/admin/customers?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          {total} registered NRI customer{total === 1 ? "" : "s"}.
        </p>
      </div>

      <form action="/admin/customers" method="get" className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, email or country..."
            className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button
          type="submit"
          className="h-10 px-5 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 transition-colors"
        >
          Search
        </button>
      </form>

      {pageRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No customers match this search.
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Country</th>
                  <th className="text-left px-5 py-3 font-medium">Language</th>
                  <th className="text-left px-5 py-3 font-medium">Activity</th>
                  <th className="text-left px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {pageRows.map((c) => {
                  const aptCount = appointments.filter((a) => a.customerId === c.id).length
                  const orderCount = orders.filter((o) => o.customerId === c.id).length
                  return (
                    <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center font-medium text-amber-700 dark:text-amber-300 text-xs">
                            {(c.name ?? "C").slice(0, 1)}
                          </div>
                          <div className="font-medium">{c.name ?? "Customer"}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" /> {c.email}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {c.country ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Languages className="h-3.5 w-3.5" /> {c.language ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            <Calendar className="h-3 w-3 mr-1" /> {aptCount}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            <ShoppingBag className="h-3 w-3 mr-1" /> {orderCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {c.createdAt.toISOString().split("T")[0]}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={qs({ page: currentPage - 1 })} className="inline-flex h-9 items-center px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Previous
              </Link>
            )}
            {hasMore && (
              <Link href={qs({ page: currentPage + 1 })} className="inline-flex h-9 items-center px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
