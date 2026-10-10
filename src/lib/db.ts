/**
 * Lightweight data layer for local development and preview builds.
 *
 * The production schema lives in prisma/schema.prisma. When a real
 * PostgreSQL instance (Supabase / Neon / Railway) is provisioned, run
 * `npx prisma generate` there and swap this module for the generated
 * PrismaClient without changing any call sites.
 *
 * The API deliberately mirrors Prisma's: findUnique / findMany / create /
 * update, with the same argument shapes.
 */

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
/* State                                                               */
/* ------------------------------------------------------------------ */

export const users: User[] = []
export const shoppers: Shopper[] = []
export const shops: Shop[] = []
export const appointments: Appointment[] = []
export const orders: Order[] = []
export const orderItems: OrderItem[] = []
export const shipments: Shipment[] = []
export const payments: Payment[] = []
export const qcImages: QCImage[] = []
export const reviews: Review[] = []
export const addresses: Address[] = []

let counter = 0
export function nextId(prefix: string) {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36).padStart(3, "0")}`
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>

function findMany<T extends Row>(rows: T[], where: Record<string, any>): T[] {
  return rows.filter((row) =>
    Object.entries(where).every(([key, value]) => row[key] === value)
  )
}

function findUnique<T extends Row>(rows: T[], where: Record<string, any>): T | null {
  return (
    rows.find((row) =>
      Object.entries(where).every(([key, value]) => row[key] === value)
    ) ?? null
  )
}

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

/**
 * Shared password for the seeded demo accounts, so the admin, shopper and
 * customer workspaces can all be signed into during a preview.
 * Replace with real credentials before going live.
 */
const DEMO_PASSWORD_HASH = "$2b$10$zYI77kU9riyq.hIQrHVAS.zmmDk1TUOqne0k1Zi06eK.0/0jqeMsS"

export const DEMO_ACCOUNTS = [
  { email: "admin@apthamithra.com", password: "apthamithra123", role: "ADMIN", home: "/admin" },
  { email: "shopper1@apthamithra.com", password: "apthamithra123", role: "SHOPPER", home: "/shopper" },
  { email: "raj.mehta@email.com", password: "apthamithra123", role: "CUSTOMER", home: "/dashboard" },
] as const

export function seedDemoData() {
  if (users.length > 0) return

  const now = new Date()

  // Shoppers
  const shopperSeed: Array<[string, string, string, string[]]> = [
    ["shopper1@apthamithra.com", "Priya Sharma", "Delhi", ["Hindi", "English"]],
    ["shopper2@apthamithra.com", "Anil Verma", "Mumbai", ["Hindi", "Marathi", "English"]],
    ["shopper3@apthamithra.com", "Ravi Nair", "Kerala", ["Malayalam", "Tamil", "English"]],
    ["shopper4@apthamithra.com", "Kavita Reddy", "Hyderabad", ["Telugu", "Hindi", "English"]],
  ]

  shopperSeed.forEach(([email, name, city, languages], i) => {
    const user: User = {
      id: `USR-shopper${i + 1}`,
      email,
      passwordHash: DEMO_PASSWORD_HASH,
      name,
      phone: `+91 90000 0000${i}`,
      country: "India",
      timezone: "Asia/Kolkata",
      language: "English",
      role: "SHOPPER",
      active: true,
      createdAt: now,
    }
    users.push(user)
    shoppers.push({
      id: `SPK-00${i + 1}`,
      userId: user.id,
      name,
      city,
      languages,
      rating: [4.9, 4.8, 5.0, 4.7][i],
      bio: ["Saree & wedding specialist", "Groceries & sweets", "Ayurveda & herbs", "Textiles & jewelry"][i],
      photo: null,
      available: i !== 1,
      verified: true,
      createdAt: now,
    })
  })

  // Admin
  users.push({
    id: "USR-admin1",
    email: "admin@apthamithra.com",
    passwordHash: DEMO_PASSWORD_HASH,
    name: "Admin User",
    phone: null,
    country: "India",
    timezone: "Asia/Kolkata",
    language: "English",
    role: "ADMIN",
    active: true,
    createdAt: now,
  })

  // Shops
  const shopSeed: Array<[string, string, string, string[]]> = [
    ["Kanjeevaram Silk House", "Kancheepuram", "Near Temple", ["Sarees"]],
    ["Haldiram's — Karol Bagh", "Delhi", "Main Bazaar", ["Sweets", "Snacks"]],
    ["Kerala Ayurveda Centre", "Kochi", "Near Medical College", ["Ayurveda"]],
    ["Hyderabad Pearls", "Hyderabad", "Laad Bazaar", ["Jewelry"]],
  ]
  shopSeed.forEach(([name, city, area, category], i) => {
    shops.push({
      id: `SHOP-00${i + 1}`,
      name,
      city,
      area,
      category,
      rating: [4.9, 4.8, 5.0, 4.7][i],
      verified: i !== 3,
    })
  })

  // Customers with appointments, orders and reviews
  const customerSeed: Array<[string, string, string, string]> = [
    ["raj.mehta@email.com", "Raj Mehta", "USA", "New Jersey, USA"],
    ["anita.shah@email.com", "Anita Shah", "UK", "London, UK"],
    ["vikram.nair@email.com", "Vikram Nair", "Canada", "Toronto, Canada"],
  ]

  customerSeed.forEach(([email, name, country, destination], i) => {
    const user: User = {
      id: `USR-cust${i + 1}`,
      email,
      passwordHash: DEMO_PASSWORD_HASH,
      name,
      phone: null,
      country,
      timezone: ["America/New_York", "Europe/London", "America/Toronto"][i],
      language: ["English", "Gujarati", "Tamil"][i],
      role: "CUSTOMER",
      active: true,
      createdAt: now,
    }
    users.push(user)
    addresses.push({
      id: `ADR-00${i + 1}`,
      customerId: user.id,
      name: "Home",
      line1: "123 Demo Street",
      city: destination.split(",")[0].trim(),
      state: null,
      postal: "00000",
      country,
      isDefault: true,
    })

    // Appointment
    appointments.push({
      id: `APT-00${i + 1}`,
      customerId: user.id,
      shopperId: `SPK-00${(i % 4) + 1}`,
      date: ["2026-10-14", "2026-10-14", "2026-10-16"][i],
      time: ["7:30 PM", "11:00 AM", "6:00 PM"][i],
      mode: (["video", "app", "phone"] as const)[i],
      purpose: ["Wedding sarees", "Monthly groceries", "Ayurvedic herbs"][i],
      language: user.language ?? "English",
      timezone: user.timezone ?? "Asia/Kolkata",
      notes: null,
      status: "scheduled",
      createdAt: now,
    })

    // Order
    const subtotal = [42300, 10500, 18200][i]
    const serviceFee = Math.round(subtotal * 0.12)
    const handling = [1100, 800, 950][i]
    const shipping = [12000, 4200, 8500][i]
    const order: Order = {
      id: `ORD-00${i + 1}`,
      customerId: user.id,
      shopperId: `SPK-00${(i % 4) + 1}`,
      appointmentId: `APT-00${i + 1}`,
      shopId: `SHOP-00${i + 1}`,
      status: (["shipped", "delivered", "qc_pending"] as const)[i],
      subtotal,
      serviceFee,
      handling,
      shipping,
      currency: "INR",
      destination,
      notes: null,
      createdAt: now,
      updatedAt: now,
    }
    orders.push(order)

    orderItems.push({
      id: `ITM-00${i + 1}`,
      orderId: order.id,
      name: ["Silk saree — Kanjivaram", "Assorted sweets & pickles", "Ashwagandha & triphala"][i],
      shopName: ["Kanjeevaram Silk House", "Haldiram's — Karol Bagh", "Kerala Ayurveda Centre"][i],
      price: subtotal,
      quantity: [1, 6, 4][i],
      status: order.status,
      createdAt: now,
    })

    if (order.status === "shipped") {
      shipments.push({
        id: `SHP-00${i + 1}`,
        orderId: order.id,
        courier: "DHL Express",
        trackingNo: "DHL-9876543210",
        weight: 8.4,
        destination,
        createdAt: now,
      })
      payments.push({
        id: "PAY-001",
        orderId: order.id,
        amount: subtotal + serviceFee + handling + shipping,
        currency: "INR",
        method: "Stripe",
        status: "paid",
        createdAt: now,
      })
    }

    qcImages.push({
      id: `QC-00${i + 1}`,
      orderId: order.id,
      caption: "Front view with shop bill",
      approved: order.status !== "qc_pending",
      createdAt: now,
    })
  })

  // Reviews
  const reviewSeed: Array<[string, string, number, string, string]> = [
    ["raj.mehta@email.com", "ORD-001", 5, "Wedding sarees exceeded expectations", "Our shopper sent 3 options live from the market, showed the weave in detail, and shipped it in 11 days."],
    ["anita.shah@email.com", "ORD-002", 5, "Monthly grocery runs from my hometown", "They even included the exact brand of pickle my mother uses. QC photos gave me complete confidence."],
  ]
  reviewSeed.forEach(([email, orderId, rating, title, body], i) => {
    const user = findUnique(users, { email })
    if (!user) return
    reviews.push({
      id: `REV-00${i + 1}`,
      customerId: user.id,
      orderId,
      rating,
      title,
      body,
      status: i === 1 ? "pending" : "approved",
      helpful: i === 1 ? 2 : 18,
      createdAt: now,
    })
  })
}

/* ------------------------------------------------------------------ */
/* Data access                                                         */
/* ------------------------------------------------------------------ */

export const db = {
  user: {
    findUnique: (where: { email?: string; id?: string }) =>
      Promise.resolve(findUnique(users, where)),
    findMany: (where: Record<string, any> = {}) =>
      Promise.resolve(findMany(users, where)),
    create: async ({ data }: { data: Partial<User> }): Promise<User> => {
      const user: User = {
        id: nextId("USR"),
        email: data.email!,
        passwordHash: data.passwordHash!,
        name: data.name ?? null,
        phone: data.phone ?? null,
        country: data.country ?? null,
        timezone: data.timezone ?? null,
        language: data.language ?? null,
        role: data.role ?? "CUSTOMER",
        active: true,
        createdAt: new Date(),
      }
      users.push(user)
      return user
    },
    update: async (where: { id: string }, data: Partial<User>): Promise<User | null> => {
      const user = findUnique(users, where)
      if (!user) return null
      Object.assign(user, data)
      return user
    },
  },

  shopper: {
    findUnique: (where: { id?: string; userId?: string }) =>
      Promise.resolve(findUnique(shoppers, where)),
    findMany: (where: Record<string, any> = {}) =>
      Promise.resolve(findMany(shoppers, where)),
    create: async ({ data }: { data: Partial<Shopper> }): Promise<Shopper> => {
      const shopper: Shopper = {
        id: nextId("SPK"),
        userId: data.userId!,
        name: data.name!,
        city: data.city!,
        languages: data.languages ?? ["English"],
        rating: data.rating ?? 5,
        bio: data.bio ?? null,
        photo: data.photo ?? null,
        available: data.available ?? true,
        verified: data.verified ?? false,
        createdAt: new Date(),
      }
      shoppers.push(shopper)
      return shopper
    },
    update: async (where: { id: string }, data: Partial<Shopper>) => {
      const shopper = findUnique(shoppers, where)
      if (!shopper) return null
      Object.assign(shopper, data)
      return shopper
    },
  },

  shop: {
    findMany: (where: Record<string, any> = {}) => Promise.resolve(findMany(shops, where)),
    create: async ({ data }: { data: Partial<Shop> }): Promise<Shop> => {
      const shop: Shop = {
        id: nextId("SHOP"),
        name: data.name!,
        city: data.city!,
        area: data.area ?? null,
        category: data.category ?? [],
        rating: data.rating ?? 5,
        verified: data.verified ?? false,
      }
      shops.push(shop)
      return shop
    },
  },

  appointment: {
    findUnique: (where: { id?: string }) => Promise.resolve(findUnique(appointments, where)),
    findMany: (where: Record<string, any> = {}) =>
      Promise.resolve(
        findMany(appointments, where).sort((a, b) => a.date.localeCompare(b.date))
      ),
    create: async ({ data }: { data: Partial<Appointment> }): Promise<Appointment> => {
      const appointment: Appointment = {
        id: nextId("APT"),
        customerId: data.customerId!,
        shopperId: data.shopperId ?? null,
        date: data.date!,
        time: data.time!,
        mode: data.mode ?? "video",
        purpose: data.purpose ?? "",
        language: data.language ?? "English",
        timezone: data.timezone ?? "Asia/Kolkata",
        notes: data.notes ?? null,
        status: "scheduled",
        createdAt: new Date(),
      }
      appointments.push(appointment)
      return appointment
    },
    update: async (where: { id: string }, data: Partial<Appointment>) => {
      const appointment = findUnique(appointments, where)
      if (!appointment) return null
      Object.assign(appointment, data)
      return appointment
    },
  },

  order: {
    findUnique: (where: { id?: string }) => Promise.resolve(findUnique(orders, where)),
    findMany: (where: Record<string, any> = {}) =>
      Promise.resolve(
        findMany(orders, where).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      ),
    create: async ({ data }: { data: Partial<Order> }): Promise<Order> => {
      const order: Order = {
        id: nextId("ORD"),
        customerId: data.customerId!,
        shopperId: data.shopperId ?? null,
        appointmentId: data.appointmentId ?? null,
        shopId: data.shopId ?? null,
        status: data.status ?? "pending",
        subtotal: data.subtotal ?? 0,
        serviceFee: data.serviceFee ?? 0,
        handling: data.handling ?? 0,
        shipping: data.shipping ?? 0,
        currency: data.currency ?? "INR",
        destination: data.destination ?? "",
        notes: data.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      orders.push(order)
      return order
    },
    update: async (where: { id: string }, data: Partial<Order>) => {
      const order = findUnique(orders, where)
      if (!order) return null
      Object.assign(order, data, { updatedAt: new Date() })
      return order
    },
  },

  orderItem: {
    findMany: (where: Record<string, any> = {}) => Promise.resolve(findMany(orderItems, where)),
    create: async ({ data }: { data: Partial<OrderItem> }): Promise<OrderItem> => {
      const item: OrderItem = {
        id: nextId("ITM"),
        orderId: data.orderId!,
        name: data.name!,
        shopName: data.shopName ?? null,
        price: data.price ?? 0,
        quantity: data.quantity ?? 1,
        status: data.status ?? "pending",
        createdAt: new Date(),
      }
      orderItems.push(item)
      return item
    },
  },

  shipment: {
    findMany: (where: Record<string, any> = {}) => Promise.resolve(findMany(shipments, where)),
    create: async ({ data }: { data: Partial<Shipment> }): Promise<Shipment> => {
      const shipment: Shipment = {
        id: nextId("SHP"),
        orderId: data.orderId!,
        courier: data.courier!,
        trackingNo: data.trackingNo ?? null,
        weight: data.weight ?? null,
        destination: data.destination ?? "",
        createdAt: new Date(),
      }
      shipments.push(shipment)
      return shipment
    },
  },

  payment: {
    findMany: (where: Record<string, any> = {}) => Promise.resolve(findMany(payments, where)),
    create: async ({ data }: { data: Partial<Payment> }): Promise<Payment> => {
      const payment: Payment = {
        id: nextId("PAY"),
        orderId: data.orderId!,
        amount: data.amount ?? 0,
        currency: data.currency ?? "INR",
        method: data.method ?? "Stripe",
        status: data.status ?? "pending",
        createdAt: new Date(),
      }
      payments.push(payment)
      return payment
    },
    update: async (where: { id: string }, data: Partial<Payment>) => {
      const payment = findUnique(payments, where)
      if (!payment) return null
      Object.assign(payment, data)
      return payment
    },
  },

  qcImage: {
    findMany: (where: Record<string, any> = {}) => Promise.resolve(findMany(qcImages, where)),
    create: async ({ data }: { data: Partial<QCImage> }): Promise<QCImage> => {
      const image: QCImage = {
        id: nextId("QC"),
        orderId: data.orderId!,
        caption: data.caption ?? null,
        approved: data.approved ?? false,
        createdAt: new Date(),
      }
      qcImages.push(image)
      return image
    },
    update: async (where: { id: string }, data: Partial<QCImage>) => {
      const image = findUnique(qcImages, where)
      if (!image) return null
      Object.assign(image, data)
      return image
    },
  },

  review: {
    findMany: (where: Record<string, any> = {}) => Promise.resolve(findMany(reviews, where)),
    update: async (where: { id: string }, data: Partial<Review>) => {
      const review = findUnique(reviews, where)
      if (!review) return null
      Object.assign(review, data)
      return review
    },
  },

  address: {
    findMany: (where: Record<string, any> = {}) => Promise.resolve(findMany(addresses, where)),
  },
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

seedDemoData()
