import Link from "next/link"
import { Button } from "@/components/ui/button"
const links = [
  { href: "#services", label: "Services" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "/track", label: "Track Order" },
  { href: "#faq", label: "FAQ" },
]
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">A</div>
          <span className="font-semibold tracking-tight">Apthamithra</span>
          <span className="hidden sm:inline text-xs text-zinc-500 ml-1">Rooted in trust. Always by your side</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          {links.map(l => <a key={l.href} href={l.href} className="hover:text-zinc-900 dark:hover:text-white transition-colors">{l.label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline-flex text-sm font-medium px-4 py-2 hover:underline">Log in</Link>
          <Link href="/book"><Button size="sm" variant="secondary">Book Appointment</Button></Link>
        </div>
      </div>
    </header>
  )
}
