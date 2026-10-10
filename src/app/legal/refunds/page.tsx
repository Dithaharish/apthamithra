export const metadata = {
  title: "Refund Policy — Apthamithra",
  description: "When and how Apthamithra issues refunds, and what is not refundable.",
}

export default function RefundsPage() {
  return (
    <>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Refund Policy</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        We only charge our fee for work we actually did. If something goes wrong
        on our side, you get it back.
      </p>

      <Section n={1} title="Full refunds">
        <ul className="list-disc pl-5 space-y-1">
          <li>You cancel before our shopper has visited any shop</li>
          <li>We cannot source an item you approved in a quotation</li>
          <li>We decline an item as restricted or illegal</li>
          <li>We miss your appointment without notice</li>
        </ul>
      </Section>

      <Section n={2} title="Partial refunds">
        <p>
          If you cancel after purchasing has begun, the item cost and any shop&apos;s
          own non-returnable charges are deducted. Our service fee is refunded
          pro-rata for work not yet done.
        </p>
      </Section>

      <Section n={3} title="Quality disputes">
        <p>
          Every order is photographed and videoed before packing. If what arrives
          does not match the approved quality-check media, tell us within 7 days of
          delivery with photos and we will arrange a return or replacement at our
          cost.
        </p>
      </Section>

      <Section n={4} title="Not refundable">
        <ul className="list-disc pl-5 space-y-1">
          <li>International shipping already paid to a courier</li>
          <li>Duties and taxes levied by your country</li>
          <li>Perishable, custom-made or personalised goods</li>
          <li>Change of mind after the item has been packed and shipped</li>
        </ul>
      </Section>

      <Section n={5} title="How to request one">
        <p>
          Email{" "}
          <a href="mailto:support@apthamithra.com" className="text-amber-600 hover:underline">
            support@apthamithra.com
          </a>{" "}
          with your order ID. We respond within two business days and process
          approved refunds to your original payment method within 7–14 working
          days, depending on your bank.
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
