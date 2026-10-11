import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ShieldCheck, FileText, RotateCcw, Eye } from "lucide-react"

export const metadata = {
  title: "Legal — Apthamithra",
  description: "Terms of service, privacy policy and refund policy for Apthamithra.",
}

const SECTIONS = [
  { href: "/legal/terms", label: "Terms of Service", icon: FileText },
  { href: "/legal/privacy", label: "Privacy Policy", icon: Eye },
  { href: "/legal/refunds", label: "Refund Policy", icon: RotateCcw },
]

const LAST_UPDATED = "10 October 2026"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {SECTIONS.map((s) => {
            const Icon = s.icon
            return (
              <Link
                key={s.href}
                href={s.href}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                <Icon className="h-4 w-4" /> {s.label}
              </Link>
            )
          })}
        </div>

        <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
          <p className="text-xs text-zinc-500">Last updated {LAST_UPDATED}</p>
          {children}
        </article>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm">
          <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-200">
            These documents are a working template. Have a qualified lawyer review
            them against Indian law and the laws of the countries you serve before
            you take payments. Nothing here is legal advice.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
