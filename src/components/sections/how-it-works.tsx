// Inspired by ThreeUI Aniwall Workflow — 4-step adoption path with progress line
export function HowItWorks() {
  const steps = [
    { n: "01", title: "Book Appointment", desc: "Pick a slot. Auto timezone conversion IST ↔ your local time. Choose App / Phone / Video.", icon: "📅" },
    { n: "02", title: "Video Consultation", desc: "We call at the scheduled time to understand exact needs, shop preference, budget & alternatives.", icon: "🎥" },
    { n: "03", title: "We Shop & Verify", desc: "Our team purchases on your behalf, shares QC photos/videos + original bills for your approval.", icon: "🛍️" },
    { n: "04", title: "Pack & Ship Worldwide", desc: "Secure packing, consolidated shipping, customs docs, tracking & insurance. Delivery in India also available.", icon: "✈️" },
  ]
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-medium tracking-widest text-amber-600">HOW IT WORKS</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Four steps from call to doorstep</h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">Designed for NRIs — minimal effort, full transparency, human trust.</p>
        </div>
        <div className="relative mt-10">
          <div className="hidden lg:block absolute left-0 right-0 top-[54px] h-px bg-gradient-to-r from-amber-300 via-zinc-300 to-zinc-200 dark:from-amber-700 dark:via-zinc-700" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map(s => (
              <div key={s.n} className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xs font-mono tracking-widest text-amber-600">{s.n}</span>
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4 text-sm flex flex-wrap gap-4">
          <span>🕒 Appointments daily 8 AM – 10 PM IST</span>
          <span>•</span>
          <span>🔁 Reschedule free up to 12 hours before</span>
          <span>•</span>
          <span>📞 Missed call? We retry within 30 minutes</span>
        </div>
      </div>
    </section>
  )
}
