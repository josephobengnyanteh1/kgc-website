-- Run in Supabase SQL editor. One database, every row tagged by branch.
create type app_role as enum ('member','media','supervisor','pastor','super_admin');
create type give_kind as enum ('tithe','offering','donation','project','birthday');

create table branches (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null,
  city text not null, currency text not null default 'GHS', address text, phone text);
insert into branches (slug,name,city,currency) values
 ('accra','Kingdom Glory Church Grace Temple','Accra','GHS'),
 ('koforidua','Kingdom Glory Church','Koforidua','GHS'),
 ('asamankese','Kingdom Glory Church','Asamankese','GHS'),
 ('utah','Kingdom Glory Church','Utah, USA','USD');

create table profiles (id uuid primary key references auth.users on delete cascade,
  branch_id uuid references branches, full_name text, phone text, birthday date, role app_role not null default 'member');

create table announcements (id uuid primary key default gen_random_uuid(), branch_id uuid references branches, -- null = global
  title text not null, body text, image_url text, created_at timestamptz default now());
create table streams (id uuid primary key default gen_random_uuid(), branch_id uuid references branches not null,
  title text not null, url text not null, starts_at timestamptz, created_at timestamptz default now());
create table payments (id uuid primary key default gen_random_uuid(), branch_id uuid references branches not null,
  user_id uuid references profiles, kind give_kind not null, note text, amount_minor bigint not null check (amount_minor>0),
  currency text not null, reference text unique not null, status text not null default 'pending', created_at timestamptz default now());
create table attendance (id uuid primary key default gen_random_uuid(), branch_id uuid references branches not null,
  member_id uuid references profiles not null, service_date date not null default current_date, taken_by uuid references profiles,
  unique (member_id, service_date));

create function my_role() returns app_role language sql stable security definer as $$ select role from profiles where id=auth.uid() $$;
create function my_branch() returns uuid language sql stable security definer as $$ select branch_id from profiles where id=auth.uid() $$;

alter table branches enable row level security; alter table profiles enable row level security;
alter table announcements enable row level security; alter table streams enable row level security;
alter table payments enable row level security; alter table attendance enable row level security;

create policy "public read branches" on branches for select using (true);
create policy "public read announcements" on announcements for select using (true);
create policy "public read streams" on streams for select using (true);
create policy "media manage announcements" on announcements for all using (my_role()='super_admin' or (my_role() in ('media','pastor') and branch_id=my_branch()));
create policy "media manage streams" on streams for all using (my_role()='super_admin' or (my_role() in ('media','pastor') and branch_id=my_branch()));
create policy "own profile" on profiles for select using (id=auth.uid());
create policy "own profile edit" on profiles for update using (id=auth.uid()) with check (role = my_role());
create policy "leaders see branch members" on profiles for select using (my_role()='super_admin' or (my_role() in ('supervisor','pastor') and branch_id=my_branch()));
create policy "own payments" on payments for select using (user_id=auth.uid());
create policy "pastor sees branch finances" on payments for select using (my_role()='super_admin' or (my_role()='pastor' and branch_id=my_branch()));
create policy "leaders take attendance" on attendance for all using (my_role()='super_admin' or (my_role() in ('supervisor','pastor') and branch_id=my_branch()));
-- Payments are written only by the server (service role key), never by the browser.
create function handle_new_user() returns trigger language plpgsql security definer as $$
begin insert into profiles (id, full_name, phone, branch_id) values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone',
  (select id from branches where slug = new.raw_user_meta_data->>'branch')); return new; end $$;
create trigger on_signup after insert on auth.users for each row execute function handle_new_user();
