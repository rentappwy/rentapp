import crypto from "crypto";

export type AppMeta = Record<string, string>;

/* Fields shown (in order) in the landlord notification email. */
const FIELD_LABELS: [string, string][] = [
  ["applicant_email", "Email"],
  ["applicant_phone", "Phone"],
  ["property", "Applying for"],
  ["move_in", "Desired move-in"],
  ["monthly_income", "Monthly income"],
  ["current_address", "Current address"],
  ["time_at_address", "Time at address"],
  ["landlord_name", "Current landlord"],
  ["landlord_phone", "Landlord phone"],
  ["employer", "Employer"],
  ["job_title", "Job title"],
  ["employer_phone", "Employer phone"],
  ["time_at_job", "Time at job"],
  ["occupants", "Occupants"],
  ["pets", "Pets"],
  ["pets_description", "Pet details"],
  ["emergency_contact", "Emergency contact"],
  ["emergency_phone", "Emergency phone"],
  ["evicted", "Ever evicted"],
  ["broken_lease", "Ever broken a lease"],
  ["signature", "Signature"],
  ["source", "Lead source"],
];

export function escapeHtml(s: string): string {
  return (s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );
}

/* ----- signed, tamper-proof decision links ----- */

export function signDecision(piId: string, action: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(`${piId}:${action}`).digest("hex");
}

export function verifyDecision(piId: string, action: string, sig: string, secret: string): boolean {
  if (!piId || !action || !sig || !secret) return false;
  const expected = signDecision(piId, action, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ------------------------------------------------------------------ */
/*  Email layout — table-based + inline styles so it renders well in   */
/*  Gmail, Outlook, and Apple Mail. Web-safe fonts only (Georgia for   */
/*  headings to echo the site's serif; Arial for body).                */
/* ------------------------------------------------------------------ */

const ACCENT = "#4F46E5";
const INK = "#13161D";
const MUTED = "#737884";
const LINE = "#E6E8EE";
const PAGE = "#F7F8FA";

function emailShell(opts: { preheader: string; body: string; footer: string }): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"></head>
<body style="margin:0;padding:0;background:${PAGE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE};">
  <tr><td align="center" style="padding:28px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td style="padding:0 4px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;"><div style="width:34px;height:34px;background:${ACCENT};border-radius:9px;color:#ffffff;font:700 17px Arial,sans-serif;text-align:center;line-height:34px;">R</div></td>
          <td style="padding-left:10px;vertical-align:middle;font:600 16px Arial,sans-serif;color:${INK};">RentApp</td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#ffffff;border:1px solid ${LINE};border-radius:16px;padding:30px 28px;">
        ${opts.body}
      </td></tr>
      <tr><td style="padding:16px 8px 0;font:400 12px Arial,sans-serif;line-height:1.6;color:#9a9aa0;text-align:center;">
        ${opts.footer}
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 14px;font:500 24px Georgia,'Times New Roman',serif;color:${INK};line-height:1.2;">${escapeHtml(text)}</h1>`;
}

function paragraph(html: string): string {
  return `<p style="margin:0 0 14px;font:400 15px Arial,sans-serif;line-height:1.6;color:#3B414E;">${html}</p>`;
}

/* ----- landlord notification (new application) ----- */

export function landlordEmail(meta: AppMeta, approveUrl: string, denyUrl: string) {
  const name = meta.applicant_name?.trim() || "New applicant";
  const property = meta.property?.trim() || "";
  const subject = `New application — ${name}${property ? ` · ${property}` : ""}`;
  const preheader = `${meta.applicant_email || ""}${meta.monthly_income ? ` · income ${meta.monthly_income}` : ""} — tap to approve or decline.`;

  const rows = FIELD_LABELS.filter(([k]) => (meta[k] ?? "").toString().trim() !== "")
    .map(
      ([k, label]) =>
        `<tr><td style="padding:9px 0;font:400 13px Arial,sans-serif;color:${MUTED};vertical-align:top;width:148px;border-bottom:1px solid #F0F1F4;">${label}</td><td style="padding:9px 0;font:500 13px Arial,sans-serif;color:${INK};vertical-align:top;border-bottom:1px solid #F0F1F4;">${escapeHtml(meta[k])}</td></tr>`,
    )
    .join("");

  const body = `
    <p style="margin:0 0 4px;font:600 11px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${MUTED};">New rental application</p>
    ${heading(name)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE};">${rows}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr>
      <td style="width:50%;padding-right:6px;"><a href="${approveUrl}" style="display:block;background:${ACCENT};color:#ffffff;text-decoration:none;font:600 15px Arial,sans-serif;text-align:center;padding:15px 0;border-radius:10px;">✓&nbsp; Approve</a></td>
      <td style="width:50%;padding-left:6px;"><a href="${denyUrl}" style="display:block;background:#A32D2D;color:#ffffff;text-decoration:none;font:600 15px Arial,sans-serif;text-align:center;padding:15px 0;border-radius:10px;">✕&nbsp; Decline</a></td>
    </tr></table>
    <p style="margin:18px 0 0;font:400 12px Arial,sans-serif;line-height:1.55;color:${MUTED};">You'll get a confirmation screen before anything sends. The one-tap Decline sends a general decline — if a credit or background report factored into the decision, send the adverse-action notice manually instead.</p>`;

  const html = emailShell({
    preheader,
    body,
    footer: "RentApp · Payment confirmed via Stripe",
  });

  const text = `New application — ${name}\n\n${FIELD_LABELS.filter(([k]) => (meta[k] ?? "").trim() !== "")
    .map(([k, label]) => `${label}: ${meta[k]}`)
    .join("\n")}\n\nApprove: ${approveUrl}\nDecline: ${denyUrl}`;

  return { subject, html, text };
}

/* ----- applicant decision email ----- */

export function applicantEmail(action: string, meta: AppMeta) {
  const first = (meta.applicant_name || "there").trim().split(/\s+/)[0];
  const property = meta.property?.trim() || "the home";
  const footer =
    "RentApp · Equal Housing Opportunity<br/><span style=\"color:#b5b5ba;\">Questions? Just reply to this email.</span>";

  if (action === "approve") {
    const subject = `Your application for ${property} — approved`;
    const body = `
      ${heading("You're approved! 🎉")}
      ${paragraph(`Hi ${escapeHtml(first)}, great news — your application for <b>${escapeHtml(property)}</b> has been <b>approved</b>.`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 18px;"><tr><td style="background:${PAGE};border:1px solid ${LINE};border-radius:12px;padding:16px 18px;font:400 14px Arial,sans-serif;line-height:1.6;color:#3B414E;">
        <b style="color:${INK};">What's next</b><br/>We'll follow up shortly with the lease to sign and details on your security deposit &amp; first month's rent. Once those are squared away, we'll confirm your move-in.
      </td></tr></table>
      ${paragraph("Reply to this email with any questions — we're excited to welcome you home.")}
      <p style="margin:0;font:400 15px Arial,sans-serif;color:#3B414E;">— The RentApp Team</p>`;
    const text = `Hi ${first}, great news — your application for ${property} has been approved! We'll follow up shortly with the lease and next steps (security deposit & first month's rent), then confirm your move-in. Reply with any questions. — The RentApp Team`;
    return { subject, html: emailShell({ preheader: `Your application for ${property} has been approved.`, body, footer }), text };
  }

  const subject = `Update on your application for ${property}`;
  const body = `
    ${heading("Application update")}
    ${paragraph(`Hi ${escapeHtml(first)}, thank you for applying for <b>${escapeHtml(property)}</b>.`)}
    ${paragraph("After careful review, we're not able to move forward with your application at this time. We truly appreciate the time you took to apply, and we wish you the very best in your search.")}
    <p style="margin:0;font:400 15px Arial,sans-serif;color:#3B414E;">— The RentApp Team</p>`;
  const text = `Hi ${first}, thank you for applying for ${property}. After review, we're not able to move forward with your application at this time. We appreciate your interest and wish you the best in your search. — The RentApp Team`;
  return { subject, html: emailShell({ preheader: `An update on your application for ${property}.`, body, footer }), text };
}

/* ----- simple HTML page for the confirm/result screens ----- */

export function decisionPage(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} · RentApp</title></head>
<body style="margin:0;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#13161D;">
  <div style="max-width:440px;margin:0 auto;padding:48px 20px;">
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:22px;">
      <span style="display:inline-grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#4F46E5;color:#fff;font-weight:700;">R</span>
      <span style="font-size:15px;font-weight:600;">RentApp</span>
    </div>
    <div style="background:#fff;border:1px solid #E6E8EE;border-radius:16px;padding:28px;font-size:15px;line-height:1.6;">
      <h1 style="margin:0 0 12px;font-size:20px;">${escapeHtml(title)}</h1>
      ${bodyHtml}
    </div>
  </div>
</body></html>`;
}
