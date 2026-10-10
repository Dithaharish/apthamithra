# Customization Guide

Everything you need to edit text, names, prices, sections and pages in
Apthamithra **without writing new code**. Each entry gives the exact file to
open and what to change.

---

## Before you start

You need a code editor (VS Code) and the project running:

```bash
cd C:\Users\SK\nri-concierge
npm run dev
```

Then open http://localhost:3000. The browser refreshes automatically as you
save files.

> **Important:** after editing any file, check the terminal where `npm run dev`
> is running. If it shows an error, your change has a typo — the page will
> stay broken until you fix it. Fix the error before continuing.

---

## Where content lives

All website text sits near the **top** of the file that renders it, in a plain
JavaScript array. Find the array, change the strings inside it.

| What you want to change | File |
|---|---|
| Brand name, tagline, logo | `src/components/site-header.tsx`, `src/components/site-footer.tsx` |
| Browser tab title, search keywords | `src/app/layout.tsx` |
| Hero headline and stats | `src/components/sections/hero.tsx` |
| "How it works" steps | `src/components/sections/how-it-works.tsx` |
| Services and categories | `src/components/sections/services.tsx` |
| Plans and price estimator | `src/components/sections/pricing.tsx` |
| Customer reviews | `src/components/sections/testimonials.tsx` |
| FAQ questions | `src/components/sections/faq.tsx` |
| Contact details | `src/app/contact/page.tsx` |
| Sign-in / register page text | `src/app/login/page.tsx`, `src/app/register/page.tsx` |
| Appointment slots | `src/components/appointment-booking-form.tsx` |
| Countries and languages offered | `src/components/register-form.tsx`, `src/components/appointment-booking-form.tsx` |
| Business name, fees, hours, API keys | `src/app/admin/settings/page.tsx` |
| Shopper task-board stages | `src/app/shopper/tasks/page.tsx` |
| Order stages and labels | `src/lib/db.ts` (`ORDER_FLOW`, `ORDER_STATUS_LABEL`) |
| Demo accounts and seed data | `src/lib/db.ts` |
| Colors | `src/app/globals.css` and the `amber-` classes in any component |

---

## Editing rules that will save you time

1. **Keep the quotes.** Every value is wrapped in `"..."`. If you delete a
   quote, the file breaks.
2. **Keep the commas.** Each line in an array ends with a comma. A missing
   comma is the most common cause of errors.
3. **Apostrophes.** Use `&apos;` instead of a raw `'` inside JSX text (for
   example `Today&apos;s Appointments`). In plain strings, a normal apostrophe
   is fine.
4. **Curly braces `{}` are code.** If you see `{something}` in JSX it is a
   variable — don't delete them.

---

## Common tasks

### Change the brand name or tagline

Open `src/components/site-header.tsx`. You will see:

```jsx
<span className="font-semibold tracking-tight">Apthamithra</span>
<span className="hidden sm:inline text-xs text-zinc-500 ml-1">
  Rooted in trust. Always by your side
</span>
```

Change the two text values. Do the same in `src/components/site-footer.tsx`,
and in `src/app/layout.tsx` for the browser tab title.

### Change the browser tab title

Open `src/app/layout.tsx` and edit:

```js
title: "Apthamithra — Rooted in trust. Always by your side",
description: "Book a free video appointment...",
keywords: ["Apthamithra", "NRI shopping", ...],
```

### Add or remove a customer review

Open `src/components/sections/testimonials.tsx`. The file starts with an array
of reviews. To add one, copy an existing line and change the values:

```js
const reviews = [
  { name: "Raj Mehta", location: "New Jersey, USA", rating: 5,
    text: "My wife wanted a silk saree...", img: "R" },
  // add your new one here, ending with a comma
  { name: "Your Customer", location: "Your City", rating: 5,
    text: "What they said.", img: "Y" },
]
```

To remove one, delete its whole line including the trailing comma. The `img`
field is the letter shown in the circle — use the first letter of their name.

### Add or remove an FAQ

Open `src/components/sections/faq.tsx` and edit the `faqs` array:

```js
const faqs = [
  { q: "Do I need to be available during the shopping call?",
    a: "Yes — the consultation call happens..." },
]
```

Reordering rows changes the display order automatically. The accordion opens
and closes on click with no extra setup.

### Add or remove a service

Open `src/components/sections/services.tsx`:

```js
const services = [
  { title: "Proxy Shopping",
    items: ["Go to your specified shop", "Video call live from shop"],
    accent: "bg-amber-500" },
]
```

`accent` is the small colored bar above the title. Any Tailwind color works:
`bg-amber-500`, `bg-emerald-500`, `bg-sky-500`, `bg-purple-500`.

The four category chips below the cards are a separate array in the same file:

```jsx
{["Groceries & Sweets","Textiles & Jewelry",
  "Ayurveda & Medicines","Religious & Festival"].map(...)}
```

### Change prices and fees

Open `src/components/sections/pricing.tsx`. There are two things to edit.

**The three plan cards**, near the top of the returned JSX:

```jsx
{ name: "Pay As You Go", price: "12%", desc: "Per shop visit + handling $15...", cta: "Most Popular" },
{ name: "Monthly Pack", price: "$49/mo", desc: "2 consolidated shipments...", cta: "Save on freight" },
{ name: "Business", price: "Custom", desc: "Bulk, weddings, gifting...", cta: "Contact" },
```

**The calculator logic**, at the top of the component:

```js
const [amount, setAmount] = useState(500)   // starting item value in $
const [weight, setWeight] = useState(5)      // starting weight in kg

const service  = Math.round(amount * 0.12)   // 12% service fee
const handling = 15                          // flat handling fee
const shipping = weight * 12                 // $12 per kg
const total = amount + service + handling + shipping
```

Change `0.12` to your fee percentage, `15` to your handling fee, and `12` to
your per-kg shipping rate. The displayed breakdown updates automatically.

The slider ranges are set on the two range inputs:

```jsx
<input type="range" min={50} max={2000} step={10} ... />   // item value
<input type="range" min={1} max={20} step={1} ... />       // weight
```

### Change the order stages

Open `src/lib/db.ts` and edit two things.

**The stages and their order** — shoppers advance orders through this list, so
the sequence is the actual workflow:

```ts
export const ORDER_FLOW: OrderStatus[] = [
  "pending",       // Awaiting confirmation
  "purchasing",    // Shopping in progress
  "qc_pending",    // QC awaiting approval
  "qc_approved",   // QC approved
  "paid",          // Payment confirmed
  "packed",        // Packed & ready
  "shipped",       // In transit
  "delivered",     // Delivered
]
```

**The label shown for each stage:**

```ts
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Awaiting confirmation",
  purchasing: "Shopping in progress",
  // ...
}
```

If you add a stage, add it to **both** places and to the `OrderStatus` type
above them, otherwise the build will fail.

### Change the shopper task-board stages

Open `src/app/shopper/tasks/page.tsx`. The board columns come from this array:

```ts
const order: Task["stage"][] = ["Consult", "Purchase", "Quality", "Pack & ship"]
```

The `stageFor` function decides which column an order appears in based on its
status, so update that too if you change the stages.

### Change the demo accounts

Open `src/lib/db.ts`. `DEMO_ACCOUNTS` near the top lists the login emails, and
`DEMO_PASSWORD_HASH` is the shared bcrypt hash for `apthamithra123`. Change
the hash by running this and pasting the result:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-new-password', 10))"
```

The seeded shoppers, shops, customers, appointments, orders and reviews are
all further down the same file in `seedDemoData()`.

### Change appointment slots or booking options
Open `src/components/appointment-booking-form.tsx`.

**Time slots** shown in the dropdown:

```js
const timeSlots = ["8:00 AM", "9:00 AM", ... "9:00 PM"]
```

**Mode of consultation:**

```jsx
<SelectItem value="video">Video (Zoom / Google Meet)</SelectItem>
<SelectItem value="app">App Call</SelectItem>
<SelectItem value="phone">Phone</SelectItem>
```

**Languages:**

```jsx
<SelectItem value="English">English</SelectItem>
<SelectItem value="Hindi">Hindi</SelectItem>
<SelectItem value="Gujarati">Gujarati</SelectItem>
<SelectItem value="Tamil">Tamil</SelectItem>
```

**How far ahead customers can book:**

```js
setMaxDate(new Date(Date.now() + 14 * 86400000)...)  // 14 days
```

Change `14` to `30` for a month, and so on.

### Change countries and timezones on registration

Open `src/components/register-form.tsx`. Two `Select` blocks hold the country
and timezone lists. Add or remove `<SelectItem>` rows.

To add a new timezone, use an [IANA timezone
name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), for
example `America/Chicago`, `Europe/Berlin`, `Asia/Singapore`.

### Change contact details

Open `src/app/contact/page.tsx`. Phone, email and address are in the left
column as plain text.

### Change colors or fonts

The brand accent color is Tailwind's `amber`. To change the whole accent,
search every file for `amber-` and replace with another Tailwind palette such
as `emerald-`, `rose-`, or `orange-`.

Base light/dark colors are in `src/app/globals.css`:

```css
:root {
  --background: #ffffff;   /* page background */
  --foreground: #171717;   /* body text */
}
```

---

## Adding something new

### Add a link to the navigation

Open `src/components/site-header.tsx` and add an entry to the `links` array:

```js
const links = [
  { href: "#services", label: "Services" },
  { href: "#how-it-works", label: "How it Works" },
  // add yours
  { href: "/track", label: "Track Order" },
]
```

For an in-page section use `#section-id`. For a separate page use `/path`.

### Add a section to the home page

1. Create the file `src/components/sections/my-section.tsx`:

```jsx
export function MySection() {
  return (
    <section id="my-section" className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-semibold">My heading</h2>
        <p className="mt-3 text-zinc-600">My content.</p>
      </div>
    </section>
  )
}
```

2. Open `src/app/page.tsx`, add the import:

```jsx
import { MySection } from "@/components/sections/my-section"
```

3. Add the component where you want it to appear:

```jsx
<HowItWorks />
<MySection />     {/* renders after How It Works */}
<Services />
```

> **Important:** if your section uses `useState`, `useEffect`, or an `onClick`
> handler, the first line of the file must be `"use client"` (with quotes).
> Sections with no interactive behaviour don't need it.

### Add a new page

1. Create a folder under `src/app/` with a `page.tsx` inside it — the folder
   name becomes the URL. For example `src/app/track/page.tsx` is served at
   `/track`.
2. Copy the structure from an existing simple page such as
   `src/app/contact/page.tsx`, which includes the header and footer:

```jsx
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function TrackPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-semibold">Track your order</h1>
      </main>
      <SiteFooter />
    </div>
  )
}
```

3. Add a nav link pointing to `/track`.

### Add a field to the booking form

Open `src/components/appointment-booking-form.tsx`. Add state, add the input,
and add it to the POST body — all three are needed:

```jsx
// 1. state
const [phone, setPhone] = useState("")

// 2. input
<div>
  <Label htmlFor="phone">Phone</Label>
  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
</div>

// 3. send it (find the existing fetch call and add the field)
body: JSON.stringify({ date, time, mode, language: lang, purpose, notes, phone }),
```

If the form should **save** the field, you must also add it to the API route
(`src/app/api/appointments/route.ts`) and the data model
(`src/lib/db.ts`). Fields that are only collected for the shopper's
conversation don't need this.

---

## Files you should be careful with

| File | Why |
|---|---|
| `src/app/layout.tsx` | Wraps every page; a syntax error breaks the whole site |
| `src/auth.ts` | Login and session logic |
| `src/middleware.ts` | Route protection for `/dashboard` and `/admin` |
| `src/lib/db.ts` | Data layer; accounts reset on restart |
| `package.json` | Dependency list; don't remove lines casually |
| `.env` | Contains your secret key; never share or publish this file |

`.env` is in `.gitignore`, so it will not be pushed to GitHub. If you deploy
to Vercel, set `NEXTAUTH_SECRET` in the Vercel dashboard instead.

---

## How to check your change worked

```bash
npm run lint        # catches syntax and unused-import problems
npm run typecheck   # catches type errors
npm run build       # confirms the site can be built for production
```

Run all three before pushing to GitHub. If all three pass, the change is safe.
Then push and Vercel redeploys automatically.

---

## Reset the branding

If you ever want to undo the Apthamithra rebrand, search the project for
`Apthamithra` and `Rooted in trust` and replace each value. The full list of
files is in `README.md` under the brand section.
