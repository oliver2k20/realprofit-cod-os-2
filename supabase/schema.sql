-- RealProfit COD OS schema (single-tenant friendly)

-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles (ties to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'agent', -- 'admin' | 'agent'
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', ''), 'admin')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Stores (supports multi-store later, but you can use 1 store)
create table if not exists public.stores (
  id uuid primary key default uuid_generate_v4(),
  name text not null default 'Main Store',
  shop_domain text,
  shopify_access_token text,
  shopify_webhook_secret text,
  currency text not null default 'DOP',
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references public.stores(id) on delete cascade,

  shopify_order_id bigint not null,
  order_number text,
  created_at_shopify timestamptz,
  customer_name text,
  phone text,
  city text,
  address1 text,
  address2 text,
  notes text,

  total_price numeric(12,2) not null default 0,
  cod boolean not null default true,

  status text not null default 'sin_confirmar', -- operational status
  agent_id uuid references public.profiles(id) on delete set null,
  call_attempts int not null default 0,
  last_call_at timestamptz,

  cogs numeric(12,2) not null default 0,
  shipping_cost numeric(12,2) not null default 0,
  cpa numeric(12,2) not null default 0,

  delivered_at timestamptz,
  not_delivered_reason text,

  real_profit numeric(12,2) not null default 0,
  shipping_loss numeric(12,2) not null default 0,

  updated_at timestamptz not null default now(),

  unique (store_id, shopify_order_id)
);

create index if not exists idx_orders_store_status_created
on public.orders (store_id, status, created_at_shopify desc);

-- Status history
create table if not exists public.order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  changed_at timestamptz not null default now()
);

-- Blacklist
create table if not exists public.blacklist (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references public.stores(id) on delete cascade,
  phone text not null,
  name text,
  reason text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (store_id, phone)
);

-- Settings
create table if not exists public.settings (
  store_id uuid primary key references public.stores(id) on delete cascade,
  default_cogs numeric(12,2) not null default 0,
  default_shipping_cost numeric(12,2) not null default 0,
  default_cpa numeric(12,2) not null default 0,
  risk_rules_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Webhook events (logs)
create table if not exists public.webhook_events (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references public.stores(id) on delete cascade,
  topic text not null,
  payload_hash text,
  status_code int,
  error text,
  received_at timestamptz not null default now()
);

-- RLS (keep simple: internal use). You can enable later.
alter table public.profiles disable row level security;
alter table public.stores disable row level security;
alter table public.orders disable row level security;
alter table public.order_status_history disable row level security;
alter table public.blacklist disable row level security;
alter table public.settings disable row level security;
alter table public.webhook_events disable row level security;

-- Helper: profit calculation function (used by app)
create or replace function public.compute_profit(
  total_price numeric,
  cogs numeric,
  shipping_cost numeric,
  cpa numeric,
  status text
) returns table(real_profit numeric, shipping_loss numeric) language plpgsql as $$
begin
  if status = 'entregado' then
    real_profit := coalesce(total_price,0) - coalesce(cogs,0) - coalesce(shipping_cost,0) - coalesce(cpa,0);
    shipping_loss := 0;
  elsif status = 'no_entregado' then
    real_profit := 0;
    shipping_loss := coalesce(shipping_cost,0);
  else
    real_profit := 0;
    shipping_loss := 0;
  end if;
  return next;
end; $$;
