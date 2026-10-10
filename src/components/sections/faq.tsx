// Inspired by ThreeUI Volta Atelier FAQ accordion
"use client"
import { useState } from "react"
const faqs = [
  { q: "Do I need to be available during the shopping call?", a: "Yes — the consultation call happens at your booked time. We join via app, phone, or video (WhatsApp/Zoom/Meet). You can also send a written list if you prefer not to take the call." },
  { q: "How is the timezone handled?", a: "When you book, we automatically convert IST ↔ your local timezone and send calendar invites with both. Reminders go out 24h and 1h before." },
  { q: "Can I see the items before they are shipped?", a: "Absolutely. Before dispatch we share 3–5 QC photos plus a short video and the original shop bill. You approve or request changes. Nothing ships without your approval." },
  { q: "What about customs and duty?", a: "We prepare all export documents and a customs declaration. Import duty is the customer's responsibility and varies by country. We declare accurate values and attach bills." },
  { q: "Is there a minimum order?", a: "No. We handle single-item purchases as well as 100+ item wedding or bulk orders. Consolidated shipments reduce freight for multiple shops." },
  { q: "What if an item is out of stock?", a: "We show alternatives live during the call and share options with photos and prices. You decide before we proceed. No surprise substitutions." },
  { q: "How long does delivery take?", a: "Typically 7–14 days internationally after QC approval, depending on courier and customs. Local delivery within India is 2–5 days." },
  { q: "How do I pay?", a: "We accept international cards (Stripe), UPI/Razorpay for India, and bank transfer. A partial advance secures the appointment; final payment is due before shipping." },
]
export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-sm font-medium tracking-widest text-amber-600">FAQ</div>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Common questions</h2>
        <div className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
          {faqs.map((f, i) => (
            <div key={i}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-start py-5 text-left">
                <span className="font-medium pr-4">{f.q}</span>
                <span className="text-amber-600 text-xl shrink-0">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p className="pb-5 text-zinc-600 dark:text-zinc-400 text-sm">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}