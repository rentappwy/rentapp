import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const APPLICATION_FEE_CENTS = 3999;

function clip(value: unknown, max: number): string {
  return String(value ?? "").slice(0, max);
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      {
        error:
          "Online payment isn't switched on yet. Please contact us and we'll help you finish your application.",
      },
      { status: 503 },
    );
  }

  let data: Record<string, unknown> = {};
  try {
    data = await req.json();
  } catch {
    // ignore — we'll just create a checkout with empty metadata
  }

  const stripe = new Stripe(secret);

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    `https://${req.headers.get("host") ?? ""}`;

  const applicantName = clip(data.fullName, 200);
  const applicantEmail = clip(data.email, 200);

  // Prefer the fixed catalog Price (set STRIPE_PRICE_ID in the environment) so the
  // Stripe product catalog stays clean — one product, one price, reused every time.
  // Falls back to an inline price if unset, which keeps the app working in any mode.
  const priceId = process.env.STRIPE_PRICE_ID;
  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: APPLICATION_FEE_CENTS,
          product_data: {
            name: "RentApp — Rental Application Fee",
            description: "One-time rental application processing & screening fee.",
          },
        },
      };

  const meta: Record<string, string> = {
    applicant_name: applicantName,
    applicant_email: applicantEmail,
    applicant_phone: clip(data.phone, 100),
    property: clip(data.propertyAddress, 400),
    move_in: clip(data.moveInDate, 50),
    current_address: clip(data.currentAddress, 300),
    time_at_address: clip(data.timeAtAddress, 50),
    landlord_name: clip(data.currentLandlordName, 200),
    landlord_phone: clip(data.landlordPhone, 50),
    employer: clip(data.employer, 200),
    job_title: clip(data.jobTitle, 120),
    employer_phone: clip(data.employerPhone, 50),
    time_at_job: clip(data.timeAtJob, 50),
    monthly_income: clip(data.monthlyIncome, 50),
    occupants: clip(data.occupants, 20),
    pets: clip(data.pets, 10),
    pets_description: clip(data.petsDescription, 200),
    emergency_contact: clip(data.emergencyContactName, 200),
    emergency_phone: clip(data.emergencyContactPhone, 50),
    evicted: clip(data.evicted, 10),
    broken_lease: clip(data.brokenLease, 10),
    signature: clip(data.signature, 200),
    source: clip(data.source, 120),
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      ...(applicantEmail ? { customer_email: applicantEmail } : {}),
      line_items: [lineItem],
      // Show the "Add promotion code" field on Stripe Checkout.
      allow_promotion_codes: true,
      metadata: meta,
      // Copy the application onto the PaymentIntent too, so the decision
      // endpoint can read it (and record the approve/decline there).
      payment_intent_data: { metadata: meta },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start checkout. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
