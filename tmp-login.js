const BASE = process.argv[2] || "http://localhost:3000"
const EMAIL = process.argv[3] || "shopper1@apthamithra.com"
const PASSWORD = process.argv[4] || "apthamithra123"

async function main() {
  console.log(`target: ${BASE}  user: ${EMAIL}`)

  // 1. Is the API up at all?
  const me = await fetch(`${BASE}/api/auth/me`).then((r) => r.json()).catch((e) => ({ error: e.message }))
  console.log("  /api/auth/me:", JSON.stringify(me).slice(0, 160))

  // 2. Attempt sign-in
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`)
  const { csrfToken } = await csrfRes.json()
  const cookies = [...csrfRes.headers.getSetCookie()]

  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: cookies.join("; ") },
    body: new URLSearchParams({ csrfToken, email: EMAIL, password: PASSWORD, callbackUrl: BASE, json: "true" }),
  })

  const body = await res.text()
  console.log("  sign-in status:", res.status)
  console.log("  sign-in body:", body.slice(0, 300))
  const sessCookie = res.headers.getSetCookie().some((c) => c.startsWith("next-auth.session-token"))
  console.log("  session cookie set:", sessCookie)

  // 3. If signed in, try an authenticated read.
  if (sessCookie) {
    const jar = [...cookies, ...res.headers.getSetCookie()].map((c) => c.split(";")[0]).join("; ")
    const page = await fetch(`${BASE}/dashboard`, { headers: { cookie: jar }, redirect: "manual" })
    console.log("  /dashboard status:", page.status)
    const html = await page.text()
    if (/Supabase is not configured/i.test(html)) console.log("  !! page reports Supabase not configured")
    if (/Internal Server Error/i.test(html)) console.log("  !! page reports internal server error")
    if (/Welcome back/.test(html)) console.log("  dashboard rendered a greeting")
  }
}

main().catch((e) => {
  console.error("crashed:", e.message)
  process.exitCode = 1
})
