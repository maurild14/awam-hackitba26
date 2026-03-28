create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  role text not null check (role in ('buyer', 'seller', 'admin')),
  mp_customer_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bots (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  price_ars integer not null default 0 check (price_ars >= 0),
  category text not null default 'general',
  image_uri text,
  image_tag text,
  status text not null default 'draft' check (
    status in ('draft', 'pending_review', 'published', 'suspended')
  ),
  allowed_domains text[] not null default '{}',
  credential_schema jsonb not null default '[]'::jsonb,
  resources jsonb not null default '{}'::jsonb,
  total_executions integer not null default 0 check (total_executions >= 0),
  average_rating numeric(3, 2) not null default 0 check (
    average_rating >= 0 and average_rating <= 5
  ),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  payment_id uuid unique,
  status text not null default 'initializing' check (
    status in (
      'initializing',
      'running',
      'completed',
      'failed',
      'stopped',
      'timed_out'
    )
  ),
  container_id text,
  proxy_container_id text,
  vault_path text,
  phantom_token_hash text,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  summary text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.execution_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  level text not null default 'info',
  message text not null,
  is_buyer_facing boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  bot_id uuid not null references public.bots (id) on delete cascade,
  mp_payment_id text,
  mp_preference_id text,
  amount_ars integer not null default 0 check (amount_ars >= 0),
  commission_ars integer not null default 0 check (commission_ars >= 0),
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected', 'refunded')
  ),
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.sessions (id) on delete cascade,
  bot_id uuid not null references public.bots (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists bots_status_idx on public.bots (status);
create index if not exists bots_category_idx on public.bots (category);
create index if not exists bots_seller_id_idx on public.bots (seller_id);
create index if not exists sessions_buyer_id_idx on public.sessions (buyer_id);
create index if not exists sessions_status_idx on public.sessions (status);
create index if not exists execution_logs_session_id_created_at_idx
  on public.execution_logs (session_id, created_at desc);
create index if not exists payments_buyer_id_idx on public.payments (buyer_id);
create index if not exists reviews_bot_id_idx on public.reviews (bot_id);

alter table public.sessions
  add constraint sessions_payment_id_fkey
  foreign key (payment_id)
  references public.payments (id)
  on delete set null
  deferrable initially deferred;

alter table public.payments
  add constraint payments_session_id_fkey
  foreign key (session_id)
  references public.sessions (id)
  on delete set null
  deferrable initially deferred;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  requested_username text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', '');
  requested_username := btrim(coalesce(new.raw_user_meta_data ->> 'username', ''));

  if requested_role not in ('buyer', 'seller') then
    raise exception 'Public signup only allows buyer or seller roles.';
  end if;

  if requested_username = '' then
    raise exception 'Username is required for public signup.';
  end if;

  insert into public.profiles (id, username, role)
  values (new.id, requested_username, requested_role);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

create or replace function public.refresh_bot_average_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bots
  set average_rating = coalesce((
    select round(avg(rating)::numeric, 2)
    from public.reviews
    where bot_id = new.bot_id
  ), 0)
  where id = new.bot_id;

  return new;
end;
$$;

drop trigger if exists reviews_after_insert_refresh_rating on public.reviews;

create trigger reviews_after_insert_refresh_rating
after insert on public.reviews
for each row execute procedure public.refresh_bot_average_rating();
