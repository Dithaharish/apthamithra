/**
 * Exercises the full password-reset round trip against a live deployment.
 *
 * With no email provider configured the reset link is written to the server
 * console rather than sent, so this script reads it back from the database and
 * follows it. That proves the whole flow without needing SMTP.
 *
 *   node --env-file=.env scripts/test-reset.js http://localhost:3000
 */

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "")

const { createClient } = require("@supabase/supabase-js")
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const results = []
function check(name, pass, detail = "") {
  results.push(pass)
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`)
}

async function main() {
  const testEmail = `reset-${Date.now()}@example.com`
  const originalPassword = "original-password-123"
  const newPassword = "brand-new-password-456"

  // 1. Register an account
  const reg = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Reset Test", email: testEmail, password: originalPassword }),
  })
  check("register account", reg.status === 200, `status ${reg.status}`)

  // 2. The verification token should have been issued automatically
  const { data: created } = await supabase
    .from("users")
    .select("email_verified, verify_token")
    .eq("email", testEmail)
    .single()
  check("verification token issued on register", Boolean(created?.verify_token))
  check("account starts unverified", created?.email_verified === false)

  // 3. Confirm the email address with that token
  const verify = await fetch(`${BASE}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: created.verify_token }),
  })
  check("verify email succeeds", verify.status === 200, `status ${verify.status}`)

  const { data: verified } = await supabase
    .from("users")
    .select("email_verified, verify_token")
    .eq("email", testEmail)
    .single()
  check("email_verified flipped to true", verified?.email_verified === true)
  check("verify token cleared after use", verified?.verify_token === null)

  // 4. Re-verifying the same token must not work twice
  const replay = await fetch(`${BASE}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: created.verify_token }),
  })
  check("verify token is single-use", replay.status === 400, `status ${replay.status}`)

  // 5. Request a password reset
  const forgot = await fetch(`${BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  })
  check("forgot-password accepts known email", forgot.status === 200, `status ${forgot.status}`)

  const { data: withToken } = await supabase
    .from("users")
    .select("reset_token, reset_expires_at")
    .eq("email", testEmail)
    .single()
  check("reset token stored", Boolean(withToken?.reset_token))
  check(
    "reset expiry set about an hour out",
    withToken?.reset_expires_at &&
      new Date(withToken.reset_expires_at).getTime() - Date.now() > 30 * 60 * 1000
  )

  // 6. Complete the reset
  const reset = await fetch(`${BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: withToken.reset_token, password: newPassword }),
  })
  check("reset password succeeds", reset.status === 200, `status ${reset.status}`)

  const { data: cleared } = await supabase
    .from("users")
    .select("reset_token")
    .eq("email", testEmail)
    .single()
  check("reset token cleared after use", cleared?.reset_token === null)

  // 7. The old password must no longer work, the new one must
  async function signIn(password) {
    const csrfRes = await fetch(`${BASE}/api/auth/csrf`)
    const { csrfToken } = await csrfRes.json()
    const cookies = [...csrfRes.headers.getSetCookie()]

    const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
      method: "POST",
      redirect: "manual",
      headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: cookies.join("; ") },
      body: new URLSearchParams({
        csrfToken,
        email: testEmail,
        password,
        callbackUrl: BASE,
        json: "true",
      }),
    })

    // With json=true a rejected sign-in answers 401 and sets no session cookie.
    const ok = res.status === 200
    const gotSession = res.headers.getSetCookie().some((c) => c.startsWith("next-auth.session-token"))
    return ok && gotSession
  }

  check("old password rejected", !(await signIn(originalPassword)))
  check("new password accepted", await signIn(newPassword))

  // 8. Unknown email must not reveal anything
  const unknown = await fetch(`${BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "definitely-not-a-user@example.com" }),
  })
  check("forgot-password hides account existence", unknown.status === 200, `status ${unknown.status}`)

  const failed = results.filter((r) => !r).length
  console.log(`\n${results.length - failed}/${results.length} checks passed`)
  if (failed) process.exitCode = 1
}

main().catch((e) => {
  console.error("test crashed:", e.message)
  process.exitCode = 1
})
