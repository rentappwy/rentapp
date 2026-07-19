import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Application submitted",
};

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg animate-fade-up rounded-2xl border border-line bg-white p-8 text-center shadow-card sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent-tint text-accent">
          <CheckCircle2 size={34} strokeWidth={2} />
        </div>
        <h1 className="mt-6 font-serif text-3xl tracking-tight">Application submitted</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          Thank you — we&rsquo;ve received your application and your $39.99 processing fee. A
          receipt is on its way to your email. We&rsquo;ll review everything and follow up
          with you shortly.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          Back to start
        </Link>
      </div>
    </main>
  );
}
