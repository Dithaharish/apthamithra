
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { MapPin, Phone, Mail, Clock, Globe } from "lucide-react"
import { ContactForm } from "@/components/contact-form"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="text-sm font-medium tracking-widest text-amber-600">CONTACT</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Get in touch</h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">Have a question or a custom order? We respond within one business day.</p>
            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-amber-600 mt-0.5" /><div><div className="font-medium">India Office</div><div className="text-sm text-zinc-600 dark:text-zinc-400">Karol Bagh, New Delhi, Delhi 110005</div></div></div>
              <div className="flex items-start gap-3"><Phone className="h-5 w-5 text-amber-600 mt-0.5" /><div><div className="font-medium">Phone / WhatsApp</div><div className="text-sm text-zinc-600 dark:text-zinc-400">+91 98765 43210 (8 AM – 10 PM IST)</div></div></div>
              <div className="flex items-start gap-3"><Mail className="h-5 w-5 text-amber-600 mt-0.5" /><div><div className="font-medium">Email</div><div className="text-sm text-zinc-600 dark:text-zinc-400">support@apthamithra.com</div></div></div>
              <div className="flex items-start gap-3"><Clock className="h-5 w-5 text-amber-600 mt-0.5" /><div><div className="font-medium">Working Hours</div><div className="text-sm text-zinc-600 dark:text-zinc-400">Daily 8:00 AM – 10:00 PM IST</div></div></div>
              <div className="flex items-start gap-3"><Globe className="h-5 w-5 text-amber-600 mt-0.5" /><div><div className="font-medium">Languages</div><div className="text-sm text-zinc-600 dark:text-zinc-400">English, Hindi, Gujarati, Tamil</div></div></div>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <h2 className="font-semibold">Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}