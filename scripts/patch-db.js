/**
 * One-off patch: links orders to their appointments, then seeds the
 * shipments and addresses rows that the original schema.sql omitted.
 *
 * Usage:  node --env-file=.env scripts/patch-db.js
 */

const fs = require("fs")
const path = require("path")
const { createClient } = require("@supabase/supabase-js")

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("Missing Supabase env vars.")
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

// Extract the statements appended to schema.sql after the reviews insert.
const sql = fs.readFileSync(path.join(__dirname, "..", "supabase", "schema.sql"), "utf8")
const marker = "-- Link each order to the consultation it came from."
const patch = sql.slice(sql.indexOf(marker)).trim()

// Statements are simple enough to split on the blank-line separated blocks.
const statements = patch
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--") || /^update|^insert/i.test(s.trim()))
  .filter((s) => /^(update|insert)/i.test(s.trim()))

async function main() {
  for (const statement of statements) {
    const { error } = await supabase.rpc("exec_sql", { sql: statement }).catch(() => ({ error: null }))
    if (error) {
      console.log("rpc unavailable, using direct queries instead")
      break
    }
  }

  // Supabase has no generic SQL endpoint over PostgREST, so do the same work
  // through the typed client instead.
  const { data: appointments } = await supabase.from("appointments").select("id, customer_id")
  const { data: orders } = await supabase.from("orders").select("id, customer_id, status, destination, appointment_id")

  let linked = 0
  for (const order of orders ?? []) {
    if (order.appointment_id) continue
    const match = (appointments ?? []).find((a) => a.customer_id === order.customer_id)
    if (!match) continue
    const { error } = await supabase
      .from("orders")
      .update({ appointment_id: match.id })
      .eq("id", order.id)
    if (!error) linked++
  }
  console.log(`linked ${linked} order(s) to appointments`)

  // Shipments for in-transit orders
  const { data: existingShipments } = await supabase.from("shipments").select("order_id")
  const shippedOrders = (orders ?? []).filter((o) => o.status === "shipped")
  let shipped = 0
  for (const order of shippedOrders) {
    if ((existingShipments ?? []).some((s) => s.order_id === order.id)) continue
    const { error } = await supabase.from("shipments").insert({
      order_id: order.id,
      courier: "DHL Express",
      tracking_no: "DHL-9876543210",
      weight: 8.4,
      destination: order.destination,
    })
    if (!error) shipped++
  }
  console.log(`created ${shipped} shipment(s)`)

  // Addresses for customers
  const { data: users } = await supabase.from("users").select("id, country, role").eq("role", "CUSTOMER")
  const { data: existingAddresses } = await supabase.from("addresses").select("customer_id")
  let addressed = 0
  for (const user of users ?? []) {
    if ((existingAddresses ?? []).some((a) => a.customer_id === user.id)) continue
    const { error } = await supabase.from("addresses").insert({
      customer_id: user.id,
      name: "Home",
      line1: "123 Demo Street",
      city: String(user.country ?? "").split(",")[0] || "—",
      postal: "00000",
      country: user.country,
      is_default: true,
    })
    if (!error) addressed++
  }
  console.log(`created ${addressed} address(es)`)

  // Verify
  for (const table of ["shipments", "addresses"]) {
    const { count } = await supabase.from(table).select("*", { count: "exact", head: true })
    console.log(`${table}: ${count} rows`)
  }

  const { data: linkedOrders } = await supabase
    .from("orders")
    .select("id, appointment_id")
    .not("appointment_id", "is", null)
  console.log(`orders with appointment_id: ${(linkedOrders ?? []).length}/${(orders ?? []).length}`)
}

main().catch((e) => {
  console.error("patch failed:", e.message)
  process.exitCode = 1
})
