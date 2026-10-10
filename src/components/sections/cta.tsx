// Inspired by ThreeUI Volta Atelier CTA — oversized closing invitation
import Link from "next/link"
import { Button } from "@/components/ui/button"
export function CTA() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white p-8 sm:p-12 text-center">
          <div className="text-sm tracking-widest text-white/80">BOOK YOUR FREE CONSULTATION</div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold">Ready to shop from India?</h2>
          <p className="mt-3 text-white/90 max-w-xl mx-auto">Book a 20-minute slot. Our team will join you live from the market, understand your needs, and share a transparent quote before anything is purchased.</p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/book"><Button size="lg" variant="default" className="bg-zinc-900 text-white hover:bg-zinc-800">Book Appointment</Button></Link>
            <Link href="/login"><Button size="lg" variant="outline" className="border-white/60 text-white hover:bg-white/10">Sign In</Button></Link>
          </div>
        </div>
      </div>
    </section>
  )
}