# Apthamithra — Project Brief

*Rooted in trust. Always by your side.*

A personalized shopping service for Non-Resident Indians (NRIs): customers book
an appointment, our team in India contacts them by app, phone or video to
understand their needs, purchases on their behalf from trusted local shops,
and ships internationally or delivers locally within India.

This document captures the refined business concept, website structure, user
journey, feature roadmap and current implementation status.

| | |
|---|---|
| **Live site** | https://apthamithra.vercel.app |
| **Repository** | https://github.com/Dithaharish/apthamithra |
| **Status** | Deployed and publicly accessible |

For technical setup and deployment see `README.md`. For editing text, prices,
sections and pages yourself, see `CUSTOMIZATION.md`.

---

## 1. Refined business concept

**Positioning:** Personal Shopper & Proxy Purchase Service for NRIs — *your
trusted family in India, shopping on your behalf.*

**The problem:** NRIs lose reliable access to their trusted local shops, get
authentic regional products, or can't ask relatives to run errands. Existing
e-commerce can't source from a specific shop, verify quality in person, or act
with local knowledge.

**The solution:** A verified human team in India that shops offline on live
video, verifies quality before shipping, attaches original bills, and handles
packing, customs and international delivery end to end.

**Core value proposition**
- Shop from *your specified shop*, not a generic marketplace
- Live video from the market — you see the item before it is bought
- QC photos/videos plus original bills before anything ships
- Consolidated shipments to save freight
- Local delivery inside India also supported

### Target segments
| Segment | Typical order |
|---|---|
| NRIs in USA, Canada, UK, ME, Australia | Sarees, sweets, pickles, ayurveda, religious items |
| NRIs gifting within India on behalf of family | Festival and wedding gifting |
| Wedding season bulk buyers | Multi-shop consolidated shipments |
| Parents shopping for children abroad | Clothes, groceries, medicines |

### Revenue model
| Component | Model |
|---|---|
| Service fee | 10–15% of item value, or flat fee per store visit |
| Handling + QC + packaging | Flat fee (e.g. $15 per order) |
| Shipping | At cost + margin, via courier partnership |
| Consolidation | Freight savings when combining multi-shop orders |
| Membership | Monthly plan for frequent shoppers with reduced fee + priority slots |

---

## 2. Website sitemap

### Public
| Route | Purpose |
|---|---|
| `/` | Home — value proposition in 30 seconds |
| `/services` | Detailed service tiers and categories |
| `/how-it-works` | Four-step process |
| `/pricing` | Fee structure + cost estimator |
| `/testimonials` | Reviews, ratings, video testimonials |
| `/faqs` | Common objections answered |
| `/contact` | Phone, WhatsApp, email, address, languages |
| `/book` | Public appointment booking |
| `/track-order` | Order lookup by ID |
| `/legal` | Terms, privacy, refund and customs policy |

### Authenticated customer
| Route | Purpose |
|---|---|
| `/login`, `/register` | Account access |
| `/dashboard` | Overview and stats |
| `/dashboard/book` | Book an appointment |
| `/dashboard/appointments` | Manage consultations |
| `/dashboard/orders` | Full order history and status |
| `/dashboard/shipments` | Live tracking and customs |
| `/dashboard/quotes` | Review and approve quotations |
| `/dashboard/profile` | Details, addresses, notifications |

### Employee (shopper)
| Route | Purpose |
|---|---|
| `/shopper` | Today's schedule, stats, active jobs, availability |
| `/shopper/appointments` | Consultations assigned to me |
| `/shopper/appointments/[id]` | Run the call, mark progress, raise the order |
| `/shopper/orders` | Shopping orders I am handling |
| `/shopper/orders/[id]` | Items, QC, charges, lifecycle actions |
| `/shopper/customers` | NRIs I have consulted with |
| `/shopper/tasks` | Task board: Consult → Purchase → Quality → Pack & ship |
| `/shopper/profile` | Profile and availability toggle |

### Admin / staff
| Route | Purpose |
|---|---|
| `/admin` | KPIs and next appointments |
| `/admin/appointments` | Manage and assign shoppers to consultations |
| `/admin/orders` | Order lifecycle management |
| `/admin/orders/[id]` | Per-order detail, charges, QC, lifecycle |
| `/admin/customers` | Customer accounts |
| `/admin/shoppers` | Trusted shopper team with live workload |
| `/admin/shops` | Verified shop network |
| `/admin/reviews` | Moderate testimonials |
| `/admin/payments` | Transactions and revenue |
| `/admin/analytics` | Category and country trends |
| `/admin/settings` | Fees, hours, integrations |

---

## 3. User journey

### 3.1 Customer journey
1. **Landing** — understands the service in 30 seconds: hero, three steps
   (*Book appointment → Video consultation → We shop & ship*)
2. **Research** — services, pricing calculator, pricing tiers, testimonials, FAQ
3. **Account creation** — email + password, country, timezone, preferred language
4. **Booking** — calendar with IST ↔ local timezone conversion; chooses
   *Video (Zoom/Meet)*, *App call* or *Phone*; states purpose and item list
5. **Confirmation** — instant email + calendar invite, reminders at 24h and 1h
6. **Consultation** — at the scheduled time the shopper joins, understands
   exact needs, shop preference, budget and acceptable alternatives, and builds
   the shopping list live
7. **Quotation** — item cost + service fee + handling + shipping estimate +
   customs estimate. Customer approves, edits or rejects
8. **Execution** — status timeline: *Purchasing → QC photos/videos → Awaiting
   approval → Packed → Shipped*
9. **Delivery** — tracking number, customs documents, insurance, ETA
10. **Post-delivery** — feedback prompt, video testimonial request, referral credit

### 3.2 Internal shopper journey
Appointment assigned → takes the call → converts notes into a quotation →
customer approves → purchases offline with video proof → uploads QC →
packs → generates invoice and airway bill → updates tracking.

---

### 3.3 Shopper (employee) journey
1. Signs in and lands on **Today** — the schedule and live workload
2. Opens an assigned appointment and joins the call
3. Marks the appointment *in progress*, then *completed*
4. Raises a shopping list: items, shop, price, quantity, destination
5. The system prices it automatically (items + 12% service + handling)
6. The customer receives the quotation for approval
7. Advances the order through: *purchasing → QC → packing → shipped*
8. Marks "busy at market" when unavailable so nothing new is assigned

---

## 4. Feature breakdown

### 4.1 MVP
- Responsive marketing site with CMS-ready content blocks
- Authentication: email/password, profile, saved addresses (India + international)
- Appointment booking with slot management and timezone handling
- Reschedule, cancel, and no-show retry logic
- Consultation preference (mode + language + notes)
- Admin calendar for availability and shopper assignment
- Quotation and invoice generation
- Orders and shipments timeline with manual status updates
- Payments: Stripe (international) and Razorpay/UPI (India); partial advance + final
- Notifications: email and WhatsApp on every state change
- Reviews after delivery, moderated before display
- Order tracking page

### 4.2 Phase 2 — trust, efficiency and CX differentiators
- **Live shopping** — staff calls from the shop; customer sees products live
- **Pre-shipment QC gallery** — mandatory 3–5 photos + video, approve/reject gate
- **Trusted shop network** — directory of verified shops by city and category
- **Cost estimator** — item cost + service fee + weight-based shipping + duty
- **Consolidation** — hold multi-shop purchases and ship once
- **Wallet / subscription** — store credits and monthly plans
- **AI shopping list parser** — paste a WhatsApp list or upload a photo of a
  handwritten list, get a structured list
- **Courier integration** — Shiprocket, DHL, FedEx for rates, labels, tracking
- **Insurance and escrow** — funds held until QC approval
- **Referral program** — NRI refers NRI for discount
- **Multi-currency and i18n** — English and Hindi
- **Festival reminders** — seasonal prompts before Diwali, Onam, etc.

---

## 5. Improving trust, efficiency and experience

### Trust
| Lever | Implementation |
|---|---|
| Verifiable shoppers | Name, photo, ID verification badge, languages, city coverage |
| Social proof | Video testimonials, Google Reviews embed, Trustpilot, case studies per country |
| Radical transparency | Published fee table, no hidden charges, shop bills attached to every invoice |
| Legal grounding | GST invoices, staff KYC, terms for perishable and customs-restricted items, refund policy |
| Partner credibility | Courier and payment partner logos |
| Site security | HTTPS, security headers, privacy policy |

### Efficiency
| Lever | Implementation |
|---|---|
| Smart scheduling | Auto slot blocking, no double-booking, IST overlap suggestions |
| CRM templates | Reusable lists for festivals, weddings, monthly groceries |
| Mobile-first shopper view | PWA so staff can update orders from the market |
| Auto-reminders | 24h and 1h before; one-tap rebook on no-show |

### Customer experience
| Lever | Implementation |
|---|---|
| "My trusted shops" | Save favourite shops and specific salespeople |
| Address book | Validated for international formats |
| Currency conversion | INR ↔ USD/GBP/AED display |
| Support | WhatsApp widget and ticketing |
| Post-delivery NPS | Incentivised review request |

---

## 6. Design reference

Marketing sections follow the structure of components reviewed from
[threeui.com/browse](https://threeui.com/browse):

| Section | Reference |
|---|---|
| How it Works | ThreeUI *Aniwall Workflow* — four-step path with progress line |
| Services | ThreeUI *RenderLab Services* — numbered capability cards |
| Testimonials | ThreeUI *Kairo Testimonials* — portrait + quote cards |
| FAQ | ThreeUI *Volta Atelier FAQ* — accessible accordion |
| CTA | ThreeUI *Volta Atelier CTA* — oversized closing invitation |

**Deliberate deviation:** reimplemented in plain Tailwind with **no WebGL**.
Heavy 3D effects were avoided because the audience is NRIs on mobile networks
and international connections — shader-heavy sections would hurt performance,
SEO (LCP) and data usage, and trust is conveyed better by fast, clean pages
with real photography than by visual spectacle.

---

## 7. Order lifecycle

```
pending → purchasing → qc_pending → qc_approved → paid → packed → shipped → delivered
```

The customer approves QC photos and videos **before** payment or packing.
Original shop bills are attached to every quotation.

---

## 8. Implementation status

**Tech stack:** Next.js 16 (App Router), Tailwind CSS v4, TypeScript,
NextAuth 4 (credentials provider), Prisma schema for the production model.

### Completed and verified
- **Customer workspace** (`/dashboard`) — overview, appointments, orders,
  shipments, quotes, profile
- **Shopper workspace** (`/shopper`) — today, appointments, appointment
  workspace, shopping orders, order detail, customers, task board, profile
- **Admin workspace** (`/admin`) — overview, appointments with shopper
  assignment, orders with order detail, customers, shoppers with live
  workload, payments, reviews moderation, settings
- Role-based routing: ADMIN → `/admin`, SHOPPER → `/shopper`,
  CUSTOMER → `/dashboard`
- Full data layer mirroring `prisma/schema.prisma`, with seeded demo data
- Shopper can raise a priced order, advance status, and toggle availability
- Admin can assign shoppers and moderate reviews
- Server-side authorisation on every shopper and admin endpoint
- 44 routes, 22/22 end-to-end checks passing (`npm test`)
- Lint clean, TypeScript clean, production build passing
- **Git repository created and pushed** (`cec846c`, 101 files)
- **Deployed live on Vercel** — verified HTTP 200 with correct branding

### Outstanding
| Item | Status |
|---|---|
| GitHub repository | **Live** — https://github.com/Dithaharish/apthamithra |
| Vercel deployment | **Live** — https://apthamithra.vercel.app |
| Automatic deploys | Push to `main` redeploys production |
| Persistent database | In-memory layer; needs hosted Postgres |
| Payment gateways | Awaiting API keys |
| Courier APIs | Awaiting API keys |
| WhatsApp / email notifications | Awaiting API keys |
| Image upload for QC photos | UI complete; storage backend needed |
| Real content | Placeholder copy, demo shopper/shop/order data |

### Local development
```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:3000
```

### Data layer note
`prisma/schema.prisma` holds the production data model. `src/lib/db.ts`
currently provides a small in-memory implementation with the same shape, so the
application builds and runs without a database. To move to production, attach a
Postgres instance, run `prisma generate`, and point `db.ts` at the generated
client — no call sites need to change.

---

## 9. Immediate next steps

1. **Confirm sign-in works on the live site.** Sign in at
   https://apthamithra.vercel.app/login with `shopper1@apthamithra.com` /
   `apthamithra123`. If it fails, check `NEXTAUTH_URL` has no trailing slash
   and that a redeploy happened after adding it.
2. **Attach a real database** (Neon / Supabase / Railway free Postgres). The
   live site currently uses an in-memory layer, so accounts and orders do not
   survive a serverless restart. This is the main blocker to real use.
3. **Collect feedback** from 5–10 NRIs before building payments or courier
   integrations.
4. **Wire payments** — Stripe for international, Razorpay for India.
5. **Wire courier APIs** for real rates, labels and tracking.
6. **Enable notifications** — transactional email plus WhatsApp.
7. **Replace placeholder content** with real copy, photography and shopper
   profiles.
8. **Expand automated tests** for auth, booking and order lifecycle.

Deployment details, environment variables and the Vercel pitfalls encountered
during setup are documented in `README.md` under "Deployment".
