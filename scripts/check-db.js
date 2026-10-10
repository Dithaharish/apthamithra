const { createClient } = require("@supabase/supabase-js")

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.log("SKIP: Supabase env vars not set")
  process.exit(0)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const tables = [
  "users",
  "shoppers",
  "shops",
  "appointments",
  "orders",
  "order_items",
  "shipments",
  "payments",
  "qc_images",
  "reviews",
  "addresses",
]

async function main() {
  let failed = 0
  for (const t of tables) {
    const { error, count } = await supabase.from(t).select("*", { count: "exact", head: true })
    if (error) {
      console.log(`FAIL  ${t}: ${error.message}`)
      failed++
    } else {
      console.log(`OK    ${t} — ${count} rows`)
    }
  }

  // Sample one row to confirm column mapping works.
  const { data, error } = await supabase.from("users").select("*").limit(1).single()
  if (!error && data) {
    console.log("\ncolumns in users:", Object.keys(data).join(", "))
  }

  process.exitCode = failed ? 1 : 0
  console.log(failed ? `\n${failed} table(s) failed — has schema.sql been run?` : "\nAll tables reachable.")
}

main().catch((e) => {
  console.error("crash:", e.message)
  process.exitCode = 1
})
