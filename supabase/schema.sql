-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  company_name text not null default '',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can manage own profile" on public.profiles
  for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Surveys table
create table public.surveys (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  code text unique not null,
  title text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.surveys enable row level security;

create policy "Owners can manage own surveys" on public.surveys
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Anyone can view active surveys" on public.surveys
  for select to anon, authenticated
  using (is_active = true);

-- Responses table (anonymous - no user reference)
create table public.responses (
  id uuid default uuid_generate_v4() primary key,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  q1  smallint check (q1 between 0 and 10),
  q2  smallint check (q2 between 0 and 10),
  q3  smallint check (q3 between 1 and 5),
  q4  smallint check (q4 between 1 and 5),
  q5  smallint check (q5 between 1 and 5),
  q6  smallint check (q6 between 1 and 5),
  q7  smallint check (q7 between 1 and 5),
  q8  smallint check (q8 between 1 and 5),
  q9  smallint check (q9 between 1 and 5),
  q10 smallint check (q10 between 1 and 5),
  q11 smallint check (q11 between 1 and 5),
  q12 smallint check (q12 between 1 and 5),
  q13 smallint check (q13 between 1 and 5),
  q14 smallint check (q14 between 1 and 5),
  q15 smallint check (q15 between 1 and 5),
  q16 smallint check (q16 between 1 and 5),
  q17 smallint check (q17 between 1 and 5),
  q18 smallint check (q18 between 1 and 5),
  q19 smallint check (q19 between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.responses enable row level security;

create policy "Anyone can submit responses" on public.responses
  for insert to anon, authenticated
  with check (true);

create policy "Owners can view responses to their surveys" on public.responses
  for select to authenticated
  using (
    survey_id in (
      select id from public.surveys where owner_id = auth.uid()
    )
  );
