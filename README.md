# RealProfit COD OS (single-store, internal use)

This is a production-ready starter for a COD operations + profit dashboard:
- Next.js (App Router) + Tailwind (dark fintech UI)
- Supabase Postgres (DB) + Supabase Auth (login)
- Shopify webhooks: orders/create, orders/updated, orders/cancelled
- Manual operational statuses + manual delivery marking
- Logs + blacklist

## 1) Create Supabase project
1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql` (SQL Editor).
3. In Supabase Auth, enable Email/Password provider.

## 2) Configure environment variables
Copy `.env.example` to `.env.local` and set:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- APP_BASE_URL (your deployed domain)

## 3) Create your first user (admin)
Run the app, go to `/login`, and register a user.
Then in Supabase, set that user as admin by inserting into `profiles` (or use the provided trigger in schema to auto-create profiles).

## 4) Connect Shopify
Create a **Custom App** in your Shopify Admin:
Settings → Apps and sales channels → Develop apps → Create an app

Give it permissions:
- read_orders
- read_customers (optional but recommended)
- read_fulfillments (optional)

Get:
- Admin API access token
- Webhook signing secret (from the app's webhook settings)

In the app UI: Integrations → Shopify:
- Paste store domain (e.g. `mystore.myshopify.com`)
- Paste Admin token
- Paste webhook secret
Click **Save** then **Register Webhooks**.

## 5) Deploy
- Push to GitHub
- Import into Vercel
- Add the same env vars in Vercel Project Settings
- Deploy

## Notes
- Delivery is manual: mark orders as Delivered / Not delivered in Orders table.
- This project is single-tenant (you only), no subscription/billing.
