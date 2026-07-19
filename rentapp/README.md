# Rental Application

A clean, modern rental application website. Applicants fill out a short multi-step
form and pay a **$39.99 application fee** via Stripe Checkout to submit.



## Tech

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS for styling
- Stripe Checkout for the application fee

## The one thing you must do to take payments: add your Stripe key

Payments use a **separate Stripe account** (not TrueCap's). The app reads a single
environment variable, `STRIPE_SECRET_KEY`. Until it's set, the form works but the
final "Pay" button shows a friendly "payment isn't switched on yet" message.

### On Vercel (production)

1. Create / sign in to the Stripe account you want to use for rentals → <https://dashboard.stripe.com>
2. Get your secret key: **Developers → API keys → Secret key**
   - `sk_test_...` while testing, `sk_live_...` when you're ready to charge real cards.
3. In Vercel: **your project → Settings → Environment Variables**
   - Name: `STRIPE_SECRET_KEY`
   - Value: your key
   - Save, then **redeploy** (Deployments → ⋯ → Redeploy).

That's it — the $39.99 fee will now be collected.

### Local development

```bash
npm install
cp .env.example .env.local      # then paste your sk_test_... key into .env.local
npm run dev                     # http://localhost:3000
```

## Where applications + payments show up

There's no database (kept intentionally simple). Each paid application appears in your
**Stripe Dashboard → Payments**. Click a payment to see the applicant's details
(name, email, phone, property, move-in date, income, employer) under **Metadata**.
Stripe also emails the applicant a receipt.

> Want applications emailed to you, saved to a spreadsheet, or stored in a database?
> That's an easy add-on — just ask.

## Customizing

- **Business name** — `components/ApplicationForm.tsx`, the `BRAND` constant at the top.
- **Fee amount** — change `APPLICATION_FEE_CENTS` in `app/api/checkout/route.ts`
  (e.g. `3999` = $39.99) **and** the `FEE_LABEL` shown in `components/ApplicationForm.tsx`.
- **Form fields** — the steps live in `components/ApplicationForm.tsx`.
- **Colors / fonts** — `tailwind.config.ts` and `app/globals.css`.

## Project structure

```
app/
  layout.tsx              # fonts + base layout
  page.tsx                # renders the application form
  globals.css             # Tailwind + base styles
  success/page.tsx        # confirmation screen after payment
  api/checkout/route.ts   # creates the Stripe Checkout session
components/
  ApplicationForm.tsx     # the multi-step form (the whole UI)
```
