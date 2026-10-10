"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Pencil, Plus, Languages } from "lucide-react"
import type { Shopper } from "@/lib/db"

const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Gujarati", "Bengali", "Punjabi"]

export function ShopperManager({ shoppers }: { shoppers: Shopper[] }) {
  const [rows, setRows] = useState(shoppers)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const empty = { name: "", city: "", languages: [] as string[], bio: "" }
  const [form, setForm] = useState(empty)

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (form.languages.length === 0) {
      setError("Select at least one language.")
      return
    }

    setBusy(true)
    const isEdit = editing !== null
    const res = await fetch("/api/admin/shoppers", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { id: editing, ...form } : form),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(data.error ?? "Could not save the shopper.")
      return
    }

    if (isEdit) {
      setRows((prev) => prev.map((r) => (r.id === editing ? { ...r, ...form } : r)))
    } else if (data.shopper) {
      setRows((prev) => [...prev, data.shopper])
    }
    cancel()
    router.refresh()
  }

  function cancel() {
    setShowForm(false)
    setEditing(null)
    setForm(empty)
    setError("")
  }

  function startEdit(shopper: Shopper) {
    setEditing(shopper.id)
    setForm({ name: shopper.name, city: shopper.city, languages: shopper.languages, bio: shopper.bio ?? "" })
    setShowForm(true)
    setError("")
  }

  async function toggleAvailable(shopper: Shopper) {
    const res = await fetch("/api/admin/shoppers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: shopper.id, available: !shopper.available }),
    })
    if (res.ok) {
      setRows((prev) => prev.map((r) => (r.id === shopper.id ? { ...r, available: !r.available } : r)))
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{rows.length} shopper{rows.length === 1 ? "" : "s"}</p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add shopper
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={save} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
          <h3 className="font-semibold">{editing ? "Edit shopper" : "New shopper"}</h3>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="s-name">Name</Label>
              <Input id="s-name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="s-city">City</Label>
              <Input id="s-city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Delhi" required />
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-medium flex items-center gap-1.5">
              <Languages className="h-4 w-4" /> Languages
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const on = form.languages.includes(lang)
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() =>
                      set("languages", on ? form.languages.filter((l) => l !== lang) : [...form.languages, lang])
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      on
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:border-amber-400"
                    }`}
                  >
                    {lang}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div>
            <Label htmlFor="s-bio">Short bio</Label>
            <Textarea id="s-bio" rows={2} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Saree & wedding specialist" />
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Create shopper"}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancel}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((s) => (
          <div key={s.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center font-semibold text-amber-700 dark:text-amber-300">
                  {s.name.slice(0, 1)}
                </div>
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-zinc-500">{s.city}</div>
                </div>
              </div>
              {s.available ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Available</Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Busy</Badge>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {s.languages.map((l) => (
                <span key={l} className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">{l}</span>
              ))}
            </div>

            {s.bio && <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{s.bio}</p>}

            {s.verified ? (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600">
                <CheckCircle className="h-3.5 w-3.5" /> Verified
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
                <XCircle className="h-3.5 w-3.5" /> Not verified
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(s)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleAvailable(s)}>
                {s.available ? "Mark busy" : "Mark available"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
