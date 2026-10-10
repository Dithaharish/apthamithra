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

export type OrderStatus =
  | "pending"
  | "purchasing"
  | "qc_pending"
  | "qc_approved"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"

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

const DATE_FIELDS = new Set(["createdAt", "updatedAt"])

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

/* ------------------------------------------------------------------ */
/* Order lifecycle                                                     */
/* ------------------------------------------------------------------ */

export const ORDER_FLOW: OrderStatus[] = [
  "pending",
  "purchasing",
  "qc_pending",
  "qc_approved",
  "paid",
  "packed",
  "shipped",
  "delivered",
]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Awaiting confirmation",
  purchasing: "Shopping in progress",
  qc_pending: "QC awaiting approval",
  qc_approved: "QC approved",
  paid: "Payment confirmed",
  packed: "Packed & ready",
  shipped: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export function nextOrderStatus(current: OrderStatus): OrderStatus | null {
  const index = ORDER_FLOW.indexOf(current)
  if (index < 0 || index === ORDER_FLOW.length - 1) return null
  return ORDER_FLOW[index + 1]
}

/* ------------------------------------------------------------------ */
/* Data access                                                         */
/* ------------------------------------------------------------------ */

export const db = {
  user: {
    findUnique: (where: { email?: string; id?: string }) => findUnique<User>("users", where),
    findMany: (where: Record<string, unknown> = {}) => findMany<User>("users", where),
    create: ({ data }: { data: Partial<User> }) => insertRow<User>("users", data),
    update: (where: { id: string }, data: Partial<User>) =>
      updateRow<User>("users", where.id, data),
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
    findMany: (where: Record<string, unknown> = {}) => findMany<Shop>("shops", where),
    create: ({ data }: { data: Partial<Shop> }) => insertRow<Shop>("shops", data),
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
    findMany: (where: Record<string, unknown> = {}) =>
      findMany<Order>("orders", where, { column: "created_at", ascending: false }),
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
