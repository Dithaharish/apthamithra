-- ============================================================================
-- Apthamithra — PostgreSQL schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Mirrors prisma/schema.prisma. Safe to run more than once.
-- ============================================================================

create extension if not exists "pgcrypto";

-- Role enumeration -----------------------------------------------------------
do $$ begin
  create type user_role as enum ('CUSTOMER', 'SHOPPER', 'ADMIN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type consultation_mode as enum ('video', 'app', 'phone');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending', 'purchasing', 'qc_pending', 'qc_approved',
    'paid', 'packed', 'shipped', 'delivered', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- Tables ---------------------------------------------------------------------
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  name          text,
  phone         text,
  country       text,
  timezone      text,
  language      text,
  role          user_role not null default 'CUSTOMER',
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists shoppers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  name       text not null,
  city       text not null,
  languages  text[] not null default '{}',
  rating     numeric(2,1) not null default 5.0,
  bio        text,
  photo      text,
  available  boolean not null default true,
  verified   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists shops (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  city      text not null,
  area      text,
  category  text[] not null default '{}',
  rating    numeric(2,1) not null default 5.0,
  verified  boolean not null default false
);

create table if not exists appointments (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users(id) on delete cascade,
  shopper_id  uuid references shoppers(id) on delete set null,
  date        date not null,
  time        text not null,
  mode        consultation_mode not null default 'video',
  purpose     text not null,
  language    text not null default 'English',
  timezone    text not null default 'Asia/Kolkata',
  notes       text,
  status      appointment_status not null default 'scheduled',
  created_at  timestamptz not null default now()
);

create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  customer_id    uuid not null references users(id) on delete cascade,
  shopper_id     uuid references shoppers(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  shop_id        uuid references shops(id) on delete set null,
  status         order_status not null default 'pending',
  subtotal       numeric(12,2) not null default 0,
  service_fee    numeric(12,2) not null default 0,
  handling       numeric(12,2) not null default 0,
  shipping       numeric(12,2) not null default 0,
  currency       text not null default 'INR',
  destination    text,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  name       text not null,
  shop_name  text,
  price      numeric(12,2) not null default 0,
  quantity   integer not null default 1,
  status     text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists shipments (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  courier     text not null,
  tracking_no text,
  weight      numeric(8,2),
  destination text,
  created_at  timestamptz not null default now()
);

create table if not exists payments (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  amount     numeric(12,2) not null default 0,
  currency   text not null default 'INR',
  method     text not null,
  status     payment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists qc_images (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  url        text,
  caption    text,
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users(id) on delete cascade,
  order_id    uuid not null references orders(id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  title       text,
  body        text not null,
  photo       text,
  status      review_status not null default 'pending',
  helpful     integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists addresses (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users(id) on delete cascade,
  name        text not null,
  line1       text not null,
  city        text not null,
  state       text,
  postal      text not null,
  country     text not null,
  is_default  boolean not null default false
);

-- Indexes --------------------------------------------------------------------
create index if not exists idx_shoppers_user        on shoppers(user_id);
create index if not exists idx_appointments_customer on appointments(customer_id);
create index if not exists idx_appointments_shopper  on appointments(shopper_id);
create index if not exists idx_orders_customer       on orders(customer_id);
create index if not exists idx_orders_shopper        on orders(shopper_id);
create index if not exists idx_order_items_order     on order_items(order_id);
create index if not exists idx_shipments_order       on shipments(order_id);
create index if not exists idx_payments_order        on payments(order_id);
create index if not exists idx_qc_images_order       on qc_images(order_id);
create index if not exists idx_reviews_customer      on reviews(customer_id);
create index if not exists idx_reviews_status        on reviews(status);
create index if not exists idx_addresses_customer    on addresses(customer_id);

-- Keep updated_at honest -----------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end $$ language plpgsql;

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ============================================================================
-- Seed data — demo accounts, password for all: apthamithra123
-- The hashes below are bcrypt hashes of that password.
-- ============================================================================

insert into users (email, password_hash, name, phone, country, timezone, language, role) values
  ('admin@apthamithra.com',   '$2b$10$zYI77kU9riyq.hIQrHVAS.zmmDk1TUOqne0k1Zi06eK.0/0jqeMsS', 'Admin User',     null,           'India', 'Asia/Kolkata',       'English', 'ADMIN'),
  ('shopper1@apthamithra.com','$2b$10$zYI77kU9riyq.hIQrHVAS.zmmDk1TUOqne0k1Zi06eK.0/0jqeMsS', 'Priya Sharma',  '+91 90000 0001','India', 'Asia/Kolkata',       'English', 'SHOPPER'),
  ('shopper2@apthamithra.com','$2b$10$zYI77kU9riyq.hIQrHVAS.zmmDk1TUOqne0k1Zi06eK.0/0jqeMsS', 'Anil Verma',    '+91 90000 0002','India', 'Asia/Kolkata',       'English', 'SHOPPER'),
  ('shopper3@apthamithra.com','$2b$10$zYI77kU9riyq.hIQrHVAS.zmmDk1TUOqne0k1Zi06eK.0/0jqeMsS', 'Ravi Nair',     '+91 90000 0003','India', 'Asia/Kolkata',       'English', 'SHOPPER'),
  ('shopper4@apthamithra.com','$2b$10$zYI77kU9riyq.hIQrHVAS.zmmDk1TUOqne0k1Zi06eK.0/0jqeMsS', 'Kavita Reddy',  '+91 90000 0004','India', 'Asia/Kolkata',       'English', 'SHOPPER'),
  ('raj.mehta@email.com',     '$2b$10$zYI77kU9riyq.hIQrHVAS.zmmDk1TUOqne0k1Zi06eK.0/0jqeMsS', 'Raj Mehta',     null,           'USA',   'America/New_York',   'English', 'CUSTOMER'),
  ('anita.shah@email.com',    '$2b$10$zYI77kU9riyq.hIQrHVAS.zmmDk1TUOqne0k1Zi06eK.0/0jqeMsS', 'Anita Shah',    null,           'UK',    'Europe/London',      'Gujarati','CUSTOMER'),
  ('vikram.nair@email.com',   '$2b$10$zYI77kU9riyq.hIQrHVAS.zmmDk1TUOqne0k1Zi06eK.0/0jqeMsS', 'Vikram Nair',   null,           'Canada','America/Toronto',    'Tamil',   'CUSTOMER')
on conflict (email) do nothing;

insert into shoppers (user_id, name, city, languages, rating, bio, verified)
select id, name, city, languages, rating, bio, true
from (values
  ('shopper1@apthamithra.com','Delhi',   array['Hindi','English'],                     4.9, 'Saree & wedding specialist'),
  ('shopper2@apthamithra.com','Mumbai',  array['Hindi','Marathi','English'],            4.8, 'Groceries & sweets'),
  ('shopper3@apthamithra.com','Kerala',  array['Malayalam','Tamil','English'],          5.0, 'Ayurveda & herbs'),
  ('shopper4@apthamithra.com','Hyderabad',array['Telugu','Hindi','English'],            4.7, 'Textiles & jewelry')
) as s(email, city, languages, rating, bio)
join users u on u.email = s.email
on conflict do nothing;

insert into shops (name, city, area, category, rating, verified) values
  ('Kanjeevaram Silk House','Kancheepuram','Near Temple',        array['Sarees'],        4.9, true),
  ('Haldiram''s — Karol Bagh','Delhi',   'Main Bazaar',          array['Sweets','Snacks'],4.8, true),
  ('Kerala Ayurveda Centre','Kochi',      'Near Medical College', array['Ayurveda'],      5.0, true),
  ('Hyderabad Pearls','Hyderabad',        'Laad Bazaar',          array['Jewelry'],       4.7, false)
on conflict do nothing;

insert into appointments (customer_id, shopper_id, date, time, mode, purpose, language, timezone, status)
select c.id, s.id, a.date::date, a.time, a.mode::consultation_mode, a.purpose, c.language, c.timezone, a.status::appointment_status
from (values
  ('raj.mehta@email.com',   'shopper1@apthamithra.com','2026-10-14','7:30 PM','video','Wedding sarees for 40 guests','scheduled'),
  ('anita.shah@email.com',  'shopper2@apthamithra.com','2026-10-14','11:00 AM','app',  'Monthly groceries + Diwali sweets','scheduled'),
  ('vikram.nair@email.com', 'shopper3@apthamithra.com','2026-10-16','6:00 PM','phone','Ayurvedic herbs','scheduled')
) as a(customer_email, shopper_email, date, time, mode, purpose, status)
join users c on c.email = a.customer_email
join users su on su.email = a.shopper_email
join shoppers s on s.user_id = su.id
on conflict do nothing;

insert into orders (customer_id, shopper_id, shop_id, status, subtotal, service_fee, handling, shipping, currency, destination)
select c.id, s.id, sh.id, o.status::order_status, o.subtotal, round(o.subtotal*0.12), o.handling, o.shipping, 'INR', o.destination
from (values
  ('raj.mehta@email.com',  'shopper1@apthamithra.com','Kanjeevaram Silk House',   'shipped',    42300, 1100, 12000, 'New Jersey, USA'),
  ('anita.shah@email.com', 'shopper2@apthamithra.com','Haldiram''s — Karol Bagh','delivered',  10500,  800,  4200, 'London, UK'),
  ('vikram.nair@email.com','shopper3@apthamithra.com','Kerala Ayurveda Centre',   'qc_pending', 18200,  950,  8500, 'Toronto, Canada')
) as o(customer_email, shopper_email, shop_name, status, subtotal, handling, shipping, destination)
join users c on c.email = o.customer_email
join users su on su.email = o.shopper_email
join shoppers s on s.user_id = su.id
join shops sh on sh.name = o.shop_name
on conflict do nothing;

insert into order_items (order_id, name, shop_name, price, quantity, status)
select o.id, i.name, i.shop_name, i.price, i.quantity, o.status::text
from (values
  ('raj.mehta@email.com',   'Silk saree — Kanjivaram',   'Kanjeevaram Silk House',   42300, 1),
  ('anita.shah@email.com',  'Assorted sweets & pickles', 'Haldiram''s — Karol Bagh', 10500, 6),
  ('vikram.nair@email.com', 'Ashwagandha & triphala',    'Kerala Ayurveda Centre',   18200, 4)
) as i(customer_email, name, shop_name, price, quantity)
join users c on c.email = i.customer_email
join orders o on o.customer_id = c.id;

insert into payments (order_id, amount, currency, method, status)
select o.id, o.subtotal + o.service_fee + o.handling + o.shipping, 'INR', 'Stripe', 'paid'
from orders o
where o.status = 'shipped';

insert into qc_images (order_id, url, caption, approved)
select o.id, null, 'Front view with shop bill', (o.status <> 'qc_pending')
from orders o;

insert into reviews (customer_id, order_id, rating, title, body, status, helpful)
select c.id, o.id, r.rating, r.title, r.body, r.status::review_status, r.helpful
from (values
  ('raj.mehta@email.com',  5, 'Wedding sarees exceeded expectations',  'Our shopper sent 3 options live from the market, showed the weave in detail, and shipped it in 11 days.', 'approved', 18),
  ('anita.shah@email.com', 5, 'Monthly grocery runs from my hometown', 'They even included the exact brand of pickle my mother uses. QC photos gave me complete confidence.', 'pending', 2)
) as r(customer_email, rating, title, body, status, helpful)
join users c on c.email = r.customer_email
join orders o on o.customer_id = c.id;

-- Link each order to the consultation it came from.
update orders o
set appointment_id = a.id
from appointments a
where a.customer_id = o.customer_id
  and o.appointment_id is null;

-- Shipment for the in-transit order.
insert into shipments (order_id, courier, tracking_no, weight, destination)
select o.id, 'DHL Express', 'DHL-9876543210', 8.4, o.destination
from orders o
where o.status = 'shipped'
  and not exists (select 1 from shipments s where s.order_id = o.id);

-- Default delivery address for each customer.
insert into addresses (customer_id, name, line1, city, postal, country, is_default)
select c.id, 'Home', '123 Demo Street', split_part(c.country, ',', 1), '00000', c.country, true
from users c
where c.role = 'CUSTOMER'
  and not exists (select 1 from addresses a where a.customer_id = c.id);
