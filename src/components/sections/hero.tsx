import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ShieldCheck, Globe2, Phone } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center relative">
        <div>
          <Badge className="mb-4 gap-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"><ShieldCheck className="h-3.5 w-3.5" /> Trusted by 2,400+ NRI families worldwide</Badge>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
            Your personal shopper in India — <span className="text-amber-600">we shop, verify & ship</span> from your trusted local stores
          </h1>
          <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl">
            Book a video appointment. Our team in India joins you live from the market, shows quality on camera, shares bills, and handles packing, customs & international delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book"><Button size="lg" variant="secondary">Book Free Consultation</Button></Link>
            <Link href="#how-it-works"><Button size="lg" variant="outline">See How It Works</Button></Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> No hidden fees</span>
            <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> QC photos before shipping</span>
            <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Bills attached</span>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5"><Globe2 className="h-4 w-4" /> USA • UK • Canada • UAE • Australia</span>
            <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4" /> English • Hindi • Gujarati • Tamil</span>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
            <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-100 dark:from-zinc-800 dark:to-zinc-800 flex items-center justify-center p-6">
              <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-950 p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Live from Karol Bagh, Delhi</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white animate-pulse">● LIVE</span>
                </div>
                <div className="mt-3 h-44 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm text-zinc-500">Shopper video — Saree QC</div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-green-50 text-green-700">Quality: A+ ✓</span>
                  <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">₹4,850 • Bill verified</span>
                </div>
              </div>
            </div>
            <div className="p-5 flex items-center justify-between text-sm">
              <div><div className="font-medium">Next appointment</div><div className="text-zinc-500">Today 7:30 PM IST • Your time 9:00 AM EST</div></div>
              <Link href="/book"><Button size="sm">Join</Button></Link>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden lg:flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg px-4 py-3 gap-3 items-center">
            <div className="h-10 w-10 rounded-full bg-amber-500" />
            <div className="text-sm"><div className="font-medium">Priya — Delhi Shopper</div><div className="text-zinc-500">4.9 ★ • 1,200+ shops</div></div>
          </div>
        </div>
      </div>
    </section>
  )
}
