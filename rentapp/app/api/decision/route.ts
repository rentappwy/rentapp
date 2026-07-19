import { NextRequest } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { verifyDecision, applicantEmail, decisionPage, escapeHtml } from "@/lib/decisions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function htmlResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function parse(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return {
    pi: searchParams.get("pi") ?? "",
    action: searchParams.get("action") ?? "",
    sig: searchParams.get("sig") ?? "",
  };
}

// GET = show a confirmation screen only (no side effects, so email link
// scanners can't accidentally trigger a decision).
export async function GET(req: NextRequest) {
  const { pi, action, sig } = parse(req);
  const ds = process.env.DECISION_SECRET ?? "";

  if (!["approve", "deny"].includes(action) || !verifyDecision(pi, action, sig, ds)) {
    return htmlResponse(decisionPage("Invalid link", "<p>This decision link is invalid or has expired.</p>"), 400);
  }

  let who = "this applicant";
  const secret = process.env.STRIPE_SECRET_KEY;
  if (secret) {
    try {
      const stripe = new Stripe(secret);
      const piObj = await stripe.paymentIntents.retrieve(pi);
      const m = piObj.metadata ?? {};
      if (m.decision) {
        return htmlResponse(
          decisionPage("Already decided", `<p>This application was already marked <b>${escapeHtml(m.decision)}</b> on ${escapeHtml((m.decided_at || "").slice(0, 10))}. No email was re-sent.</p>`),
        );
      }
      if (m.applicant_name) {
        who = `${m.applicant_name}${m.property ? ` — ${m.property}` : ""}`;
      }
    } catch {
      // ignore; we'll still show the confirm screen
    }
  }

  const verb = action === "approve" ? "Approve" : "Decline";
  const color = action === "approve" ? "#4F46E5" : "#A32D2D";
  const body = `
    <p style="margin:0 0 20px;color:#3B414E;">You're about to <b>${verb.toLowerCase()}</b> ${escapeHtml(who)} and email them the decision. This can't be undone.</p>
    <form method="post" action="/api/decision?pi=${encodeURIComponent(pi)}&action=${action}&sig=${sig}">
      <button type="submit" style="display:block;width:100%;background:${color};color:#fff;border:none;font-weight:600;font-size:16px;padding:16px;border-radius:10px;cursor:pointer;">Confirm — ${verb} &amp; send email</button>
    </form>`;
  return htmlResponse(decisionPage(`${verb} application`, body));
}

// POST = perform the decision: record it on the PaymentIntent and email the applicant.
export async function POST(req: NextRequest) {
  const { pi, action, sig } = parse(req);
  const ds = process.env.DECISION_SECRET ?? "";
  const secret = process.env.STRIPE_SECRET_KEY;

  if (!["approve", "deny"].includes(action) || !verifyDecision(pi, action, sig, ds) || !secret) {
    return htmlResponse(decisionPage("Invalid link", "<p>This decision link is invalid.</p>"), 400);
  }

  const stripe = new Stripe(secret);
  let piObj: Stripe.PaymentIntent;
  try {
    piObj = await stripe.paymentIntents.retrieve(pi);
  } catch {
    return htmlResponse(decisionPage("Not found", "<p>Couldn't find that application.</p>"), 404);
  }

  const m = (piObj.metadata ?? {}) as Record<string, string>;
  if (m.decision) {
    return htmlResponse(
      decisionPage("Already decided", `<p>This application was already marked <b>${escapeHtml(m.decision)}</b>. No email was re-sent.</p>`),
    );
  }

  // Record the decision on the PaymentIntent (acts as our lightweight store).
  try {
    await stripe.paymentIntents.update(pi, {
      metadata: { ...m, decision: action, decided_at: new Date().toISOString() },
    });
  } catch (err) {
    console.error("Failed to record decision", err);
  }

  // Email the applicant.
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "RentApp <notify@rentapp.homes>";
  const replyTo = process.env.LANDLORD_EMAIL || "help@rentapp.homes";
  const applicantTo = m.applicant_email || "";
  let sent = false;
  if (apiKey && applicantTo) {
    const resend = new Resend(apiKey);
    const { subject, html, text } = applicantEmail(action, m);
    try {
      const { error } = await resend.emails.send({ from, to: applicantTo, subject, html, text, replyTo });
      if (error) {
        console.error("Resend rejected applicant email:", JSON.stringify(error));
      } else {
        sent = true;
      }
    } catch (err) {
      console.error("Failed to send applicant email", err);
    }
  }

  const verb = action === "approve" ? "Approved" : "Declined";
  const body = sent
    ? `<p><b>${verb}.</b> The decision email was sent to ${escapeHtml(applicantTo)}.</p><p style="color:#737884;font-size:13px;">You can close this page.</p>`
    : `<p><b>${verb}</b> — recorded in Stripe, but the email wasn't sent (check that RESEND_API_KEY is set and the applicant has an email). You can email them from help@rentapp.homes.</p>`;
  return htmlResponse(decisionPage(verb, body));
}
