
CREATE POLICY "Anyone can upload item photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'item-photos');
CREATE POLICY "Anyone can read item photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'item-photos');
