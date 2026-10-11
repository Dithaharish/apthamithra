/**
 * Verifies sign-out end to end: sign in, confirm the session works, sign out
 * through the real NextAuth endpoint, then confirm the session is dead and
 * protected routes redirect again.
 *
 *   node scripts/test-logout.js https://apthamithra.vercel.app
 */

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "")
const EMAIL = "shopper1@apthamithra.com"
const PASSWORD = "apthamithra123"

const results = []
function check(name, pass, detail = "") {
  results.push(pass)
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`)
}

/**
 * A cookie jar keyed by name so later Set-Cookie values overwrite earlier
 * ones. Appending duplicates makes the browser/server behaviour ambiguous,
 * which produced false results in an earlier version of this script.
 */
function jarFrom(responses) {
  const jar = new Map()
  for (const res of responses) {
    for (const raw of res.headers.getSetCookie()) {
      const [pair] = raw.split(";")
      const idx = pair.indexOf("=")
      const name = pair.slice(0, idx).trim()
      const value = pair.slice(idx + 1).trim()
      if (!name) continue
      if (value === "" || /^(expires|max-age)=/i.test(pair.slice(idx + 1))) {
        jar.delete(name)
      } else {
        jar.set(name, value)
      }
    }
  }
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ")
}

async function main() {
  // 1. Sign in and keep the cookie jar.
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`)
  const { csrfToken } = await csrfRes.json()
  const jar1 = jarFrom([csrfRes])

  const signIn = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: jar1 },
    body: new URLSearchParams({ csrfToken, email: EMAIL, password: PASSWORD, callbackUrl: BASE, json: "true" }),
  })
  check("sign in", signIn.status === 200, `status ${signIn.status}`)

  const cookie = jarFrom([csrfRes, signIn])
  const meBefore = await fetch(`${BASE}/api/auth/me`, { headers: { cookie } }).then((r) => r.json())
  check("session active after sign in", meBefore?.authenticated === true, `role=${meBefore?.user?.role}`)

  // 2. Sign out the way the UI does, reusing the csrf token already bound to
  //    this jar. Fetching a new one replaces the cookie and breaks the pair.
  const signOutRes = await fetch(`${BASE}/api/auth/signout`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie },
    body: new URLSearchParams({ csrfToken, callbackUrl: "/", json: "true" }),
  })
  check("signout endpoint responds", signOutRes.status === 200, `status ${signOutRes.status}`)

  // 3. The session cookie must now be cleared. On HTTPS the cookie carries a
  //    __Secure- prefix, so match the name either way.
  const cleared = signOutRes.headers
    .getSetCookie()
    .some((c) => /^(__Secure-)?next-auth\.session-token=/.test(c) && /Max-Age=0|^\1=;/.test(c))
  check("session cookie cleared", cleared, cleared ? "reset cookie present" : "no reset cookie found")

  // 4. Re-check with the post-signout jar — must be unauthenticated.
  const afterJar = jarFrom([csrfRes, signIn, signOutRes])
  const meAfter = await fetch(`${BASE}/api/auth/me`, { headers: { cookie: afterJar } }).then((r) => r.json())
  check("session dead after sign out", meAfter?.authenticated === false, `authenticated=${meAfter?.authenticated}`)

  // 5. Protected routes must redirect to login again.
  for (const path of ["/dashboard", "/shopper", "/admin"]) {
    const r = await fetch(`${BASE}${path}`, { headers: { cookie: afterJar }, redirect: "manual" })
    check(`${path} protected after sign out`, r.status >= 300 && r.status < 400, `status ${r.status}`)
  }

  const failed = results.filter((r) => !r).length
  console.log(`\n${results.length - failed}/${results.length} checks passed`)
  if (failed) process.exitCode = 1
}

main().catch((e) => {
  console.error("crashed:", e.message)
  process.exitCode = 1
})
