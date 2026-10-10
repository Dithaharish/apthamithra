/**
 * End-to-end smoke test for the admin, shopper and customer workspaces.
 *
 * Runs against a live server — start one first:
 *   node node_modules/next/dist/bin/next dev
 *
 *   node scripts/smoke.test.js
 *
 * It signs in as each seeded role, exercises the shopper and admin actions
 * end to end, and asserts that the role guards reject wrong callers.
 */

const BASE = process.env.SMOKE_BASE || "http://localhost:3000"
const PASSWORD = "apthamithra123"

const ACCOUNTS = {
  admin: "admin@apthamithra.com",
  shopper: "shopper1@apthamithra.com",
  customer: "raj.mehta@email.com",
}

const results = []

function check(name, pass, detail = "") {
  results.push({ name, pass })
  const mark = pass ? "PASS" : "FAIL"
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ""}`)
  return pass
}

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

async function json(path, cookie, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    ...init,
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

async function redirect(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" })
  return { status: res.status, location: res.headers.get("location") ?? "" }
}

async function main() {
  for (const [role, email] of Object.entries(ACCOUNTS)) {
    const cookie = await login(email)
    const me = await json("/api/auth/me", cookie)
    check(`sign in as ${role}`, me.body?.authenticated === true, `role=${me.body?.user?.role}`)
  }

  const shopper = await login(ACCOUNTS.shopper)
  const customer = await login(ACCOUNTS.customer)
  const admin = await login(ACCOUNTS.admin)

  for (const [label, path] of [
    ["shopper dashboard", "/shopper"],
    ["shopper appointments", "/shopper/appointments"],
    ["shopper task board", "/shopper/tasks"],
    ["shopper customers", "/shopper/customers"],
    ["shopper profile", "/shopper/profile"],
    ["shopper appointment detail", "/shopper/appointments/APT-001"],
    ["admin orders", "/admin/orders"],
    ["admin appointments", "/admin/appointments"],
  ]) {
    const res = await fetch(`${BASE}${path}`, { headers: { cookie: shopper } })
    check(`${label} renders`, res.status === 200, `status ${res.status}`)
  }

  // Role guards
  const anonymous = await json("/api/shopper/orders", null, {
    method: "PATCH",
    body: JSON.stringify({ id: "ORD-001", status: "purchasing" }),
  })
  check("order update requires sign-in", anonymous.status === 401, `status ${anonymous.status}`)

  const wrongRole = await json("/api/shopper/orders", customer, {
    method: "PATCH",
    body: JSON.stringify({ id: "ORD-001", status: "purchasing" }),
  })
  check("customer cannot update orders", wrongRole.status === 403, `status ${wrongRole.status}`)

  const customerAssigns = await json("/api/admin/assign", customer, {
    method: "POST",
    body: JSON.stringify({ appointmentId: "APT-001", shopperId: "SPK-002" }),
  })
  check("customer cannot assign shoppers", customerAssigns.status === 403, `status ${customerAssigns.status}`)

  // Shopper actions
  const aptMove = await json("/api/shopper/appointments", shopper, {
    method: "PATCH",
    body: JSON.stringify({ id: "APT-001", status: "in_progress" }),
  })
  check("shopper advances own appointment", aptMove.status === 200, `status=${aptMove.body?.appointment?.status}`)

  const orderMove = await json("/api/shopper/orders", shopper, {
    method: "PATCH",
    body: JSON.stringify({ id: "ORD-001", status: "purchasing" }),
  })
  check("shopper advances own order", orderMove.status === 200, `status ${orderMove.status}`)

  const raise = await json("/api/shopper/orders", shopper, {
    method: "POST",
    body: JSON.stringify({
      appointmentId: "APT-001",
      customerId: "USR-cust1",
      destination: "New Jersey, USA",
      notes: "Automated smoke test",
      items: [
        { name: "Silk saree — Kanjivaram", price: 25000, quantity: 1 },
        { name: "Assorted sweets", price: 1200, quantity: 2 },
      ],
    }),
  })
  const total = (raise.body?.order?.subtotal ?? 0) + (raise.body?.order?.serviceFee ?? 0) + (raise.body?.order?.handling ?? 0)
  check("shopper raises order with items", raise.status === 200, `order=${raise.body?.order?.id} total=₹${total}`)

  // Admin actions
  const assign = await json("/api/admin/assign", admin, {
    method: "POST",
    body: JSON.stringify({ appointmentId: "APT-003", shopperId: "SPK-004" }),
  })
  check("admin assigns shopper", assign.status === 200, `status ${assign.status}`)

  const moderate = await json("/api/admin/reviews", admin, {
    method: "PATCH",
    body: JSON.stringify({ id: "REV-002", status: "approved" }),
  })
  check("admin moderates review", moderate.status === 200, `status ${moderate.status}`)

  // Route protection
  for (const path of ["/admin", "/shopper", "/dashboard"]) {
    const r = await redirect(path)
    check(
      `${path} redirects when signed out`,
      r.status >= 300 && r.status < 400 && r.location.includes("/login"),
      `${r.status} -> ${r.location}`
    )
  }

  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
  if (failed.length) {
    console.log(`FAILED: ${failed.map((f) => f.name).join(", ")}`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error("smoke test crashed:", err.message)
  process.exitCode = 1
})
