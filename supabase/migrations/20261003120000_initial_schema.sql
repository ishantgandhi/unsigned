-- profiles: one row per auth user, created by trigger on signup
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now(),
  is_banned boolean not null default false
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null default auth.uid() references public.profiles (id),
  text text not null check (char_length(text) <= 500),
  created_at timestamptz not null default now()
);
create index messages_sender_id_idx on public.messages (sender_id);
create index messages_created_at_idx on public.messages (created_at);

create table public.reads (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages (id) on delete cascade,
  reader_id uuid not null default auth.uid() references public.profiles (id),
  read_at timestamptz not null default now(),
  unique (message_id, reader_id) -- its index also covers lookups by message_id
);
create index reads_reader_id_idx on public.reads (reader_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages (id) on delete cascade,
  reporter_id uuid not null default auth.uid() references public.profiles (id),
  reason text,
  created_at timestamptz not null default now()
);
create index reports_message_id_idx on public.reports (message_id);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null default auth.uid() references public.profiles (id),
  blocked_sender_id uuid not null references public.profiles (id),
  unique (blocker_id, blocked_sender_id)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.reads enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

create policy "read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "public feed" on public.messages
  for select to anon, authenticated using (true);
create policy "insert own messages" on public.messages
  for insert to authenticated with check (sender_id = (select auth.uid()));

create policy "insert own reads" on public.reads
  for insert to authenticated with check (reader_id = (select auth.uid()));

create policy "insert own reports" on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));

create policy "manage own blocks" on public.blocks
  for all to authenticated
  using (blocker_id = (select auth.uid()))
  with check (blocker_id = (select auth.uid()));
