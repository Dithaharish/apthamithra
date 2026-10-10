import Link from "next/link"
import { Button } from "@/components/ui/button"
export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">A</div>
            <span className="font-semibold tracking-tight">Apthamithra</span>
          </Link>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Rooted in trust. Always by your side — shopping, quality check, packing and worldwide shipping from India.</p>
        </div>
        <div>
          <div className="font-medium text-sm">Services</div>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><a href="#services" className="hover:text-zinc-900 dark:hover:text-white">Proxy Shopping</a></li>
            <li><a href="#services" className="hover:text-zinc-900 dark:hover:text-white">QC & Consolidation</a></li>
            <li><a href="#services" className="hover:text-zinc-900 dark:hover:text-white">International Shipping</a></li>
            <li><a href="#pricing" className="hover:text-zinc-900 dark:hover:text-white">Pricing</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-sm">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><a href="#how-it-works" className="hover:text-zinc-900 dark:hover:text-white">How It Works</a></li>
            <li><a href="#testimonials" className="hover:text-zinc-900 dark:hover:text-white">Reviews</a></li>
            <li><a href="#faq" className="hover:text-zinc-900 dark:hover:text-white">FAQ</a></li>
            <li><a href="/contact" className="hover:text-zinc-900 dark:hover:text-white">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-sm">Book an Appointment</div>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Appointments daily 8 AM – 10 PM IST. Video / App / Phone.</p>
          <div className="mt-4">
            <Link href="/book"><Button size="sm" variant="secondary">Book Now</Button></Link>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-5 flex flex-wrap justify-between items-center text-xs text-zinc-500">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
          <span>© 2026 Apthamithra. All rights reserved.</span>
          <Link href="/legal/terms" className="hover:text-zinc-900 dark:hover:text-white">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-zinc-900 dark:hover:text-white">Privacy</Link>
          <Link href="/legal/refunds" className="hover:text-zinc-900 dark:hover:text-white">Refunds</Link>
          <span>GST invoices provided</span>
        </div>
        </div>
      </div>
    </footer>
  )
}