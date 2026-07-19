import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "How RentApp collects, uses, and protects your information.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="font-serif text-lg tracking-tight text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-[14.5px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-2xl px-5 py-12 lg:py-16">
        <Link href="/" className="text-[14px] font-medium text-accent transition hover:text-accent-dark">
          ← RentApp
        </Link>

        <h1 className="mt-8 font-serif text-3xl tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-[13px] text-ink-muted">Last updated: June 24, 2026</p>

        <div className="mt-8 text-[14.5px] leading-relaxed text-ink-soft">
          This Privacy Policy explains how RentApp, operated by RentApply LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;) collects, uses, and protects your information when you use this website
          to submit a rental application. By using the Service, you agree to this policy.
        </div>

        <Section title="1. Information we collect">
          <p>
            <strong className="font-semibold text-ink">Information you provide:</strong> your full
            name, email address, phone number, desired move‑in date, the property you are applying
            for, your gross monthly income, and your electronic signature.
          </p>
          <p>
            <strong className="font-semibold text-ink">Payment information:</strong> payments are
            handled by our payment processor (Stripe). Your card details are entered on Stripe&rsquo;s
            secure checkout — we do not collect or store your full card number.
          </p>
          <p>
            <strong className="font-semibold text-ink">Automatically collected:</strong> limited
            technical information and, where applicable, the listing or source link you arrived
            from.
          </p>
        </Section>

        <Section title="2. How we use your information">
          <p>
            We use your information to process and review your rental application; to perform tenant
            screening (which may include background, credit, and rental‑history checks); to
            communicate with you about your application and decision; to process the application fee;
            and to comply with our legal obligations.
          </p>
        </Section>

        <Section title="3. Payments">
          <p>
            Payments are processed by Stripe, Inc. Your payment is subject to Stripe&rsquo;s privacy
            policy. We receive confirmation of payment and limited transaction details, not your
            full card information.
          </p>
        </Section>

        <Section title="4. Tenant screening">
          <p>
            Background, credit, and rental‑history checks may be performed by third‑party screening
            providers. These checks are governed by applicable law, including the Fair Credit
            Reporting Act (FCRA). You have rights regarding reports used in housing decisions,
            including the right to be notified if information in a report affects a decision and the
            right to dispute inaccurate information.
          </p>
        </Section>

        <Section title="5. How we share information">
          <p>
            We share your information only as needed to provide the Service — for example, with our
            payment processor and screening providers — and as required by law. We do not sell your
            personal information.
          </p>
        </Section>

        <Section title="6. Data retention">
          <p>
            We retain application information only as long as necessary to process your application,
            comply with legal obligations, and resolve any disputes, after which it is deleted or
            anonymized.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We use reasonable administrative and technical safeguards to protect your information.
            However, no method of transmission or storage is completely secure, and we cannot
            guarantee absolute security.
          </p>
        </Section>

        <Section title="8. Your choices and rights">
          <p>
            You may request access to, correction of, or deletion of your personal information by
            contacting us. Depending on your state of residence, you may have additional rights (for
            example, under California or other state privacy laws).
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions about this policy or your information? Email{" "}
            <a href="mailto:help@rentapp.homes" className="text-accent hover:text-accent-dark">
              help@rentapp.homes
            </a>
            .
          </p>
        </Section>

        <div className="mt-10 flex gap-4 border-t border-line pt-6 text-[13px] text-ink-muted">
          <Link href="/terms" className="text-accent hover:text-accent-dark">
            Terms &amp; Refund Policy
          </Link>
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
