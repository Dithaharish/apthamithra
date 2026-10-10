export const metadata = {
  title: "Terms of Service — Apthamithra",
  description: "The terms that govern your use of Apthamithra's personal shopping service.",
}

export default function TermsPage() {
  return (
    <>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        These terms govern your use of Apthamithra, operated from Karol Bagh, New
        Delhi, India. By creating an account or booking an appointment you accept
        them.
      </p>

      <Section n={1} title="What we do">
        <p>
          Apthamithra acts as your appointed agent to purchase goods on your
          behalf from shops you specify in India. We handle consultation, purchase,
          quality checks, packing, export documentation and shipping. We are not
          the manufacturer, seller or brand owner of anything you buy.
        </p>
      </Section>

      <Section n={2} title="Your responsibilities">
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide accurate delivery addresses and contact details</li>
          <li>Be reachable at your scheduled appointment time</li>
          <li>Approve quotations and quality-check photos before we ship</li>
          <li>Pay all duties, taxes and customs charges levied by your country</li>
          <li>Confirm your order is legal to import into your destination</li>
        </ul>
      </Section>

      <Section n={3} title="Fees and payment">
        <p>
          Our service fee, handling charge and shipping estimate are shown in every
          quotation before you approve it. Shipping is recalculated after the
          quality-check weight is confirmed, and you approve the final amount
          before dispatch. An advance secures the appointment; the balance is due
          before shipping.
        </p>
      </Section>

      <Section n={4} title="Items we cannot handle">
        <ul className="list-disc pl-5 space-y-1">
          <li>Anything illegal in India or in your destination country</li>
          <li>Narcotics, weapons, ammunition and explosives</li>
          <li>Live animals and perishable goods without prior written agreement</li>
          <li>Currency, bullion, and items subject to export restriction</li>
          <li>Prescription medicines require a valid prescription</li>
        </ul>
        <p className="mt-2">
          If we decline an item we tell you immediately and refund any advance held
          for it.
        </p>
      </Section>

      <Section n={5} title="Customs and duties">
        <p>
          We prepare accurate export documentation and declare true values. Import
          duty, GST and customs clearance charges are levied by your country&apos;s
          authorities and are your responsibility. Delivery estimates exclude
          customs delays.
        </p>
      </Section>

      <Section n={6} title="Limitation of liability">
        <p>
          Our liability is limited to the value of the goods concerned plus our
          service fee. We are not liable for indirect or consequential loss, for
          the performance or suitability of goods made by others, or for delays
          caused by customs, weather, couriers or events outside our control.
        </p>
      </Section>

      <Section n={7} title="Governing law">
        <p>
          These terms are governed by the laws of India. Disputes fall under the
          exclusive jurisdiction of the courts of New Delhi.
        </p>
      </Section>

      <Section n={8} title="Contact">
        <p>
          Questions about these terms:{" "}
          <a href="mailto:support@apthamithra.com" className="text-amber-600 hover:underline">
            support@apthamithra.com
          </a>{" "}
          or WhatsApp +91 98765 43210.
        </p>
      </Section>
    </>
  )
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">
        {n}. {title}
      </h2>
      <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">{children}</div>
    </section>
  )
}
