// Inspired by ThreeUI Kairo Testimonials — clean portrait + quote
const reviews = [
  { name: "Raj Mehta", location: "New Jersey, USA", rating: 5, text: "My wife wanted a silk saree for my daughter's wedding. Our shopper sent 3 options live from the market, showed the weave in detail, and shipped it in 11 days. Zero stress.", img: "R" },
  { name: "Anita Shah", location: "London, UK", rating: 5, text: "Monthly grocery runs from my hometown. They even included the exact brand of pickle my mother uses. QC photos before shipping gave me complete confidence.", img: "A" },
  { name: "Vikram Nair", location: "Toronto, Canada", rating: 5, text: "Bought 12 kg of ayurvedic herbs for my father. Packed properly, customs cleared, and the bills were authentic. The video call from the shop made me feel present.", img: "V" },
  { name: "Priya Reddy", location: "Dubai, UAE", rating: 5, text: "Wedding gifts for 40 relatives in one order. Consolidated shipment saved me 40% on freight. Every item matched the live video exactly.", img: "P" },
  { name: "Suresh Kumar", location: "Sydney, Australia", rating: 5, text: "Booked a Puja items list for Diwali. The shopper even checked with me on the phone for each item's quality. Arrived on time, beautifully packed.", img: "S" },
  { name: "Meera Iyer", location: "San Jose, USA", rating: 5, text: "As a busy mom, this service is a godsend. I booked during my lunch break, the call happened on time, and my kids' clothes arrived within 2 weeks.", img: "M" },
]
export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 sm:py-20 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-medium tracking-widest text-amber-600">TESTIMONIALS</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Trusted by NRIs across 5 countries</h2>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex text-amber-500">★★★★★</div>
            <span className="font-semibold">4.9</span>
            <span className="text-zinc-500">from 2,400+ reviews</span>
          </div>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(r => (
            <figure key={r.name} className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center font-semibold text-amber-700 dark:text-amber-300">{r.img}</div>
                <div>
                  <figcaption className="font-medium">{r.name}</figcaption>
                  <cite className="text-sm text-zinc-500 not-italic">{r.location}</cite>
                </div>
              </div>
              <div className="mt-3 text-amber-500 text-sm">{"★".repeat(r.rating)}</div>
              <blockquote className="mt-3 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">“{r.text}”</blockquote>
            </figure>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          {["Google Reviews", "Trustpilot", "Video Testimonials"].map(t => (
            <span key={t} className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400">{t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}