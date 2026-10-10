import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Store, MapPin, Star, CheckCircle, Eye } from "lucide-react"

const shops = [
  { id: "SHOP-001", name: "Kanjeevaram Silk House", city: "Kancheepuram", category: "Sarees", rating: 4.9, verified: true, orders: 128, area: "Near Temple" },
  { id: "SHOP-002", name: "Haldiram's — Karol Bagh", city: "Delhi", category: "Sweets & Snacks", rating: 4.8, verified: true, orders: 240, area: "Main Bazaar" },
  { id: "SHOP-003", name: "Kerala Ayurveda Centre", city: "Kerala", category: "Ayurveda", rating: 5.0, verified: true, orders: 89, area: "Near Medical College" },
  { id: "SHOP-004", name: "Hyderabad Pearls", city: "Hyderabad", category: "Jewelry", rating: 4.7, verified: false, orders: 34, area: "Laad Bazaar" },
  { id: "SHOP-005", name: "Mumbai Textile Market", city: "Mumbai", category: "Textiles", rating: 4.6, verified: false, orders: 56, area: "Mangaldas Market" },
]

export default function AdminShopsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Shops</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Manage your trusted shop network across India.</p>
      </div>
      <div className="relative max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <Input placeholder="Search shops..." className="pl-9" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shops.map(s => (
          <div key={s.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center"><Store className="h-6 w-6 text-amber-600" /></div>
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-zinc-500">{s.id}</div>
                </div>
              </div>
              {s.verified ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Badge className="bg-zinc-100 text-zinc-600">Pending</Badge>}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm"><MapPin className="h-4 w-4 text-zinc-400" />{s.city} • {s.area}</div>
            <div className="mt-2 text-xs text-zinc-500">Category: {s.category}</div>
            <div className="mt-3 flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500 fill-amber-500" />{s.rating} • {s.orders} orders</div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1"><Eye className="h-4 w-4 mr-1" /> View</Button>
              <Button size="sm" variant="ghost">Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}