/**
 * Shared input normalisation.
 *
 * Email addresses are compared and stored case-insensitively: without this,
 * `Raj.Mehta@Email.com` registers as a separate account from
 * `raj.mehta@email.com`, and because `authorize` lowercases while register did
 * not, the differently-cased account could never sign in at all.
 */
export function normalizeEmail(email: unknown): string {
  return typeof email === "string" ? email.trim().toLowerCase() : ""
}
