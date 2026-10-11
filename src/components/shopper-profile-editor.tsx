"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Loader2 } from "lucide-react"
import type { Shopper } from "@/lib/db"

export function ShopperProfileEditor({ shopper }: { shopper: Shopper }) {
  const [form, setForm] = useState({
    name: shopper.name,
    city: shopper.city,
    languages: shopper.languages.join(", "),
    bio: shopper.bio ?? "",
  })
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const router = useRouter()

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaved(false)

    const languages = form.languages.split(",").map((l) => l.trim()).filter(Boolean)
    if (languages.length === 0) {
      setError("List at least one language.")
      return
    }
    if (!form.name.trim() || !form.city.trim()) {
      setError("Name and city are required.")
      return
    }

    setBusy(true)
    try {
      const res = await fetch("/api/shopper/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopperId: shopper.id,
          name: form.name.trim(),
          city: form.city.trim(),
          languages,
          bio: form.bio.trim() || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Could not save your profile.")
        return
      }
      setSaved(true)
      setEditing(false)
      router.refresh()
    } catch {
      setError("Could not reach the server. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setEditing(true)}>Edit profile</Button>
        {saved && <span className="self-center text-sm text-green-600">Saved</span>}
      </div>
    )
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="sp-name">Name</Label>
          <Input id="sp-name" value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="sp-city">City</Label>
          <Input id="sp-city" value={form.city} onChange={(e) => set("city", e.target.value)} className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label htmlFor="sp-lang">Languages (comma separated)</Label>
        <Input id="sp-lang" value={form.languages} onChange={(e) => set("languages", e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="sp-bio">Short bio</Label>
        <Textarea id="sp-bio" rows={2} value={form.bio} onChange={(e) => set("bio", e.target.value)} className="mt-1.5" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
          {busy ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => { setEditing(false); setError("") }}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
