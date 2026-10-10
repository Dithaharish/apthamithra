import { Badge } from "@/components/ui/badge"
import { ThumbsUp, Star } from "lucide-react"
import { db } from "@/lib/db"
import { ModerateReview } from "@/components/moderate-review"

export default async function AdminReviewsPage() {

  const all = await db.review.findMany()
  const customers = await db.user.findMany({ role: "CUSTOMER" })

  const customerName = (id: string) => customers.find((u) => u.id === id)?.name ?? "Customer"
  const pendingCount = all.filter((r) => r.status === "pending").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          {all.length} review{all.length === 1 ? "" : "s"} · {pendingCount} awaiting moderation
        </p>
      </div>

      {all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No reviews submitted yet. Customers are prompted after delivery.
        </div>
      ) : (
        <div className="space-y-4">
          {all.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{customerName(r.customerId)}</div>
                  <div className="text-xs text-zinc-500">
                    {r.id} · {r.createdAt.toISOString().split("T")[0]}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex text-amber-500 text-sm">
                    <Star className="h-4 w-4 fill-amber-500" /> {r.rating}
                  </span>
                  <Badge
                    className={
                      r.status === "approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : r.status === "rejected"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
              </div>

              {r.title && <div className="mt-3 font-medium">{r.title}</div>}
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{r.body}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <ThumbsUp className="h-3.5 w-3.5" /> {r.helpful} found helpful
                </span>
                {r.status === "pending" ? (
                  <ModerateReview reviewId={r.id} />
                ) : (
                  <span className="text-xs text-zinc-400">Already moderated</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
