"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Store, MapPin, Pencil, Plus } from "lucide-react"
import type { Shop } from "@/lib/db"

const CATEGORIES = ["Sarees", "Textiles", "Sweets", "Snacks", "Groceries", "Ayurveda", "Jewelry", "Religious", "Spices", "Clothing"]

export function ShopManager({ shops }: { shops: Shop[] }) {
  const [rows, setRows] = useState(shops)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const empty = { name: "", city: "", area: "", category: [] as string[], verified: false }
  const [form, setForm] = useState(empty)

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setBusy(true)

    const isEdit = editing !== null
    const res = await fetch("/api/admin/shops", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { id: editing, ...form } : form),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(data.error ?? "Could not save the shop.")
      return
    }

    if (isEdit) {
      setRows((prev) => prev.map((r) => (r.id === editing ? { ...r, ...form } : r)))
    } else if (data.shop) {
      setRows((prev) => [...prev, data.shop])
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

  function startEdit(shop: Shop) {
    setEditing(shop.id)
    setForm({ name: shop.name, city: shop.city, area: shop.area ?? "", category: shop.category, verified: shop.verified })
    setShowForm(true)
    setError("")
  }

  async function toggleVerified(shop: Shop) {
    const res = await fetch("/api/admin/shops", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: shop.id, verified: !shop.verified }),
    })
    if (res.ok) {
      setRows((prev) => prev.map((r) => (r.id === shop.id ? { ...r, verified: !r.verified } : r)))
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{rows.length} shop{rows.length === 1 ? "" : "s"}</p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add shop
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={save} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
          <h3 className="font-semibold">{editing ? "Edit shop" : "New shop"}</h3>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="shop-name">Shop name</Label>
              <Input id="shop-name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="shop-city">City</Label>
              <Input id="shop-city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Kancheepuram" required />
            </div>
          </div>

          <div>
            <Label htmlFor="shop-area">Area (optional)</Label>
            <Input id="shop-area" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="Main Bazaar" />
          </div>

          <fieldset>
            <legend className="text-sm font-medium">Categories</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const on = form.category.includes(cat)
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      set("category", on ? form.category.filter((c) => c !== cat) : [...form.category, cat])
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      on
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:border-amber-400"
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) => set("verified", e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
            />
            Verified shop
          </label>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Create shop"}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancel}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((s) => (
          <div key={s.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Store className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {s.city}{s.area ? `, ${s.area}` : ""}
                  </div>
                </div>
              </div>
              {s.verified && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {s.category.length === 0 ? (
                <span className="text-xs text-zinc-400">No categories</span>
              ) : (
                s.category.map((c) => (
                  <span key={c} className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">{c}</span>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(s)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleVerified(s)}>
                {s.verified ? "Unverify" : "Verify"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
