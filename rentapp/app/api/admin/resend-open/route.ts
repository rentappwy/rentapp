import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import crypto from "crypto";
import { signDecision, landlordEmail } from "@/lib/decisions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const admin = process.env.ADMIN_TOKEN ?? "";
  if (!admin || !safeEqual(token, admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const hoursRaw = Number(req.nextUrl.searchParams.get("hours") ?? "48");
  const hours = Number.isFinite(hoursRaw) && hoursRaw > 0 ? Math.min(hoursRaw, 168) : 48;
  const dry = req.nextUrl.searchParams.get("dry") === "1";
  const includeDecided = req.nextUrl.searchParams.get("all") === "1";

  const secret = process.env.STRIPE_SECRET_KEY;
  const apiKey = process.env.RESEND_API_KEY;
  const ds = process.env.DECISION_SECRET ?? "";
  const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get("host") ?? ""}`;
  const to = process.env.LANDLORD_EMAIL || "help@rentapp.homes";
  const from = process.env.EMAIL_FROM || "RentApp <notify@rentapp.homes>";

  if (!secret || !apiKey || !ds) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_SECRET_KEY, RESEND_API_KEY, or DECISION_SECRET" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(secret);
  const cutoff = Math.floor(Date.now() / 1000) - hours * 3600;

  const apps: Stripe.PaymentIntent[] = [];
  let startingAfter: string | undefined;
  try {
    for (let page = 0; page < 10; page++) {
      const res = await stripe.paymentIntents.list({
        created: { gte: cutoff },
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      for (const pi of res.data) {
        const m = pi.metadata ?? {};
        if (pi.status !== "succeeded") continue;
        if (!m.applicant_email) continue;
        if (!includeDecided && m.decision) continue;
        apps.push(pi);
      }
      if (!res.has_more) break;
      startingAfter = res.data[res.data.length - 1]?.id;
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Stripe list failed" },
      { status: 500 },
    );
  }

  if (dry) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      windowHours: hours,
      wouldSend: apps.length,
      applicants: apps.map((pi) => ({
        pi: pi.id,
        name: pi.metadata?.applicant_name ?? "",
        email: pi.metadata?.applicant_email ?? "",
        property: pi.metadata?.property ?? "",
        decided: pi.metadata?.decision ?? null,
      })),
    });
  }

  const resend = new Resend(apiKey);
  const sent: string[] = [];
  const failed: { pi: string; error: string }[] = [];

  for (const pi of apps) {
    const m = (pi.metadata ?? {}) as Record<string, string>;
    const approveUrl = `${base}/api/decision?pi=${encodeURIComponent(pi.id)}&action=approve&sig=${signDecision(pi.id, "approve", ds)}`;
    const denyUrl = `${base}/api/decision?pi=${encodeURIComponent(pi.id)}&action=deny&sig=${signDecision(pi.id, "deny", ds)}`;
    const { subject, html, text } = landlordEmail(m, approveUrl, denyUrl);
    try {
      const { error } = await resend.emails.send({ from, to, subject, html, text, replyTo: to });
      if (error) failed.push({ pi: pi.id, error: JSON.stringify(error) });
      else sent.push(pi.id);
    } catch (err) {
      failed.push({ pi: pi.id, error: err instanceof Error ? err.message : "send failed" });
    }
  }

  return NextResponse.json({
    ok: true,
    windowHours: hours,
    total: apps.length,
    sent: sent.length,
    failedCount: failed.length,
    failed,
  });
}
