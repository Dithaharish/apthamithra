/**
 * Transactional email.
 *
 * A provider is optional. With no key configured the message is written to the
 * server log instead of being sent, so the full flow is testable locally. The
 * link is never returned in an HTTP response — read the server console.
 *
 * To enable real delivery set one of:
 *   RESEND_API_KEY   -> Resend (https://resend.com)
 *   SENDGRID_API_KEY -> SendGrid
 * and EMAIL_FROM to a verified sender address.
 */

const FROM = process.env.EMAIL_FROM || "Apthamithra <no-reply@apthamithra.com>"

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY)
}

interface Mail {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail(mail: Mail): Promise<{ delivered: boolean; via: string }> {
  const provider = process.env.RESEND_API_KEY ? "resend" : process.env.SENDGRID_API_KEY ? "sendgrid" : null

  if (!provider) {
    // Development fallback. Log the full message so the link can be clicked.
    console.log("\n--- EMAIL (no provider configured, not sent) ---")
    console.log(`To:      ${mail.to}`)
    console.log(`Subject: ${mail.subject}`)
    console.log(mail.text)
    console.log("------------------------------------------------\n")
    return { delivered: false, via: "console" }
  }

  if (provider === "resend") {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      }),
    })
    if (!res.ok) {
      throw new Error(`Resend rejected the message: ${res.status}`)
    }
    return { delivered: true, via: "resend" }
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: mail.to }] }],
      from: { email: FROM },
      subject: mail.subject,
      content: [
        { type: "text/plain", value: mail.text },
        ...(mail.html ? [{ type: "text/html", value: mail.html }] : []),
      ],
    }),
  })
  if (!res.ok) {
    throw new Error(`SendGrid rejected the message: ${res.status}`)
  }
  return { delivered: true, via: "sendgrid" }
}

/* ------------------------------------------------------------------ */
/* Message templates                                                   */
/* ------------------------------------------------------------------ */

export function verificationEmail(name: string, link: string) {
  const firstName = name.split(" ")[0]
  return {
    subject: "Confirm your email address — Apthamithra",
    text: `Hi ${firstName},

Please confirm this email address for your Apthamithra account:

${link}

This link expires in 24 hours. If you did not create an account you can ignore this message.

Apthamithra — Rooted in trust. Always by your side.`,
    html: `<p>Hi ${firstName},</p>
<p>Please confirm this email address for your Apthamithra account:</p>
<p><a href="${link}">${link}</a></p>
<p>This link expires in 24 hours. If you did not create an account you can ignore this message.</p>
<p>Apthamithra — Rooted in trust. Always by your side.</p>`,
  }
}

export function resetEmail(name: string, link: string) {
  const firstName = name.split(" ")[0]
  return {
    subject: "Reset your Apthamithra password",
    text: `Hi ${firstName},

We received a request to reset your Apthamithra password:

${link}

This link expires in 1 hour and can be used once. If you did not request a reset, ignore this message — your password stays unchanged.

Apthamithra — Rooted in trust. Always by your side.`,
    html: `<p>Hi ${firstName},</p>
<p>We received a request to reset your Apthamithra password:</p>
<p><a href="${link}">${link}</a></p>
<p>This link expires in 1 hour and can be used once. If you did not request a reset, ignore this message — your password stays unchanged.</p>
<p>Apthamithra — Rooted in trust. Always by your side.</p>`,
  }
}
