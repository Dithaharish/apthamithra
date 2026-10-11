import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

interface ContactPayload {
  name?: string
  email?: string
  subject?: string
  message?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message }: ContactPayload = await req.json()

    if (!name || String(name).trim().length < 2) {
      return NextResponse.json({ error: "Please tell us your name." }, { status: 400 })
    }
    if (!email || !EMAIL_PATTERN.test(String(email))) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 })
    }
    if (!message || String(message).trim().length < 10) {
      return NextResponse.json({ error: "Please write at least 10 characters." }, { status: 400 })
    }

    const body = [
      `Name:    ${String(name).trim()}`,
      `Email:   ${String(email).trim()}`,
      `Subject: ${String(subject ?? "").trim() || "(none)"}`,
      "",
      String(message).trim(),
    ].join("\n")

    // With no provider configured this is logged to the server, which is still
    // better than silently discarding the enquiry. Configure RESEND_API_KEY to
    // deliver it to a real inbox.
    await sendEmail({
      to: process.env.CONTACT_INBOX || "support@apthamithra.com",
      subject: `Website enquiry: ${String(subject ?? "").trim() || "(no subject)"}`,
      text: body,
    })

    return NextResponse.json({ ok: true, message: "Thanks — we have your message and will reply shortly." })
  } catch {
    return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 500 })
  }
}
