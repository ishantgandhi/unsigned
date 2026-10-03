-- Replaces the policies from the initial schema with explicit per-command ones.
drop policy "read own profile" on public.profiles;
drop policy "public feed" on public.messages;
drop policy "insert own messages" on public.messages;
drop policy "insert own reads" on public.reads;
drop policy "insert own reports" on public.reports;
drop policy "manage own blocks" on public.blocks;

alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.reads enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

-- profiles: select/insert own row only
create policy "profiles select own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles insert own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

-- messages: all authenticated can read; insert own
create policy "messages select all" on public.messages
  for select to authenticated using (true);
create policy "messages insert own" on public.messages
  for insert to authenticated with check ((select auth.uid()) = sender_id);

-- reads / reports: insert own only (no select)
create policy "reads insert own" on public.reads
  for insert to authenticated with check ((select auth.uid()) = reader_id);
create policy "reports insert own" on public.reports
  for insert to authenticated with check ((select auth.uid()) = reporter_id);

-- blocks: full control over own rows
create policy "blocks select own" on public.blocks
  for select to authenticated using ((select auth.uid()) = blocker_id);
create policy "blocks insert own" on public.blocks
  for insert to authenticated with check ((select auth.uid()) = blocker_id);
create policy "blocks update own" on public.blocks
  for update to authenticated
  using ((select auth.uid()) = blocker_id)
  with check ((select auth.uid()) = blocker_id);
create policy "blocks delete own" on public.blocks
  for delete to authenticated using ((select auth.uid()) = blocker_id);
