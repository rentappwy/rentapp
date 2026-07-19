import Link from "next/link";

export const metadata = {
  title: "Terms & Refund Policy",
  description: "Terms of Service and refund policy for the RentApp rental application service.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="font-serif text-lg tracking-tight text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-[14.5px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-2xl px-5 py-12 lg:py-16">
        <Link href="/" className="text-[14px] font-medium text-accent transition hover:text-accent-dark">
          ← RentApp
        </Link>

        <h1 className="mt-8 font-serif text-3xl tracking-tight sm:text-4xl">
          Terms of Service &amp; Refund Policy
        </h1>
        <p className="mt-2 text-[13px] text-ink-muted">Last updated: June 24, 2026</p>

        <div className="mt-8 text-[14.5px] leading-relaxed text-ink-soft">
          These Terms govern your use of this website and the rental‑application service (the
          &ldquo;Service&rdquo;). In these Terms, &ldquo;RentApp,&rdquo; &ldquo;we,&rdquo;
          &ldquo;us,&rdquo; and &ldquo;our&rdquo; refer to RentApply LLC, the operator of this Service. By
          submitting an application and paying the application fee, you agree to these Terms. If you
          do not agree, do not use the Service.
        </div>

        <Section title="1. The service">
          <p>
            RentApp provides an online form to submit a rental application along with a one‑time
            fee that covers processing and tenant screening, which may include background, credit,
            and rental‑history checks.
          </p>
        </Section>

        <Section title="2. Application fee">
          <p>
            The application fee is $39.99 (USD) and is charged when you submit your application. The
            fee pays for processing and screening services that begin as soon as you submit, and it
            is considered earned upon submission.
          </p>
        </Section>

        <Section title="3. No refunds">
          <p>
            The application fee is <strong className="font-semibold text-ink">non‑refundable</strong>.
            This includes, without limitation, situations where: the property is no longer
            available; a listing was inaccurate, changed, or removed; your application is declined;
            you withdraw or decide not to proceed; or you are unable to move forward for any reason.
            Because screening and processing are performed upon submission, the fee is not refundable
            once you submit.
          </p>
        </Section>

        <Section title="4. No guarantee">
          <p>
            Submitting an application and paying the fee does not guarantee approval, a lease, a
            viewing, or that any particular property is or will remain available. Availability,
            pricing, and lease terms may change at any time without notice.
          </p>
        </Section>

        <Section title="5. Third‑party listings">
          <p>
            Properties may be advertised or controlled by third parties, including landlords,
            agents, and online marketplaces. We do not create, verify, endorse, or guarantee the
            accuracy, availability, condition, or pricing of any listing, and we are not responsible
            for listings, content, or representations made by third parties.
          </p>
        </Section>

        <Section title="6. Your responsibilities">
          <p>
            You agree to provide accurate, complete, and truthful information and to use the Service
            only for lawful purposes. Providing false or misleading information may result in denial
            of your application without a refund.
          </p>
        </Section>

        <Section title="7. Disclaimer of warranties">
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without
            warranties of any kind, whether express or implied, to the maximum extent permitted by
            law.
          </p>
        </Section>

        <Section title="8. Limitation of liability">
          <p>
            To the maximum extent permitted by applicable law, RentApply LLC and its operators, owners,
            and affiliates will not be liable for any indirect, incidental, special, consequential,
            or punitive damages, or for any lost profits, data, or goodwill, arising out of or
            relating to the Service. Our total aggregate liability for any claim relating to the
            Service will not exceed the amount of the application fee you paid ($39.99).
          </p>
        </Section>

        <Section title="9. Equal housing opportunity">
          <p>
            We support equal housing opportunity and do not discriminate on the basis of race,
            color, religion, sex, national origin, familial status, disability, or any other class
            protected by applicable law.
          </p>
        </Section>

        <Section title="10. Changes to these terms">
          <p>
            We may update these Terms from time to time. Your continued use of the Service after any
            change constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="11. Governing law">
          <p>
            These Terms are governed by the laws of the Commonwealth of Pennsylvania, without regard
            to its conflict‑of‑laws principles.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions about these Terms? Email{" "}
            <a href="mailto:help@rentapp.homes" className="text-accent hover:text-accent-dark">
              help@rentapp.homes
            </a>
            .
          </p>
        </Section>

        <div className="mt-10 flex gap-4 border-t border-line pt-6 text-[13px] text-ink-muted">
          <Link href="/privacy" className="text-accent hover:text-accent-dark">
            Privacy Policy
          </Link>
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
