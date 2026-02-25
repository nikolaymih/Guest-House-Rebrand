-- Storage RLS policies for the `assets` bucket
-- Public bucket: anyone can read, only authenticated users can write

-- Public read (so logo/favicon URLs are accessible to all visitors)
create policy "Public read assets"
  on storage.objects for select
  using (bucket_id = 'assets');

-- Authenticated upload
create policy "Authenticated upload assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'assets');

-- Authenticated update (e.g. upsert overwrite)
create policy "Authenticated update assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'assets');

-- Authenticated delete (for future cleanup)
create policy "Authenticated delete assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'assets');
