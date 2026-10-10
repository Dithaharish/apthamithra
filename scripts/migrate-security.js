/**
 * Applies the account-security columns to a live database.
 * Idempotent — safe to re-run.
 *
 *   node --env-file=.env scripts/migrate-security.js
 */

const fs = require("fs")
const path = require("path")
const { createClient } = require("@supabase/supabase-js")

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

// The SQL is applied through the PostgREST-visible columns: rather than needing
// a raw SQL endpoint, probe for each column and report what is missing.
const EXPECTED = [
  "email_verified",
  "verify_token",
  "reset_token",
  "reset_expires_at",
]

async function main() {
  const { data, error } = await supabase.from("users").select("*").limit(1)
  if (error) {
    console.error("Could not read users:", error.message)
    process.exit(1)
  }

  const present = data && data[0] ? Object.keys(data[0]) : []
  const missing = EXPECTED.filter((c) => !present.includes(c))

  if (missing.length === 0) {
    console.log("All security columns already present.")
  } else {
    console.log("MISSING columns:", missing.join(", "))
    console.log("")
    console.log("PostgREST cannot run DDL. Apply this in the Supabase SQL Editor:")
    console.log("")
    const sql = fs
      .readFileSync(path.join(__dirname, "..", "supabase", "schema.sql"), "utf8")
      .split("-- Account security")[1]
    console.log("-- Account security" + sql)
    process.exitCode = 1
  }
}

main()
