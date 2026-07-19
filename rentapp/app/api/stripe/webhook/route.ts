import { NextRequest } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { signDecision, landlordEmail } from "@/lib/decisions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !whSecret) {
    return new Response("Webhook not configured", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();
  const stripe = new Stripe(secret);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = (session.metadata ?? {}) as Record<string, string>;
    const piId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? "");

    const base =
      process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get("host") ?? "rentapp.homes"}`;
    const ds = process.env.DECISION_SECRET ?? "";
    const approveUrl = `${base}/api/decision?pi=${encodeURIComponent(piId)}&action=approve&sig=${signDecision(piId, "approve", ds)}`;
    const denyUrl = `${base}/api/decision?pi=${encodeURIComponent(piId)}&action=deny&sig=${signDecision(piId, "deny", ds)}`;

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.LANDLORD_EMAIL || "help@rentapp.homes";
    const from = process.env.EMAIL_FROM || "RentApp <notify@rentapp.homes>";

    if (!apiKey) {
      console.warn("RESEND_API_KEY not set — skipping application notification email");
      return new Response(JSON.stringify({ received: true, emailed: false }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    const resend = new Resend(apiKey);
    const { subject, html, text } = landlordEmail(meta, approveUrl, denyUrl);
    try {
      const { error } = await resend.emails.send({ from, to, subject, html, text, replyTo: to });
      if (error) {
        console.error("Resend rejected application notification:", JSON.stringify(error));
        return new Response("Email send failed", { status: 500 });
      }
    } catch (err) {
      console.error("Failed to send application notification", err);
      // Return 500 so Stripe retries (transient failures recover).
      return new Response("Email send failed", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
