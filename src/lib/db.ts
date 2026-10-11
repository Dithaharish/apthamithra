/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Data layer backed by Supabase (Postgres).
 *
 * The public surface is intentionally Prisma-shaped — findUnique / findMany /
 * create / update with the same argument shapes — so pages, components and API
 * routes never need to know which backend is in use.
 *
 * The database schema lives in supabase/schema.sql and mirrors
 * prisma/schema.prisma.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { OrderStatus } from "./order-status"

/* ------------------------------------------------------------------ */
/* Types (unchanged public API)                                        */
/* ------------------------------------------------------------------ */

export type Role = "CUSTOMER" | "SHOPPER" | "ADMIN"

export type AppointmentStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rescheduled"

export interface User {
  id: string
  email: string
  passwordHash: string
  name: string | null
  phone: string | null
  country: string | null
  timezone: string | null
  language: string | null
  role: Role
  active: boolean
  emailVerified: boolean
  verifyToken: string | null
  resetToken: string | null
  resetExpiresAt: Date | null
  createdAt: Date
}

export interface Shopper {
  id: string
  userId: string
  name: string
  city: string
  languages: string[]
  rating: number
  bio: string | null
  photo: string | null
  available: boolean
  verified: boolean
  createdAt: Date
}

export interface Shop {
  id: string
  name: string
  city: string
  area: string | null
  category: string[]
  rating: number
  verified: boolean
}

export interface Appointment {
  id: string
  customerId: string
  shopperId: string | null
  date: string
  time: string
  mode: "video" | "app" | "phone"
  purpose: string
  language: string
  timezone: string
  notes: string | null
  status: AppointmentStatus
  createdAt: Date
}

export interface Order {
  id: string
  customerId: string
  shopperId: string | null
  appointmentId: string | null
  shopId: string | null
  status: OrderStatus
  subtotal: number
  serviceFee: number
  handling: number
  shipping: number
  currency: string
  destination: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  name: string
  shopName: string | null
  price: number
  quantity: number
  status: string
  createdAt: Date
}

export interface Shipment {
  id: string
  orderId: string
  courier: string
  trackingNo: string | null
  weight: number | null
  destination: string
  createdAt: Date
}

export interface Payment {
  id: string
  orderId: string
  amount: number
  currency: string
  method: string
  status: "pending" | "paid" | "refunded" | "failed"
  createdAt: Date
}

export interface QCImage {
  id: string
  orderId: string
  url: string | null
  caption: string | null
  approved: boolean
  createdAt: Date
}

export interface Review {
  id: string
  customerId: string
  orderId: string
  rating: number
  title: string | null
  body: string
  photo: string | null
  status: "pending" | "approved" | "rejected"
  helpful: number
  createdAt: Date
}

export interface Address {
  id: string
  customerId: string
  name: string
  line1: string
  city: string
  state: string | null
  postal: string
  country: string
  isDefault: boolean
}

/* ------------------------------------------------------------------ */
/* Client                                                              */
/* ------------------------------------------------------------------ */

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in your environment (see .env.example)."
    )
  }

  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "x-application-name": "apthamithra" } },
    })
  }
  return client
}

export function isDatabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

/* ------------------------------------------------------------------ */
/* Field mapping                                                       */
/* ------------------------------------------------------------------ */

const NUMERIC_FIELDS = new Set([
  "rating",
  "subtotal",
  "serviceFee",
  "handling",
  "shipping",
  "price",
  "quantity",
  "weight",
  "amount",
  "helpful",
])

const DATE_FIELDS = new Set(["createdAt", "updatedAt", "resetExpiresAt"])

function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
}

function toCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}

function whereToFilters(where: Record<string, unknown>): Array<[string, unknown]> {
  return Object.entries(where).map(([key, value]) => [toSnake(key), value])
}

function rowToModel<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    const camel = toCamel(key)
    if (DATE_FIELDS.has(camel) && typeof value === "string") {
      out[camel] = new Date(value)
    } else if (NUMERIC_FIELDS.has(camel) && value !== null) {
      out[camel] = Number(value)
    } else {
      out[camel] = value
    }
  }
  return out as T
}

function dataToRow(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    out[toSnake(key)] = value
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Generic helpers                                                     */
/* ------------------------------------------------------------------ */

interface QueryOptions {
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  offset?: number
  search?: { columns: string[]; term: string }
}

async function selectPage<T>(
  table: string,
  where: Record<string, unknown>,
  options: QueryOptions = {}
): Promise<{ rows: T[]; total: number }> {
  const { orderBy, limit, offset, search } = options

  let query = getClient()
    .from(table)
    .select("*", { count: "exact" })

  for (const [column, value] of whereToFilters(where)) {
    query = query.eq(column, value as string)
  }
  // Case-insensitive "contains" across several columns.
  if (search?.term) {
    query = query.or(
      search.columns.map((c) => `${c}.ilike.%${search.term.replace(/[%,()]/g, "")}%`).join(",")
    )
  }
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
  }
  if (typeof limit === "number") {
    query = query.range(offset ?? 0, (offset ?? 0) + limit - 1)
  }

  const { data, error, count } = await query
  if (error) throw new Error(`${table}.findMany failed: ${error.message}`)
  return {
    rows: (data ?? []).map((row) => rowToModel<T>(row as Record<string, unknown>)),
    total: count ?? 0,
  }
}

async function findMany<T>(
  table: string,
  where: Record<string, unknown> = {},
  orderBy?: { column: string; ascending?: boolean }
): Promise<T[]> {
  let query = getClient().from(table).select("*")
  for (const [column, value] of whereToFilters(where)) {
    query = query.eq(column, value as string)
  }
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
  }
  const { data, error } = await query
  if (error) throw new Error(`${table}.findMany failed: ${error.message}`)
  return (data ?? []).map((row) => rowToModel<T>(row as Record<string, unknown>))
}

async function findUnique<T>(
  table: string,
  where: Record<string, unknown>
): Promise<T | null> {
  let query = getClient().from(table).select("*")
  for (const [column, value] of whereToFilters(where)) {
    query = query.eq(column, value as string)
  }
  const { data, error } = await query.limit(1).maybeSingle()
  if (error) throw new Error(`${table}.findUnique failed: ${error.message}`)
  return data ? rowToModel<T>(data as Record<string, unknown>) : null
}

async function insertRow<T>(table: string, data: Record<string, unknown>): Promise<T> {
  const { data: row, error } = await getClient()
    .from(table)
    .insert(dataToRow(data))
    .select()
    .single()
  if (error) throw new Error(`${table}.create failed: ${error.message}`)
  return rowToModel<T>(row as Record<string, unknown>)
}

async function updateRow<T>(
  table: string,
  id: string,
  data: Record<string, unknown>
): Promise<T | null> {
  const { data: row, error } = await getClient()
    .from(table)
    .update(dataToRow(data))
    .eq("id", id)
    .select()
    .maybeSingle()
  if (error) throw new Error(`${table}.update failed: ${error.message}`)
  return row ? rowToModel<T>(row as Record<string, unknown>) : null
}

async function deleteRow(table: string, id: string): Promise<boolean> {
  const { error, count } = await getClient()
    .from(table)
    .delete({ count: "exact" })
    .eq("id", id)
  if (error) throw new Error(`${table}.delete failed: ${error.message}`)
  return (count ?? 0) > 0
}

/**
 * The account-security columns are added by a migration the operator runs in
 * the Supabase SQL Editor. Until then, writing them would fail every insert.
 *
 * The probe result is cached, but only briefly when the answer is "not there
 * yet" — a long-running server must pick the columns up shortly after the
 * migration is applied without needing a restart.
 */
let securityColumnsReady: boolean | null = null
let securityProbedAt = 0

/** How long a negative answer is trusted before re-probing. */
const NEGATIVE_CACHE_MS = 30_000

async function hasSecurityColumns(): Promise<boolean> {
  const cacheAge = Date.now() - securityProbedAt
  const cacheFresh = securityProbedAt > 0 && (!securityColumnsReady ? cacheAge < NEGATIVE_CACHE_MS : true)
  if (securityColumnsReady !== null && cacheFresh) return securityColumnsReady

  try {
    const { error } = await getClient().from("users").select("verify_token").limit(1)
    securityColumnsReady = !error
  } catch {
    securityColumnsReady = false
  }
  securityProbedAt = Date.now()
  return securityColumnsReady
}

/** Call after the migration has been applied to clear the cached probe. */
export function resetSchemaProbe(): void {
  securityColumnsReady = null
  securityProbedAt = 0
}

/* ------------------------------------------------------------------ */

/* Re-exported for backwards compatibility with existing call sites. */
export { ORDER_FLOW, ORDER_STATUS_LABEL, nextOrderStatus } from "./order-status"
export type { OrderStatus } from "./order-status"

/**
 * URL-safe secret used for password-reset and email-verification links.
 * 32 bytes of entropy, hex encoded.
 */
export function randomToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/* ------------------------------------------------------------------ */
/* Data access                                                         */
/* ------------------------------------------------------------------ */

export const db = {
  user: {
    findUnique: (where: { email?: string; id?: string }) => findUnique<User>("users", where),
    findPage: (where: Record<string, any> = {}, options: QueryOptions = {}) =>
      selectPage<User>("users", where, options),
    /**
     * Looks a user up by a reset or verification token. Returns null when the
     * token columns have not been migrated yet.
     */
    findByToken: async (column: "resetToken" | "verifyToken", token: string) => {
      if (!(await hasSecurityColumns())) return null
      return findUnique<User>("users", { [column]: token } as Record<string, unknown>)
    },
    findMany: (where: Record<string, any> = {}) => findMany<User>("users", where),
    create: async ({ data }: { data: Partial<User> }) => {
      // Only write a verification token once the column exists.
      const payload =
        (await hasSecurityColumns())
          ? { ...data, verifyToken: data.verifyToken ?? randomToken(), emailVerified: false }
          : data
      return insertRow<User>("users", payload)
    },
    update: async (where: { id: string }, data: Partial<User>): Promise<User | null> => {
      // Token columns are dropped from the payload until they are migrated.
      const hasTokens = Object.keys(data).some(
        (k) => k === "resetToken" || k === "resetExpiresAt" || k === "verifyToken" || k === "emailVerified"
      )
      if (hasTokens && !(await hasSecurityColumns())) {
        // Strip the not-yet-migrated columns rather than failing the write.
        const { resetToken, resetExpiresAt, verifyToken, emailVerified, ...rest } = data
        void resetToken
        void resetExpiresAt
        void verifyToken
        void emailVerified
        if (Object.keys(rest).length === 0) return findUnique<User>("users", where)
        return updateRow<User>("users", where.id, rest)
      }
      return updateRow<User>("users", where.id, data)
    },
  },

  shopper: {
    findUnique: (where: { id?: string; userId?: string }) =>
      findUnique<Shopper>("shoppers", where),
    findMany: (where: Record<string, unknown> = {}) => findMany<Shopper>("shoppers", where),
    create: ({ data }: { data: Partial<Shopper> }) => insertRow<Shopper>("shoppers", data),
    update: (where: { id: string }, data: Partial<Shopper>) =>
      updateRow<Shopper>("shoppers", where.id, data),
  },

  shop: {
    findMany: (where: Record<string, any> = {}) => findMany<Shop>("shops", where),
    create: ({ data }: { data: Partial<Shop> }) => insertRow<Shop>("shops", data),
    update: (where: { id: string }, data: Partial<Shop>) =>
      updateRow<Shop>("shops", where.id, data),
  },

  appointment: {
    findUnique: (where: { id?: string }) => findUnique<Appointment>("appointments", where),
    findMany: (where: Record<string, unknown> = {}) =>
      findMany<Appointment>("appointments", where, { column: "date" }),
    create: ({ data }: { data: Partial<Appointment> }) =>
      insertRow<Appointment>("appointments", data),
    update: (where: { id: string }, data: Partial<Appointment>) =>
      updateRow<Appointment>("appointments", where.id, data),
  },

  order: {
    findUnique: (where: { id?: string }) => findUnique<Order>("orders", where),
    findMany: (where: Record<string, any> = {}) =>
      findMany<Order>("orders", where, { column: "created_at", ascending: false }),
    findPage: (where: Record<string, any> = {}, options: QueryOptions = {}) =>
      selectPage<Order>("orders", where, {
        orderBy: { column: "created_at", ascending: false },
        ...options,
      }),
    create: ({ data }: { data: Partial<Order> }) => insertRow<Order>("orders", data),
    update: (where: { id: string }, data: Partial<Order>) =>
      updateRow<Order>("orders", where.id, data),
  },

  orderItem: {
    findMany: (where: Record<string, unknown> = {}) => findMany<OrderItem>("order_items", where),
    create: ({ data }: { data: Partial<OrderItem> }) => insertRow<OrderItem>("order_items", data),
  },

  shipment: {
    findMany: (where: Record<string, unknown> = {}) => findMany<Shipment>("shipments", where),
    create: ({ data }: { data: Partial<Shipment> }) => insertRow<Shipment>("shipments", data),
  },

  payment: {
    findMany: (where: Record<string, unknown> = {}) => findMany<Payment>("payments", where),
    create: ({ data }: { data: Partial<Payment> }) => insertRow<Payment>("payments", data),
    update: (where: { id: string }, data: Partial<Payment>) =>
      updateRow<Payment>("payments", where.id, data),
  },

  qcImage: {
    findMany: (where: Record<string, unknown> = {}) => findMany<QCImage>("qc_images", where),
    create: ({ data }: { data: Partial<QCImage> }) => insertRow<QCImage>("qc_images", data),
    update: (where: { id: string }, data: Partial<QCImage>) =>
      updateRow<QCImage>("qc_images", where.id, data),
  },

  review: {
    findMany: (where: Record<string, unknown> = {}) =>
      findMany<Review>("reviews", where, { column: "created_at", ascending: false }),
    create: ({ data }: { data: Partial<Review> }) => insertRow<Review>("reviews", data),
    update: (where: { id: string }, data: Partial<Review>) =>
      updateRow<Review>("reviews", where.id, data),
  },

  address: {
    findMany: (where: Record<string, unknown> = {}) => findMany<Address>("addresses", where),
    create: ({ data }: { data: Partial<Address> }) => insertRow<Address>("addresses", data),
    delete: (where: { id: string }) => deleteRow("addresses", where.id),
  },
}
