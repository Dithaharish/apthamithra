"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Phone, CheckCircle, X, RefreshCw } from "lucide-react"
import type { AppointmentStatus } from "@/lib/db"

const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ["in_progress", "completed", "cancelled", "rescheduled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  rescheduled: ["scheduled"],
}

const label: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "Call in progress",
  completed: "Completed",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
}

export function AppointmentStatusControl({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string
  currentStatus: AppointmentStatus
}) {
  const [pending, setPending] = useState<AppointmentStatus | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  const options = transitions[currentStatus] ?? []

  async function apply(next: AppointmentStatus) {
    setPending(next)
    setError("")
    const res = await fetch("/api/shopper/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: appointmentId, status: next }),
    })
    setPending(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Could not update status.")
      return
    }
    router.refresh()
  }

  if (options.length === 0) {
    return (
      <span className="text-sm text-zinc-500">
        This appointment is closed ({label[currentStatus]}).
      </span>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const Icon =
            option === "in_progress"
              ? Phone
              : option === "completed"
              ? CheckCircle
              : option === "cancelled"
              ? X
              : RefreshCw

          return (
            <Button
              key={option}
              size="sm"
              variant={option === "in_progress" ? "secondary" : "outline"}
              disabled={pending !== null}
              onClick={() => apply(option)}
            >
              <Icon className="h-4 w-4 mr-1.5" />
              {pending === option ? "Saving..." : `Mark ${label[option]}`}
            </Button>
          )
        })}
      </div>
      <p className="text-xs text-zinc-500">
        Contact mode: {currentStatus === "scheduled" ? "video, app or phone" : "—"}
      </p>
    </div>
  )
}
