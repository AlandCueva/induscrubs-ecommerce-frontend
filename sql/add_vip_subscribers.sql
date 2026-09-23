create table public.vip_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeemed_order_id uuid references public.orders(id) on delete set null
);

alter table public.vip_subscribers enable row level security;
-- No policies: service-role only, same pattern as phase1_enable_rls_no_policies.
