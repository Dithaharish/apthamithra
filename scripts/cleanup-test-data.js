/**
 * Removes records the smoke test left behind, so repeated runs do not
 * accumulate duplicate demo shoppers and shops.
 *
 *   node --env-file=.env scripts/cleanup-test-data.js
 */

const { createClient } = require("@supabase/supabase-js")
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const TEST_MARKERS = ["Smoke Test Shopper", "Smoke Test Shop", "Reset Test"]

async function main() {
  // Shoppers created by the test, identified by name and city.
  const { data: shoppers } = await supabase.from("shoppers").select("id, name, city")
  const junkShoppers = (shoppers ?? []).filter(
    (s) => TEST_MARKERS.includes(s.name) || s.city === "Testpur"
  )
  for (const s of junkShoppers) {
    const { error } = await supabase.from("shoppers").delete().eq("id", s.id)
    console.log(`${error ? "FAIL" : "deleted"} shopper: ${s.name} (${s.city})`)
  }

  // Shoppers created by the old auto-provision block: a duplicate profile whose
  // user is actually a customer or admin rather than staff. user_id is the
  // column name — selecting it is required or every shopper looks stray.
  const { data: users } = await supabase.from("users").select("id, name, email, role")
  const staffIds = new Set((users ?? []).filter((u) => u.role !== "CUSTOMER").map((u) => u.id))
  const { data: allShoppers } = await supabase.from("shoppers").select("id, name, city, user_id")
  const impostors = (allShoppers ?? []).filter((s) => !staffIds.has(s.user_id))
  for (const s of impostors) {
    if (junkShoppers.some((j) => j.id === s.id)) continue
    const owner = (users ?? []).find((u) => u.id === s.user_id)
    const { error } = await supabase.from("shoppers").delete().eq("id", s.id)
    console.log(`${error ? "FAIL" : "deleted"} stray shopper: ${s.name} (owner ${owner?.role ?? "?"})`)
  }

  // Test shops.
  const { data: shops } = await supabase.from("shops").select("id, name")
  for (const s of shops ?? []) {
    if (TEST_MARKERS.some((m) => s.name.includes(m)) || s.city === "Testpur") {
      const { error } = await supabase.from("shops").delete().eq("id", s.id)
      console.log(`${error ? "FAIL" : "deleted"} shop: ${s.name}`)
    }
  }

  // Accounts the reset test registered.
  for (const u of users ?? []) {
    if (/^reset-\d+@example\.com$/.test(u.email)) {
      const { error } = await supabase.from("users").delete().eq("id", u.id)
      console.log(`${error ? "FAIL" : "deleted"} test account: ${u.email}`)
    }
  }

  // Report the remaining state.
  const { data: after } = await supabase.from("shoppers").select("name, city")
  console.log("\nremaining shoppers:")
  ;(after ?? []).forEach((s) => console.log(`  ${s.name} — ${s.city}`))
}

main().catch((e) => {
  console.error("cleanup failed:", e.message)
  process.exitCode = 1
})
