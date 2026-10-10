export const metadata = {
  title: "Privacy Policy — Apthamithra",
  description: "How Apthamithra collects, uses and protects your personal data.",
}

export default function PrivacyPage() {
  return (
    <>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        We collect only what we need to shop, ship and support you. We do not sell
        your data.
      </p>

      <Section n={1} title="What we collect">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account:</strong> name, email, password (hashed), phone</li>
          <li><strong>Location:</strong> country and timezone, to schedule appointments</li>
          <li><strong>Orders:</strong> shopping lists, quotations, delivery addresses</li>
          <li><strong>Consultations:</strong> notes taken during your appointment</li>
          <li><strong>Payments:</strong> amount, method and status. We never store full card numbers</li>
        </ul>
      </Section>

      <Section n={2} title="Why we use it">
        <p>
          To book and run your appointments, raise quotations, buy on your behalf,
          ship to you, process payment, prevent fraud and provide support. Payment
          processors and couriers need enough detail to complete their part, and
          receive only what is required.
        </p>
      </Section>

      <Section n={3} title="Passwords">
        <p>
          Passwords are stored only as bcrypt hashes and cannot be read by us or by
          our staff. If you forget your password it must be reset, never recovered.
        </p>
      </Section>

      <Section n={4} title="How long we keep it">
        <p>
          Account and order records are kept for as long as your account is open and
          for the period Indian tax and commercial law requires afterwards. You can
          ask us to delete your account at any time, subject to records we are
          legally required to retain.
        </p>
      </Section>

      <Section n={5} title="Security">
        <p>
          Data is stored in an encrypted Postgres database. Access uses a server-only
          key that is never exposed to browsers and is never committed to source
          control. Sessions are signed JSON Web Tokens.
        </p>
      </Section>

      <Section n={6} title="Your rights">
        <ul className="list-disc pl-5 space-y-1">
          <li>Ask what data we hold about you</li>
          <li>Correct anything inaccurate</li>
          <li>Request deletion of your account</li>
          <li>Withdraw consent for marketing messages</li>
        </ul>
      </Section>

      <Section n={7} title="Contact">
        <p>
          Privacy requests:{" "}
          <a href="mailto:support@apthamithra.com" className="text-amber-600 hover:underline">
            support@apthamithra.com
          </a>
          .
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
