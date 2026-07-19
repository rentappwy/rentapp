"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Home,
  Lock,
  ShieldCheck,
  Clock,
  KeyRound,
  Loader2,
  ArrowRight,
  Check,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import { Field } from "@base-ui-components/react/field";
import { Fieldset } from "@base-ui-components/react/fieldset";
import { Checkbox } from "@base-ui-components/react/checkbox";

/* ------------------------------------------------------------------ */
/*  Edit your business name + the fee label here.                      */
/*  (The amount actually charged lives in app/api/checkout/route.ts)   */
/* ------------------------------------------------------------------ */
const BRAND = "RentApp";
const FEE_LABEL = "$39.99";

type Fields = {
  fullName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  moveInDate: string;
  currentAddress: string;
  timeAtAddress: string;
  currentLandlordName: string;
  landlordPhone: string;
  employer: string;
  jobTitle: string;
  employerPhone: string;
  timeAtJob: string;
  monthlyIncome: string;
  occupants: string;
  pets: string;
  petsDescription: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  evicted: string;
  brokenLease: string;
  signature: string;
};

const EMPTY: Fields = {
  fullName: "",
  email: "",
  phone: "",
  propertyAddress: "",
  moveInDate: "",
  currentAddress: "",
  timeAtAddress: "",
  currentLandlordName: "",
  landlordPhone: "",
  employer: "",
  jobTitle: "",
  employerPhone: "",
  timeAtJob: "",
  monthlyIncome: "",
  occupants: "",
  pets: "",
  petsDescription: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  evicted: "",
  brokenLease: "",
  signature: "",
};

type Errors = Partial<Record<keyof Fields | "consent", string>>;

const NEXT_STEPS: { Icon: LucideIcon; title: string; sub: string }[] = [
  { Icon: Clock, title: "Reviewed within 48 hours", sub: "We read every application personally." },
  { Icon: ShieldCheck, title: "Background & credit check", sub: "Run securely as part of the fee." },
  { Icon: KeyRound, title: "We reach out to schedule", sub: "If it's a fit, we'll set up a viewing." },
];

const TRUST: { Icon: LucideIcon; label: string }[] = [
  { Icon: Lock, label: "Powered by Stripe" },
  { Icon: ShieldCheck, label: "Bank-level encryption" },
  { Icon: BadgeCheck, label: "FCRA-compliant" },
  { Icon: Home, label: "Equal Housing" },
];

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function formatMoney(value: string): string {
  const d = value.replace(/[^\d]/g, "").slice(0, 9);
  return d ? "$" + Number(d).toLocaleString("en-US") : "";
}

export default function ApplicationForm() {
  const [data, setData] = useState<Fields>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);
  const [source, setSource] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const year = new Date().getFullYear();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const addr = params.get("address") || params.get("property") || params.get("unit");
    if (addr) setData((d) => ({ ...d, propertyAddress: addr }));
    const src = params.get("src") || params.get("ref") || params.get("utm_source");
    if (src) setSource(src.slice(0, 120));
    if (params.get("canceled") === "1") {
      setCanceled(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const set = (k: keyof Fields, v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => {
      const n = { ...e };
      delete n[k];
      return n;
    });
  };

  const setChoice = (k: keyof Fields, v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => {
      const n = { ...e };
      delete n[k];
      return n;
    });
  };

  function validate(): Errors {
    const e: Errors = {};
    const req = (k: keyof Fields, msg: string) => {
      if (!data[k].trim()) e[k] = msg;
    };
    // About you
    req("fullName", "Enter your full name");
    if (!data.email.trim()) e.email = "Enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Enter a valid email";
    if (!data.phone.trim()) e.phone = "Enter your phone number";
    else if (data.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10-digit phone number";
    // The home
    req("propertyAddress", "Which home are you applying for?");
    req("moveInDate", "Choose a move-in date");
    // Current residence
    req("currentAddress", "Enter your current address");
    // Employment & income
    req("employer", "Enter your employer");
    if (!data.monthlyIncome.trim()) e.monthlyIncome = "Enter your monthly income";
    else if (Number(data.monthlyIncome.replace(/[^0-9.]/g, "")) <= 0)
      e.monthlyIncome = "Enter a valid amount";
    // Household
    req("occupants", "How many people will live here?");
    if (!data.pets) e.pets = "Please choose";
    // Emergency contact is optional — no validation.
    // Rental history
    if (!data.evicted) e.evicted = "Please choose";
    if (!data.brokenLease) e.brokenLease = "Please choose";
    // Sign
    req("signature", "Type your name to sign");
    if (!consent) e.consent = "Please authorize to continue";
    return e;
  }

  function validateField(k: keyof Fields) {
    const all = validate();
    setErrors((prev) => {
      const next = { ...prev };
      if (all[k]) next[k] = all[k];
      else delete next[k];
      return next;
    });
  }

  async function submit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const first = Object.keys(e)[0];
      document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    setPayError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setPayError(json.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      setPayError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  const fieldProps = { data, set, errors, onBlur: validateField } as const;

  return (
    <div className="app-bg flex min-h-screen flex-col">
      <div className="mx-auto grid w-full max-w-5xl flex-1 gap-10 px-5 py-12 lg:grid-cols-[0.82fr_1fr] lg:gap-16 lg:px-8 lg:py-24">
        {/* Intro / aside */}
        <aside className="animate-fade-up lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-white shadow-soft">
              <Home size={18} strokeWidth={2.2} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">{BRAND}</span>
          </div>

          <h1 className="mt-9 font-serif text-[2.75rem] leading-[1.03] tracking-tight sm:text-[3.25rem]">
            Apply for your next home.
          </h1>
          <p className="mt-4 max-w-sm text-[15.5px] leading-relaxed text-ink-muted">
            A complete rental application takes just a few minutes. A one-time {FEE_LABEL} fee
            submits it for review.
          </p>

          <ul className="mt-10 space-y-5">
            {NEXT_STEPS.map(({ Icon, title, sub }) => (
              <li key={title} className="flex gap-3.5">
                <span className="mt-0.5 grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-accent-tint text-accent">
                  <Icon size={17} />
                </span>
                <div>
                  <p className="text-[14px] font-semibold">{title}</p>
                  <p className="text-[13px] leading-snug text-ink-muted">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Form */}
        <div className="animate-fade-up rounded-[20px] border border-line bg-white p-6 shadow-card sm:p-8 lg:p-9">
          {canceled && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-800">
              Payment canceled — no charge was made. Your details are still here; you can submit
              again.
            </div>
          )}

          <form
            noValidate
            onSubmit={(ev) => {
              ev.preventDefault();
              submit();
            }}
          >
            <Group label="About you">
              <BaseField label="Full name" k="fullName" {...fieldProps} placeholder="Jordan Avery" autoComplete="name" full />
              <BaseField label="Email" k="email" {...fieldProps} type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" />
              <BaseField label="Phone" k="phone" {...fieldProps} type="tel" inputMode="tel" autoComplete="tel" format={formatPhone} placeholder="(215) 555-0142" />
            </Group>

            <Group label="The home">
              <BaseField label="Home you're applying for" k="propertyAddress" {...fieldProps} autoComplete="off" placeholder="123 Spruce St, Unit 2, Philadelphia" full />
              <BaseField label="Desired move-in date" k="moveInDate" {...fieldProps} type="date" min={today} />
            </Group>

            <Group label="Current residence">
              <BaseField label="Current address" k="currentAddress" {...fieldProps} autoComplete="street-address" placeholder="Street, city, state, ZIP" full />
              <BaseField label="Current landlord" k="currentLandlordName" {...fieldProps} placeholder="Name" optional />
              <BaseField label="Landlord phone" k="landlordPhone" {...fieldProps} type="tel" inputMode="tel" format={formatPhone} optional />
              <BaseField label="Time at this address" k="timeAtAddress" {...fieldProps} placeholder="e.g. 2 years" optional />
            </Group>

            <Group label="Employment & income">
              <BaseField label="Employer" k="employer" {...fieldProps} placeholder="Company name" />
              <BaseField label="Job title" k="jobTitle" {...fieldProps} optional />
              <BaseField label="Employer phone" k="employerPhone" {...fieldProps} type="tel" inputMode="tel" format={formatPhone} optional />
              <BaseField label="Time at job" k="timeAtJob" {...fieldProps} placeholder="e.g. 3 years" optional />
              <BaseField label="Gross monthly income" k="monthlyIncome" {...fieldProps} inputMode="numeric" format={formatMoney} placeholder="$5,500" />
            </Group>

            <Group label="Household">
              <BaseField label="Total occupants" k="occupants" {...fieldProps} inputMode="numeric" placeholder="2" />
              <YesNo id="pets" label="Any pets?" value={data.pets} onChange={(v) => setChoice("pets", v)} error={errors.pets} />
              {data.pets === "yes" && (
                <BaseField label="Tell us about your pets" k="petsDescription" {...fieldProps} placeholder="1 cat, spayed, 8 lbs" full optional />
              )}
              <BaseField label="Emergency contact name" k="emergencyContactName" {...fieldProps} optional />
              <BaseField label="Emergency contact phone" k="emergencyContactPhone" {...fieldProps} type="tel" inputMode="tel" format={formatPhone} optional />
            </Group>

            <Group label="Rental history">
              <YesNo id="evicted" label="Have you ever been evicted?" value={data.evicted} onChange={(v) => setChoice("evicted", v)} error={errors.evicted} />
              <YesNo id="brokenLease" label="Have you ever broken a lease?" value={data.brokenLease} onChange={(v) => setChoice("brokenLease", v)} error={errors.brokenLease} />
            </Group>

            <div className="mt-7 border-t border-line pt-6">
              <div className="flex items-start gap-3">
                <Checkbox.Root
                  id="consent"
                  name="consent"
                  checked={consent}
                  onCheckedChange={(checked) => {
                    setConsent(checked);
                    setErrors((p) => {
                      const n = { ...p };
                      delete n.consent;
                      return n;
                    });
                  }}
                  className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border border-[#DDE1E9] bg-white outline-none transition focus-visible:ring-2 focus-visible:ring-accent/30 data-[checked]:border-accent data-[checked]:bg-accent"
                >
                  <Checkbox.Indicator className="flex text-white">
                    <Check size={13} strokeWidth={3} />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="consent" className="cursor-pointer text-[13.5px] leading-relaxed text-ink-soft">
                  I authorize a background, credit, and rental-history check, and certify the
                  information above is accurate.
                </label>
              </div>
              {errors.consent && <p className="field-error ml-8">{errors.consent}</p>}

              <BaseField
                className="mt-5"
                label="Signature — type your full legal name"
                k="signature"
                {...fieldProps}
                placeholder="Jordan Avery"
                autoComplete="off"
                serif
                full
              />
            </div>

            {payError && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
                {payError}
              </div>
            )}

            {/* Trust row */}
            <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {TRUST.map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-paper px-2.5 py-2 text-center text-[11.5px] font-medium text-ink-soft"
                >
                  <Icon size={14} className="flex-shrink-0 text-accent" /> {label}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-accent px-5 py-4 text-[15px] font-semibold text-white shadow-soft transition hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 active:scale-[0.99] disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" /> Redirecting to secure checkout…
                </>
              ) : (
                <>
                  Submit application <ArrowRight size={17} />
                </>
              )}
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12.5px] text-ink-muted">
              <Lock size={13} /> Your information is encrypted and never sold.
            </p>
            <p className="mt-2 text-center text-[12px] leading-relaxed text-ink-muted">
              By submitting, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-2 hover:text-ink">Terms</a> and{" "}
              <a href="/privacy" className="underline underline-offset-2 hover:text-ink">Privacy Policy</a>. The {FEE_LABEL} fee is non‑refundable.
            </p>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-line/70">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 text-[12.5px] text-ink-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-white">
              <Home size={13} />
            </span>
            <span>© {year} RentApply LLC · Equal Housing Opportunity</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/terms" className="transition hover:text-ink">Terms</a>
            <a href="/privacy" className="transition hover:text-ink">Privacy</a>
            <a href="mailto:help@rentapp.homes" className="transition hover:text-ink">help@rentapp.homes</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ----------------------------- pieces ----------------------------- */

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Fieldset.Root className="mb-7 last:mb-0">
      <Fieldset.Legend className="mb-3.5 text-[12px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
        {label}
      </Fieldset.Legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </Fieldset.Root>
  );
}

type InputMode = "text" | "email" | "tel" | "numeric" | "decimal";

function BaseField({
  label,
  k,
  data,
  set,
  errors,
  type = "text",
  placeholder,
  full,
  serif,
  optional,
  inputMode,
  autoComplete,
  min,
  format,
  onBlur,
  className,
}: {
  label: string;
  k: keyof Fields;
  data: Fields;
  set: (k: keyof Fields, v: string) => void;
  errors: Errors;
  type?: string;
  placeholder?: string;
  full?: boolean;
  serif?: boolean;
  optional?: boolean;
  inputMode?: InputMode;
  autoComplete?: string;
  min?: string;
  format?: (v: string) => string;
  onBlur?: (k: keyof Fields) => void;
  className?: string;
}) {
  const invalid = !!errors[k];
  return (
    <Field.Root
      name={k}
      invalid={invalid}
      className={`${full ? "sm:col-span-2" : ""} ${className ?? ""}`}
    >
      <Field.Label className="field-label">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-muted">(optional)</span>}
      </Field.Label>
      <Field.Control
        id={k}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        min={min}
        placeholder={placeholder}
        value={data[k]}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          set(k, format ? format(event.target.value) : event.target.value)
        }
        onBlur={() => onBlur?.(k)}
        className={`field-input ${serif ? "font-serif text-lg" : ""} ${
          invalid ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""
        }`}
      />
      {invalid && <p className="field-error">{errors[k]}</p>}
    </Field.Root>
  );
}

function YesNo({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div id={id} className="sm:col-span-2">
      <span className="field-label">{label}</span>
      <div className="flex gap-2.5">
        {["Yes", "No"].map((opt) => {
          const v = opt.toLowerCase();
          const active = value === v;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(v)}
              className={`flex-1 rounded-[10px] border px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-accent bg-accent-tint text-accent"
                  : "border-[#DDE1E9] bg-white text-ink-soft hover:border-ink-muted/50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
