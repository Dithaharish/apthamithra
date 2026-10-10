import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FileText, Eye, RotateCcw, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Legal — Apthamithra",
  description: "Terms of service, privacy policy and refund policy for Apthamithra.",
}

const DOCS = [
  {
    href: "/legal/terms",
    icon: FileText,
    title: "Terms of Service",
    summary: "What Apthamithra does, what we cannot handle, duties and customs, and how disputes are settled.",
  },
  {
    href: "/legal/privacy",
    icon: Eye,
    title: "Privacy Policy",
    summary: "What we collect, why, how long we keep it, how passwords are stored and the rights you have over your data.",
  },
  {
    href: "/legal/refunds",
    icon: RotateCcw,
    title: "Refund Policy",
    summary: "When refunds are full or partial, how quality disputes are handled, and what is not refundable.",
  },
]

export default function LegalIndexPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Legal</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          The documents that govern your use of Apthamithra.
        </p>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {DOCS.map((d) => {
            const Icon = d.icon
            return (
              <Link
                key={d.href}
                href={d.href}
                className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-amber-400 transition-colors"
              >
                <Icon className="h-6 w-6 text-amber-600" />
                <h2 className="mt-3 font-semibold">{d.title}</h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{d.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                  Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-sm text-zinc-600 dark:text-zinc-400">
          <strong className="text-zinc-900 dark:text-white">Note:</strong> these are working templates
          drafted for the service as built. Have a qualified lawyer review them against Indian law and
          the laws of the countries you serve before you take payments.
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
