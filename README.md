# Apthamithra

Rooted in trust. Always by your side.

Your trusted personal shopper in India. NRI customers book a free video
appointment, our team in India shops from their trusted local shops, shares
quality-check photos and original bills for approval, then packs, clears
customs and ships worldwide with full tracking.

Built with **Next.js 16 (App Router) + Tailwind CSS v4** and free-tier
deployment in mind.

| | |
|---|---|
| **Live site** | https://apthamithra.vercel.app |
| **Repository** | https://github.com/Dithaharish/apthamithra |

---

## Documentation

| Document | What it covers |
|---|---|
| `README.md` | Technical setup, structure and deployment |
| `PROJECT-BRIEF.md` | Business concept, sitemap, user journey, roadmap |
| `CUSTOMIZATION.md` | How to edit text, prices, sections and pages yourself |

---

## Workspaces

The app has three workspaces, one per role. Sign-in routes you to the right one
automatically.

| Role | Route | What it does |
|---|---|---|
| Customer | `/dashboard` | Book appointments, view orders, shipments, quotes, profile |
| Shopper (employee) | `/shopper` | Today's schedule, appointments, shopping orders, customers, task board, profile |
| Admin | `/admin` | Overview, appointments, orders, customers, shoppers, payments, reviews, settings |

### Demo accounts

Seeded automatically on first run so every workspace can be reviewed. Shared
password: `apthamithra123`

| Email | Role | Home |
|---|---|---|
| `admin@apthamithra.com` | ADMIN | `/admin` |
| `shopper1@apthamithra.com` | SHOPPER | `/shopper` |
| `raj.mehta@email.com` | CUSTOMER | `/dashboard` |

`DATABASE_URL` and these credentials must be replaced before launch. See
`src/lib/db.ts`.

---

## Features

### Marketing site
- Hero, How it Works, Services, Pricing + live cost estimator, Testimonials,
  FAQ, CTA, Contact and footer
- Responsive, mobile-first, light/dark aware
- Trust signals: verified shoppers, QC-before-shipping, bills attached

### Customer account
- Email + password registration and sign-in (NextAuth credentials provider)
- Profile with country, timezone and preferred language
- Appointment booking with IST ↔ local timezone awareness
  - Date, time slot, mode (video / app / phone)
  - Purpose and free-form item list
- Dashboard: overview, appointments, orders, shipments with timeline,
  quotes, profile

### Shopper workspace (`/shopper`)
Employee area for the team in India.
- Today's schedule and full appointment list
- Appointment workspace: start and complete the call, add notes
- Shopping orders with full lifecycle control and progress track
- Customer list with contact and destination context
- Task board grouped by stage: Consult → Purchase → Quality → Pack & ship
- Raise a shopping list that becomes a priced quotation
- Availability toggle ("busy at market") so no new appointments are assigned

### Admin panel (`/admin`)
- Overview with live KPIs and next appointments
- Appointments — **assign a shopper** to each consultation
- Orders — full lifecycle, per-order detail page
- Customers, Shoppers (with live workload), Payments, Reviews moderation
- Settings

### API
| Route | Purpose |
|---|---|
| `POST /api/auth/register` | Create an account |
| `POST /api/auth/login` | Credential verification |
| `GET  /api/auth/me` | Current session |
| `GET/POST /api/appointments` | List / book appointments |
| `PATCH /api/shopper/appointments` | Shopper updates their own appointment |
| `GET/PATCH/POST /api/shopper/orders` | Shopper reads, advances and raises orders |
| `PATCH /api/shopper/profile` | Shopper availability |
| `POST /api/admin/assign` | Admin assigns a shopper to an appointment |
| `PATCH /api/admin/reviews` | Admin moderates reviews |
| `[...nextauth]` | NextAuth handlers |

### Authorisation
- `/dashboard`, `/admin` and `/shopper` are protected by middleware and
  redirect to `/login?callbackUrl=...` when signed out
- Shopper endpoints reject callers who are not the assigned shopper (`403`)
- Admin endpoints reject non-admins (`403`)
- Object IDs are verified server-side; a client cannot act on another
  shopper's records

---

## Order lifecycle

```
pending → purchasing → qc_pending → qc_approved → paid → packed → shipped → delivered
```

The customer approves QC photos and videos before anything is paid for or
packed. Original shop bills are attached to every quotation.

---

## Getting started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
# then generate a secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Run
npm run dev
```

Open http://localhost:3000

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Lint |
| `npm run typecheck` | TypeScript check |
| `npm test` | End-to-end smoke test (needs a running server) |

### Running the tests

```bash
# terminal 1
npm run dev

# terminal 2
npm test
```

The suite signs in as each role and asserts that shopper, admin and customer
actions succeed or are rejected as expected, and that protected routes redirect
visitors to sign-in. It prints a PASS/FAIL line per check.

---

## Deployment

### Current deployment — done

| | |
|---|---|
| **Live URL** | https://apthamithra.vercel.app |
| **Repository** | https://github.com/Dithaharish/apthamithra |
| **Branch** | `main` |
| **Initial commit** | `cec846c` — 101 files |
| **Platform** | Vercel (Hobby plan) |
| **Deploys** | Automatic on every push to `main` |

Verified: the live site returns HTTP 200 with the Apthamithra brand and
"Rooted in trust. Always by your side" tagline rendering.

### Environment variables set on Vercel

| Name | Value | Notes |
|---|---|---|
| `NEXTAUTH_SECRET` | 256-bit generated hex | JWT signing. Never commit this. |
| `NEXTAUTH_URL` | `https://apthamithra.vercel.app` | **No trailing slash.** Required or login breaks in production. |

To generate a new secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Redeploying after changing an env variable

Environment variables are baked into the build. Changing one has **no effect**
until you redeploy:

**Deployments tab → three dots (•••) on the latest deployment → Redeploy**

This is the single most common reason sign-in appears broken on a live
deployment even though every setting looks correct.

### Vercel pitfalls hit during setup

| Symptom | Cause | Fix |
|---|---|---|
| No "Add variable" button where expected | Environment variables were being viewed under **Team Settings** instead of the project | Use the project's own **Settings → Environment Variables**, or the Add button above the variable table |
| "+ Create New" menu shows Project / Domain / Integration | That menu creates resources, not variables | Ignore it; find **Add** / **Add New** near the variable list |
| Login redirect loop in production | `NEXTAUTH_URL` had a trailing slash, or was missing | Set exactly `https://<domain>.vercel.app` and redeploy |
| `ERESOLVE` peer-dependency failure in the build log | `next-auth@4` and `bcryptjs` peer conflict | `vercel.json` sets `installCommand: npm install --legacy-peer-deps` — check it is still present |

### Vercel free tier

HTTPS, a `*.vercel.app` subdomain, serverless functions and Git-based CI/CD
are all included at no cost. Every push to `main` triggers a production build;
push to any other branch creates a preview deployment.

### Local Git setup notes (Windows)

Git 2.56 installed via the standard installer is located at
`C:\Program Files\Git\cmd\git.exe`. If a shell started before the install does
not recognise `git`, use the full path or restart the terminal:

```powershell
& "C:\Program Files\Git\cmd\git.exe" --version
```

Identity used for commits:

```
user.name  = Enugala Harikrishna Reddy
user.email = Dithaharish@users.noreply.github.com
```

`.gitattributes` normalises line endings to LF so Windows checkouts do not
create spurious diffs.

### Optional: managed Postgres

`prisma/schema.prisma` contains the production data model (User, Appointment,
Order, OrderItem, Shipment, Payment, QCImage, Review, Shop, Shopper, Address).

Because `prisma generate` could not run in the original build environment
(the Prisma CLI could not resolve its generator binary), the app currently
ships a small in-memory data layer at `src/lib/db.ts` that mirrors the same
models. Its API surface is deliberately Prisma-like:

```ts
db.user.findUnique({ email })
db.appointment.create({ data: { ... } })
```

To move to a real database:

1. Create a free Postgres database (Neon, Supabase or Railway).
2. Set `DATABASE_URL` in your environment.
3. Run `npx prisma generate` in an environment where the Prisma CLI works.
4. Point `src/lib/db.ts` at the generated client, or replace its
   `findUnique` / `create` implementations with `prisma.*` calls. No call
   sites need to change.

### Known limitation of the current live deployment

The live site uses the in-memory data layer. **Accounts, appointments and
orders created on the live site do not persist** — they reset when a Vercel
serverless function restarts. The seeded demo accounts in `src/lib/db.ts` are
re-created on each cold start, so those always work. This is expected until a
database is attached.

---

## Project structure

```
prisma/schema.prisma            Production data model
scripts/smoke.test.js           End-to-end role test (npm test)
src/
  app/
    page.tsx                    Marketing home page
    book/                       Public appointment booking
    contact/
    login/  register/
    dashboard/                  Customer area
      page.tsx                  Overview
      appointments/ orders/ shipments/ quotes/ profile/ book/
    shopper/                    Employee (shopper) area
      page.tsx                  Today and stats
      appointments/             List + per-appointment workspace
      orders/                   List + per-order detail
      customers/ tasks/ profile/
    admin/                      Admin panel
      page.tsx  appointments/ orders/ customers/ shoppers/
      shops/ reviews/ payments/ analytics/ settings/
    api/
      auth/[...nextauth]/       NextAuth handlers
      auth/register/ login/ me/
      appointments/             Customer booking
      shopper/                  appointments, orders, profile
      admin/                    assign, reviews
  components/
    site-header.tsx  site-footer.tsx
    dashboard-nav.tsx  admin-nav.tsx  shopper-nav.tsx
    sections/                  hero, how-it-works, services, pricing,
                               testimonials, faq, cta
    ui/                        button, badge, input, label, textarea, select
    appointment-booking-form.tsx
    login-form.tsx  register-form.tsx
    assign-shopper.tsx          Admin assigns a shopper
    appointment-status-control.tsx
    shopper-order-actions.tsx  admin-order-status.tsx
    shopper-availability-toggle.tsx  moderate-review.tsx
    raise-order-form.tsx        Shopper builds a quotation
    providers.tsx              NextAuth SessionProvider
  lib/
    db.ts                      Data layer (users, shoppers, shops,
                               appointments, orders, items, shipments,
                               payments, QC, reviews, addresses)
    shopper.ts                 Shopper context helpers
    utils.ts                   cn() helper
  auth.ts                      NextAuth options + homeFor() role routing
  middleware.ts                Route protection
```

---

## Design reference

Marketing sections follow the structure of components reviewed from
threeui.com/browse — specifically:

- **How it Works** — four-step path with a connected progress line
  (after ThreeUI *Aniwall Workflow*)
- **Services** — numbered capability cards (after ThreeUI *RenderLab Services*)
- **Testimonials** — portrait + quote cards (after ThreeUI *Kairo Testimonials*)
- **FAQ** — accessible accordion (after ThreeUI *Volta Atelier FAQ*)
- **CTA** — oversized closing invitation

Reimplemented in plain Tailwind without WebGL, so the site stays fast and
light for NRIs on mobile networks. Heavy 3D effects were intentionally
avoided for performance, SEO (LCP) and data-usage reasons.

---

## Notes

- Registered accounts exist only for the lifetime of the server process while
  running on the in-memory layer. Add a real database for persistence.
- `NEXTAUTH_SECRET` must be set or authentication will not work.
- Shipping rates in the pricing estimator are indicative; replace with a
  real courier API (Shiprocket, DHL, FedEx) for production.
Shared password apthamithra123: admin@apthamithra.com, shopper1@apthamithra.com, raj.mehta@email.com