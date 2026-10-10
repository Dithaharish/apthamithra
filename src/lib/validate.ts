/**
 * Postgres rejects non-UUID values for uuid columns with a hard error rather
 * than returning no rows, so every ID that reaches the database has to be
 * validated first. Routes use this to answer 404 instead of 500.
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value)
}

/** Throws a tagged error when a required uuid field is missing or malformed. */
export function requireUuid(value: unknown, field: string): string {
  if (!isUuid(value)) {
    throw new InvalidIdError(field)
  }
  return value
}

export class InvalidIdError extends Error {
  constructor(public field: string) {
    super(`Invalid ${field}`)
    this.name = "InvalidIdError"
  }
}
