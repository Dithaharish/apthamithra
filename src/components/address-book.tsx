"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import type { Address } from "@/lib/db"

const COUNTRIES = ["USA", "UK", "Canada", "UAE", "Australia", "Germany", "Singapore", "Other"]

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", line1: "", city: "", state: "", postal: "", country: "" })
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const router = useRouter()

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setBusy(true)
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isDefault: addresses.length === 0 }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(data.error ?? "Could not save the address.")
      return
    }
    setForm({ name: "", line1: "", city: "", state: "", postal: "", country: "" })
    setShowForm(false)
    router.refresh()
  }

  async function remove(id: string) {
    setRemoving(id)
    setError("")
    const res = await fetch("/api/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setRemoving(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Could not delete the address.")
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {addresses.length === 0 ? (
        <p className="text-sm text-zinc-500">No addresses saved yet.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {a.name}
                  {a.isDefault && <Badge className="bg-amber-100 text-amber-700 text-[10px] dark:bg-amber-900/40 dark:text-amber-300">Default</Badge>}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{a.line1}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {a.city}{a.state ? `, ${a.state}` : ""} {a.postal}, {a.country}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => remove(a.id)}
                disabled={removing === a.id}
                aria-label={`Delete ${a.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form onSubmit={save} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="addr-name" className="text-xs">Label</Label>
              <Input id="addr-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Home, Parents, Office" />
            </div>
            <div>
              <Label htmlFor="addr-country" className="text-xs">Country</Label>
              <select
                id="addr-country"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                required
                className="mt-1.5 flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="addr-line1" className="text-xs">Address line</Label>
            <Input id="addr-line1" value={form.line1} onChange={(e) => set("line1", e.target.value)} placeholder="123 Oak Street, Apt 4B" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="addr-city" className="text-xs">City</Label>
              <Input id="addr-city" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="addr-state" className="text-xs">State (optional)</Label>
              <Input id="addr-state" value={form.state} onChange={(e) => set("state", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="addr-postal" className="text-xs">Postcode</Label>
              <Input id="addr-postal" value={form.postal} onChange={(e) => set("postal", e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy}>{busy ? "Saving..." : "Save address"}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add address
        </Button>
      )}
    </div>
  )
}
