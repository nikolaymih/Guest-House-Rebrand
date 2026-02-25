-- home_content singleton table
create table home_content (
  id int primary key,
  hero_title_bg text not null default '',
  hero_title_en text not null default '',
  hero_subtitle_bg text not null default '',
  hero_subtitle_en text not null default '',
  about_heading_bg text not null default '',
  about_heading_en text not null default '',
  about_p1_bg text not null default '',
  about_p1_en text not null default '',
  about_p2_bg text not null default '',
  about_p2_en text not null default '',
  about_p3_bg text not null default '',
  about_p3_en text not null default '',
  amenities_heading_bg text not null default '',
  amenities_heading_en text not null default '',
  updated_at timestamptz not null default now()
);

-- home_amenities (same shape as accommodation_features)
create table home_amenities (
  id uuid primary key default gen_random_uuid(),
  label_bg text not null default '',
  label_en text not null default '',
  display_order int not null default 0
);

-- RLS: allow public read, service role write
alter table home_content enable row level security;
alter table home_amenities enable row level security;

create policy "Public read home_content" on home_content for select using (true);
create policy "Public read home_amenities" on home_amenities for select using (true);
create policy "Authenticated write home_content" on home_content for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated write home_amenities" on home_amenities for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
