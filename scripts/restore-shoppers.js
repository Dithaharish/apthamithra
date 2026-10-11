/**
 * Restores the four seeded shopper profiles and re-links appointments.
 * The previous cleanup script deleted them by mistake (it compared an
 * undefined userId instead of user_id, so every shopper looked stray).
 *
 *   node --env-file=.env scripts/restore-shoppers.js
 */

const { createClient } = require("@supabase/supabase-js")
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const SEED = [
  { email: "shopper1@apthamithra.com", city: "Delhi", languages: ["Hindi", "English"], rating: 4.9, bio: "Saree & wedding specialist" },
  { email: "shopper2@apthamithra.com", city: "Mumbai", languages: ["Hindi", "Marathi", "English"], rating: 4.8, bio: "Groceries & sweets" },
  { email: "shopper3@apthamithra.com", city: "Kerala", languages: ["Malayalam", "Tamil", "English"], rating: 5.0, bio: "Ayurveda & herbs" },
  { email: "shopper4@apthamithra.com", city: "Hyderabad", languages: ["Telugu", "Hindi", "English"], rating: 4.7, bio: "Textiles & jewelry" },
]

async function main() {
  const { data: users } = await supabase.from("users").select("id, email, name")
  const byId = new Map((users ?? []).map((u) => [u.id, u]))

  const { data: existing } = await supabase.from("shoppers").select("user_id")
  const have = new Set((existing ?? []).map((s) => s.user_id))

  // Recreate any missing profile, keyed on the user's email.
  const restored = []
  for (const seed of SEED) {
    const user = (users ?? []).find((u) => u.email === seed.email)
    if (!user) {
      console.log(`SKIP  ${seed.email} — user not found`)
      continue
    }
    if (have.has(user.id)) {
      console.log(`ok    ${user.name} already has a profile`)
      continue
    }
    const { error } = await supabase.from("shoppers").insert({
      user_id: user.id,
      name: user.name,
      city: seed.city,
      languages: seed.languages,
      rating: seed.rating,
      bio: seed.bio,
      verified: true,
      available: true,
    })
    console.log(`${error ? "FAIL " : "restored "} ${user.name} — ${seed.city}`)
    if (error) console.log("   " + error.message)
    else restored.push(user)
  }

  // Appointments lost their shopper when the profile was deleted (ON DELETE SET NULL).
  const { data: shoppers } = await supabase.from("shoppers").select("id, name")
  const { data: appointments } = await supabase.from("appointments").select("id, shopper_id, customer_id, date, time")
  const shopperByName = new Map((shoppers ?? []).map((s) => [s.name, s.id]))

  const EXPECT = {
    "Raj Mehta": "Priya Sharma",
    "Anita Shah": "Anil Verma",
    "Vikram Nair": "Ravi Nair",
  }

  let relinked = 0
  for (const apt of appointments ?? []) {
    if (apt.shopper_id) continue
    const customer = byId.get(apt.customer_id)
    const wantName = customer && EXPECT[customer.name]
    if (!wantName) continue
    const shopperId = shopperByName.get(wantName)
    if (!shopperId) continue
    const { error } = await supabase.from("appointments").update({ shopper_id: shopperId }).eq("id", apt.id)
    if (!error) relinked++
  }
  console.log(`\nre-linked ${relinked} appointment(s) to their shopper`)

  const { data: after } = await supabase.from("shoppers").select("name, city, verified")
  console.log("\nshoppers now:")
  ;(after ?? []).forEach((s) => console.log(`  ${s.name} — ${s.city}${s.verified ? " (verified)" : ""}`))
}

main().catch((e) => {
  console.error("restore failed:", e.message)
  process.exitCode = 1
})
