// Inspired by ThreeUI RenderLab Services — stacking cards
const services = [
  { title: "Proxy Shopping", items: ["Go to your specified shop", "Video call live from shop", "Negotiate & verify quality", "Collect original bills"], accent: "bg-amber-500" },
  { title: "Quality Check & Consolidation", items: ["QC photos & videos", "Measurements & authenticity", "Combine multi-shop orders", "Save on shipping"], accent: "bg-emerald-500" },
  { title: "Packing, Customs & Shipping", items: ["Export-grade packing", "Customs docs & declaration", "DHL / Aramex / FedEx", "Full tracking + insurance"], accent: "bg-sky-500" },
]
export function Services() {
  return (
    <section id="services" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="text-sm font-medium tracking-widest text-amber-600">SERVICES</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">What we do for you</h2>
          </div>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400">From sweets and sarees to medicines, puja items and bulk wedding shopping — if it is available in India, we can source it.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {services.map(s => (
            <div key={s.title} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className={`h-1.5 w-12 rounded-full ${s.accent}`} />
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                {s.items.map(i => <li key={i} className="flex gap-2"><span className="text-green-600">✓</span>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          {["Groceries & Sweets","Textiles & Jewelry","Ayurveda & Medicines","Religious & Festival"].map(c => (
            <div key={c} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-center font-medium">{c}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
