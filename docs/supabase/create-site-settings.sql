-- site_settings singleton table (id always = 1)
create table site_settings (
  id int primary key,
  logo_url text,
  favicon_url text,
  updated_at timestamptz not null default now()
);

-- RLS: allow public read, authenticated write
alter table site_settings enable row level security;

create policy "Public read site_settings"
  on site_settings for select using (true);

create policy "Authenticated write site_settings"
  on site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Insert the singleton row so upsert always finds it
insert into site_settings (id) values (1)
  on conflict (id) do nothing;
