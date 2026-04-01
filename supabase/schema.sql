create extension if not exists pgcrypto;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  monthly_income numeric(12, 2) not null default 0,
  monthly_budget numeric(12, 2) not null default 0,
  current_balance numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  date date not null default current_date,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  deadline date not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists expenses_user_id_date_idx on public.expenses (user_id, date desc);
create index if not exists goals_user_id_deadline_idx on public.goals (user_id, deadline asc);

drop trigger if exists profiles_handle_updated_at on public.profiles;
create trigger profiles_handle_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists goals_handle_updated_at on public.goals;
create trigger goals_handle_updated_at
before update on public.goals
for each row
execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    monthly_income,
    monthly_budget,
    current_balance,
    currency
  )
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((nullif(new.raw_user_meta_data ->> 'monthly_income', ''))::numeric, 0),
    coalesce((nullif(new.raw_user_meta_data ->> 'monthly_budget', ''))::numeric, 0),
    coalesce((nullif(new.raw_user_meta_data ->> 'current_balance', ''))::numeric, 0),
    coalesce(nullif(new.raw_user_meta_data ->> 'currency', ''), 'USD')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    monthly_income = excluded.monthly_income,
    monthly_budget = excluded.monthly_budget,
    current_balance = excluded.current_balance,
    currency = excluded.currency,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.goals enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles
for update
using (auth.uid() = id);

drop policy if exists "Expenses are viewable by owner" on public.expenses;
create policy "Expenses are viewable by owner"
on public.expenses
for select
using (auth.uid() = user_id);

drop policy if exists "Expenses are insertable by owner" on public.expenses;
create policy "Expenses are insertable by owner"
on public.expenses
for insert
with check (auth.uid() = user_id);

drop policy if exists "Expenses are updatable by owner" on public.expenses;
create policy "Expenses are updatable by owner"
on public.expenses
for update
using (auth.uid() = user_id);

drop policy if exists "Expenses are deletable by owner" on public.expenses;
create policy "Expenses are deletable by owner"
on public.expenses
for delete
using (auth.uid() = user_id);

drop policy if exists "Goals are viewable by owner" on public.goals;
create policy "Goals are viewable by owner"
on public.goals
for select
using (auth.uid() = user_id);

drop policy if exists "Goals are insertable by owner" on public.goals;
create policy "Goals are insertable by owner"
on public.goals
for insert
with check (auth.uid() = user_id);

drop policy if exists "Goals are updatable by owner" on public.goals;
create policy "Goals are updatable by owner"
on public.goals
for update
using (auth.uid() = user_id);

drop policy if exists "Goals are deletable by owner" on public.goals;
create policy "Goals are deletable by owner"
on public.goals
for delete
using (auth.uid() = user_id);

create or replace function public.add_expense_with_balance(
  expense_amount numeric,
  expense_category text,
  expense_date date,
  expense_note text default null
)
returns public.expenses
language plpgsql
security invoker
set search_path = public
as $$
declare
  inserted_expense public.expenses;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.expenses (
    user_id,
    amount,
    category,
    date,
    note
  )
  values (
    auth.uid(),
    expense_amount,
    expense_category,
    expense_date,
    expense_note
  )
  returning * into inserted_expense;

  update public.profiles
  set
    current_balance = coalesce(current_balance, 0) - expense_amount,
    updated_at = timezone('utc', now())
  where id = auth.uid();

  return inserted_expense;
end;
$$;

create or replace function public.increment_goal_progress(
  goal_id uuid,
  contribution_amount numeric
)
returns public.goals
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_goal public.goals;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.goals
  set
    current_amount = least(target_amount, current_amount + contribution_amount),
    updated_at = timezone('utc', now())
  where id = goal_id
    and user_id = auth.uid()
  returning * into updated_goal;

  if updated_goal.id is null then
    raise exception 'Goal not found';
  end if;

  return updated_goal;
end;
$$;

grant execute on function public.add_expense_with_balance(numeric, text, date, text) to authenticated;
grant execute on function public.increment_goal_progress(uuid, numeric) to authenticated;
