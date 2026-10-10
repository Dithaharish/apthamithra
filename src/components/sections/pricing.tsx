"use client"
import { useState } from "react"
export function Pricing() {
  const [amount, setAmount] = useState(500)
  const [weight, setWeight] = useState(5)
  const service = Math.round(amount * 0.12)
  const handling = 15
  const shipping = weight * 12
  const total = amount + service + handling + shipping
  return (
    <section id="pricing" className="py-16 sm:py-20 bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <div className="text-sm tracking-widest text-amber-400">PRICING</div>
          <h2 className="mt-2 text-3xl font-semibold">Transparent. No surprises.</h2>
          <p className="mt-3 text-zinc-400">Service fee 10–15% of item value or flat per store visit. Bills always attached. Shipping at cost.</p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { name: "Pay As You Go", price: "12%", desc: "Per shop visit + handling $15 + shipping at cost", cta: "Most Popular" },
              { name: "Monthly Pack", price: "$49/mo", desc: "2 consolidated shipments + reduced 10% fee", cta: "Save on freight" },
              { name: "Business", price: "Custom", desc: "Bulk, weddings, gifting — dedicated shopper", cta: "Contact" },
            ].map(p => (
              <div key={p.name} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="text-sm text-zinc-400">{p.name}</div>
                <div className="mt-1 text-2xl font-semibold">{p.price}</div>
                <div className="mt-2 text-sm text-zinc-400">{p.desc}</div>
                <div className="mt-3 text-xs px-2 py-1 rounded-full bg-amber-500 text-zinc-900 inline-block">{p.cta}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white text-zinc-900 p-6 shadow-xl">
          <h3 className="font-semibold">Estimate your order (USD)</h3>
          <div className="mt-6 space-y-6">
            <div>
              <label className="text-sm font-medium">Item value: ${amount}</label>
              <input type="range" min={50} max={2000} step={10} value={amount} onChange={e=>setAmount(parseInt(e.target.value))} className="w-full mt-2" />
              <div className="flex justify-between text-xs text-zinc-500"><span>$50</span><span>$2000</span></div>
            </div>
            <div>
              <label className="text-sm font-medium">Weight: {weight} kg</label>
              <input type="range" min={1} max={20} step={1} value={weight} onChange={e=>setWeight(parseInt(e.target.value))} className="w-full mt-2" />
              <div className="flex justify-between text-xs text-zinc-500"><span>1 kg</span><span>20 kg</span></div>
            </div>
            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-sm space-y-2">
              <div className="flex justify-between"><span>Items</span><span>${amount}</span></div>
              <div className="flex justify-between"><span>Service fee (12%)</span><span>${service}</span></div>
              <div className="flex justify-between"><span>Handling & QC</span><span>${handling}</span></div>
              <div className="flex justify-between"><span>Shipping est.</span><span>${shipping}</span></div>
              <div className="flex justify-between font-semibold border-t border-zinc-200 pt-2"><span>Total est.</span><span>${total}</span></div>
              <div className="text-xs text-zinc-500">Final shipping calculated after QC weight. Customs/duty extra as applicable.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
