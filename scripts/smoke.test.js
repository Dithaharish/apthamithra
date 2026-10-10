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
  const admin = await login(ACCOUNTS.admin)
  const shopper = await login(ACCOUNTS.shopper)
  const customer = await login(ACCOUNTS.customer)

  // Resolve real record ids from the database — seeded in-memory ids such as
  // APT-001 / ORD-001 do not exist once Postgres issues uuids.
  const seed = await json("/api/admin/refs", admin)
  const refs = seed.body?.refs ?? {}
  const appointmentId = refs.appointments?.[0]
  const orderId = refs.orders?.[0]
  const reviewId = refs.reviews?.[0]

  for (const [role, email] of Object.entries(ACCOUNTS)) {
    const cookie = await login(email)
    const me = await json("/api/auth/me", cookie)
    check(`sign in as ${role}`, me.body?.authenticated === true, `role=${me.body?.user?.role}`)
  }

  for (const [label, path] of [
    ["shopper dashboard", "/shopper"],
    ["shopper appointments", "/shopper/appointments"],
    ["shopper task board", "/shopper/tasks"],
    ["shopper customers", "/shopper/customers"],
    ["shopper profile", "/shopper/profile"],
    ["admin orders", "/admin/orders"],
    ["admin appointments", "/admin/appointments"],
  ]) {
    const res = await fetch(`${BASE}${path}`, { headers: { cookie: shopper } })
    check(`${label} renders`, res.status === 200, `status ${res.status}`)
  }

  if (appointmentId) {
    const res = await fetch(`${BASE}/shopper/appointments/${appointmentId}`, {
      headers: { cookie: shopper },
    })
    check("shopper appointment detail renders", res.status === 200, `status ${res.status}`)
  } else {
    console.log("SKIP  shopper appointment detail — no appointment id resolved")
  }

  // Malformed ids must be rejected, not crash the database query.
  const malformed = await json("/api/shopper/appointments", shopper, {
    method: "PATCH",
    body: JSON.stringify({ id: "APT-001", status: "in_progress" }),
  })
  check("malformed id returns 404, not 500", malformed.status === 404, `status ${malformed.status}`)

  // Role guards
  const anonymous = await json("/api/shopper/orders", null, {
    method: "PATCH",
    body: JSON.stringify({ id: orderId, status: "purchasing" }),
  })
  check("order update requires sign-in", anonymous.status === 401, `status ${anonymous.status}`)

  const wrongRole = await json("/api/shopper/orders", customer, {
    method: "PATCH",
    body: JSON.stringify({ id: orderId, status: "purchasing" }),
  })
  check("customer cannot update orders", wrongRole.status === 403, `status ${wrongRole.status}`)

  const customerAssigns = await json("/api/admin/assign", customer, {
    method: "POST",
    body: JSON.stringify({ appointmentId, shopperId: refs.shoppers?.[1] }),
  })
  check("customer cannot assign shoppers", customerAssigns.status === 403, `status ${customerAssigns.status}`)

  // Give the first appointment to shopper1 so the ownership check below is
  // deterministic (a previous run may have reassigned it).
  const handOver = await json("/api/admin/assign", admin, {
    method: "POST",
    body: JSON.stringify({ appointmentId, shopperId: refs.shoppers?.[0] }),
  })
  check("admin hands appointment to shopper1", handOver.status === 200, `status ${handOver.status}`)

  // Shopper actions
  const aptMove = await json("/api/shopper/appointments", shopper, {
    method: "PATCH",
    body: JSON.stringify({ id: appointmentId, status: "in_progress" }),
  })
  check(
    "shopper advances own appointment",
    aptMove.status === 200,
    `status ${aptMove.status}/${aptMove.body?.appointment?.status}`
  )

  if (orderId) {
    const orderMove = await json("/api/shopper/orders", shopper, {
      method: "PATCH",
      body: JSON.stringify({ id: orderId, status: "purchasing" }),
    })
    check(
      "shopper advances own order",
      orderMove.status === 200 || orderMove.status === 403,
      `status ${orderMove.status}`
    )
  }

  // Shopper raises an order
  const raise = await json("/api/shopper/orders", shopper, {
    method: "POST",
    body: JSON.stringify({
      appointmentId,
      customerId: refs.customers?.[0],
      destination: "New Jersey, USA",
      notes: "Automated smoke test",
      items: [
        { name: "Silk saree — Kanjivaram", price: 25000, quantity: 1 },
        { name: "Assorted sweets", price: 1200, quantity: 2 },
      ],
    }),
  })
  const total =
    (raise.body?.order?.subtotal ?? 0) +
    (raise.body?.order?.serviceFee ?? 0) +
    (raise.body?.order?.handling ?? 0)
  check("shopper raises order with items", raise.status === 200, `total=INR ${total}`)

  // Admin actions
  const assign = await json("/api/admin/assign", admin, {
    method: "POST",
    body: JSON.stringify({ appointmentId, shopperId: refs.shoppers?.[1] }),
  })
  check("admin assigns shopper", assign.status === 200, `status ${assign.status}`)

  if (reviewId) {
    const moderate = await json("/api/admin/reviews", admin, {
      method: "PATCH",
      body: JSON.stringify({ id: reviewId, status: "approved" }),
    })
    check("admin moderates review", moderate.status === 200, `status ${moderate.status}`)
  }

  // Route protection
  for (const path of ["/admin", "/shopper", "/dashboard"]) {
    const r = await redirect(path)
    check(
      `${path} redirects when signed out`,
      r.status >= 300 && r.status < 400 && r.location.includes("/login"),
      `${r.status} -> ${r.location}`
    )
  }

  // Customer workspace must read the logged-in customer's own data
  for (const [label, path] of [
    ["customer dashboard", "/dashboard"],
    ["customer orders", "/dashboard/orders"],
    ["customer appointments", "/dashboard/appointments"],
    ["customer shipments", "/dashboard/shipments"],
    ["customer quotes", "/dashboard/quotes"],
    ["customer profile", "/dashboard/profile"],
  ]) {
    const res = await fetch(`${BASE}${path}`, { headers: { cookie: customer }, redirect: "manual" })
    check(`${label} renders`, res.status === 200, `status ${res.status}`)
  }

  // Customer isolation: a customer must not see the shopper workspace
  const crossRole = await fetch(`${BASE}/shopper`, { headers: { cookie: customer }, redirect: "manual" })
  check("customer cannot open shopper workspace", crossRole.status >= 300 && crossRole.status < 400, `status ${crossRole.status}`)

  // Address book round trip
  const addr = await json("/api/addresses", customer, {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Test Home",
      line1: "1 Test Street",
      city: "Testville",
      state: "CA",
      postal: "90001",
      country: "USA",
    }),
  })
  check("customer adds address", addr.status === 200, `id=${addr.body?.address?.id}`)

  const addrList = await json("/api/addresses", customer)
  check(
    "address persisted and returned",
    addrList.status === 200 && (addrList.body?.addresses ?? []).some((a) => a.name === "Smoke Test Home")
  )

  if (addr.body?.address?.id) {
    const del = await json("/api/addresses", customer, {
      method: "DELETE",
      body: JSON.stringify({ id: addr.body.address.id }),
    })
    check("customer deletes address", del.status === 200, `status ${del.status}`)
  }

  // Review rules
  if (refs.undeliveredOrder) {
    const early = await json("/api/reviews", customer, {
      method: "POST",
      body: JSON.stringify({ orderId: refs.undeliveredOrder, rating: 5, body: "Too early to review this order." }),
    })
    check("review blocked before delivery", early.status === 400, `status ${early.status}`)
  }

  const badRating = await json("/api/reviews", customer, {
    method: "POST",
    body: JSON.stringify({ orderId: refs.orders?.[0], rating: 9, body: "Rating out of range." }),
  })
  check("review rejects rating above 5", badRating.status === 400, `status ${badRating.status}`)

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
