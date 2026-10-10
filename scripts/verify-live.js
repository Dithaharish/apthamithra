/**
 * Verifies the live deployment can actually reach Supabase.
 * Logs in as the seeded shopper, then reads a database-backed page.
 *
 *   node scripts/verify-live.js https://apthamithra.vercel.app
 */

const BASE = (process.argv[2] || "https://apthamithra.vercel.app").replace(/\/$/, "")
const PASSWORD = "apthamithra123"

async function login(email) {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`)
  const { csrfToken } = await csrfRes.json()
  const cookies = [...csrfRes.headers.getSetCookie()]

  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: cookies.join("; ") },
    body: new URLSearchParams({ csrfToken, email, password: PASSWORD, callbackUrl: BASE, json: "true" }),
  })
  cookies.push(...res.headers.getSetCookie())
  return cookies.map((c) => c.split(";")[0]).filter(Boolean).join("; ")
}

function report(label, pass, detail = "") {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`)
  return pass
}

async function main() {
  const results = []

  // Unauthenticated DB-backed endpoint (should not error)
  const anon = await fetch(`${BASE}/api/auth/me`).then((r) => r.json())
  results.push(report("api/auth/me responds", anon?.ok === true, `authenticated=${anon?.authenticated}`))

  // Sign in — this alone proves the users table is readable in production
  let cookie
  try {
    cookie = await login("shopper1@apthamithra.com")
  } catch (e) {
    results.push(report("sign in", false, e.message))
  }

  if (cookie) {
    const me = await fetch(`${BASE}/api/auth/me`, { headers: { cookie } }).then((r) => r.json())
    results.push(
      report("sign in as shopper", me?.authenticated === true, `role=${me?.user?.role} name=${me?.user?.name}`)
    )

    // These pages read appointments, orders, shoppers and customers.
    for (const [label, path] of [
      ["shopper dashboard reads DB", "/shopper"],
      ["shopper appointments reads DB", "/shopper/appointments"],
      ["shopper task board reads DB", "/shopper/tasks"],
      ["shopper customers reads DB", "/shopper/customers"],
    ]) {
      const res = await fetch(`${BASE}${path}`, { headers: { cookie }, redirect: "manual" })
      results.push(report(label, res.status === 200, `status ${res.status}`))
    }

    // A page that definitely renders seeded names if the query worked.
    const html = await fetch(`${BASE}/shopper/customers`, { headers: { cookie } }).then((r) => r.text())
    results.push(
      report("seeded customer rendered from DB", /Raj Mehta|Anita Shah|Vikram Nair/.test(html))
    )
  }

  const failed = results.filter((r) => !r)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
  if (failed.length) process.exitCode = 1
}

main().catch((e) => {
  console.error("verify crashed:", e.message)
  process.exitCode = 1
})
