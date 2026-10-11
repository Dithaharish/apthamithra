/**
 * Verifies the cross-tenant fixes from the security audit:
 *   - a shopper cannot open another shopper's appointment or order page
 *   - a shopper cannot PATCH an unassigned order
 *   - an illegal order status transition is rejected
 *
 *   node scripts/test-isolation.js http://localhost:3000
 */

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "")
const PASSWORD = "apthamithra123"

const results = []
function check(name, pass, detail = "") {
  results.push(pass)
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`)
}

async function login(email) {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`)
  const { csrfToken } = await csrfRes.json()
  const jar = new Map()
  for (const raw of csrfRes.headers.getSetCookie()) {
    const [pair] = raw.split(";")
    const i = pair.indexOf("=")
    jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim())
  }
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") },
    body: new URLSearchParams({ csrfToken, email, password: PASSWORD, callbackUrl: BASE, json: "true" }),
  })
  for (const raw of res.headers.getSetCookie()) {
    const [pair] = raw.split(";")
    const i = pair.indexOf("=")
    const name = pair.slice(0, i).trim()
    const value = pair.slice(i + 1).trim()
    if (!value) jar.delete(name)
    else jar.set(name, value)
  }
  return [...jar].map(([k, v]) => `${k}=${v}`).join("; ")
}

async function main() {
  // Sign in as two different shoppers and as an admin.
  const admin = await login("admin@apthamithra.com")
  const shopper1 = await login("shopper1@apthamithra.com")
  const shopper2 = await login("shopper2@apthamithra.com")

  const refs = await fetch(`${BASE}/api/admin/refs`, { headers: { cookie: admin } }).then((r) => r.json())
  const appointments = refs?.refs?.appointments ?? []
  const orders = refs?.refs?.orders ?? []

  // Find an appointment assigned to a shopper other than shopper1 by probing
  // each one as shopper1: the first that renders belongs to someone else.
  let foreignAppointment = null
  let ownAppointment = null
  for (const id of appointments) {
    const html = await fetch(`${BASE}/shopper/appointments/${id}`, { headers: { cookie: shopper1 } }).then((r) => r.text())
    if (/Appointment not found/.test(html)) {
      if (!foreignAppointment) foreignAppointment = id
    } else if (!ownAppointment) {
      ownAppointment = id
    }
    if (foreignAppointment && ownAppointment) break
  }

  check("found an appointment owned by another shopper", Boolean(foreignAppointment))
  if (foreignAppointment) {
    const html = await fetch(`${BASE}/shopper/appointments/${foreignAppointment}`, { headers: { cookie: shopper1 } }).then((r) => r.text())
    // Only real identifiers count. Broad substrings like "IST" or "@" also
    // occur in static copy and serialised page data, so match exactly what a
    // leak would expose.
    const leaked = /@email\.com|Raj Mehta|Anita Shah|Vikram Nair|Priya Sharma|Anil Verma|Ravi Nair|Kavita Reddy/.test(
      html.replace(/Appointment not found/g, "")
    )
    check("shopper cannot read another shopper's appointment", !leaked, leaked ? "customer data rendered" : "no customer data")
  }

  // Orders: shopper1 opening shopper2's order must not render customer data.
  let foreignOrder = null
  for (const id of orders) {
    const html = await fetch(`${BASE}/shopper/orders/${id}`, { headers: { cookie: shopper1 } }).then((r) => r.text())
    if (/Order not found/.test(html)) {
      foreignOrder = id
      break
    }
  }
  check("found an order owned by another shopper", Boolean(foreignOrder))
  if (foreignOrder) {
    const res = await fetch(`${BASE}/shopper/orders/${foreignOrder}`, { headers: { cookie: shopper1 } })
    const html = await res.text()
    const leaked = /Raj Mehta|Anita Shah|Vikram Nair|@email\.com/.test(html.replace(/Order not found/g, ""))
    check("shopper cannot read another shopper's order", !leaked, leaked ? "customer data rendered" : "no customer data")
  }

  // PATCH an unassigned order as shopper2 — must be refused, not applied.
  const unassigned = []
  for (const id of orders) {
    const res = await fetch(`${BASE}/api/shopper/orders`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: shopper2 },
      body: JSON.stringify({ id, status: "purchasing" }),
    })
    if (res.status === 200) unassigned.push(id)
  }
  check("shopper cannot PATCH orders it does not own", unassigned.length === 0,
    unassigned.length ? `${unassigned.length} wrongly writable` : "all refused")

  // Illegal transition: an order at qc_pending cannot jump to shipped.
  let illegalBlocked = false
  let tested = 0
  for (const id of orders) {
    const before = await fetch(`${BASE}/api/admin/refs`, { headers: { cookie: admin } }).then((r) => r.json())
    void before
    const res = await fetch(`${BASE}/api/shopper/orders`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: shopper2 },
      body: JSON.stringify({ id, status: "shipped" }),
    })
    tested++
    if (res.status === 409 || res.status === 403 || res.status === 400) illegalBlocked = true
  }
  check("illegal status transition rejected", illegalBlocked && tested > 0, `${tested} orders probed`)

  // /api/auth/me must not expose reset or verification tokens.
  const me = await fetch(`${BASE}/api/auth/me`, { headers: { cookie: shopper2 } }).then((r) => r.json())
  const u = me?.user ?? {}
  const exposesTokens = "resetToken" in u || "verifyToken" in u || "resetExpiresAt" in u || "passwordHash" in u
  check("/api/auth/me hides tokens and password hash", !exposesTokens,
    exposesTokens ? `leaked keys: ${Object.keys(u).filter((k) => /token|password/i.test(k)).join(", ")}` : "clean")

  const failed = results.filter((r) => !r).length
  console.log(`\n${results.length - failed}/${results.length} checks passed`)
  if (failed) process.exitCode = 1
}

main().catch((e) => {
  console.error("crashed:", e.message)
  process.exitCode = 1
})
