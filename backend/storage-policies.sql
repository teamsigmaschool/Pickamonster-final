-- Run AFTER creating the public bucket "card-art" in Storage.
-- Same two policies as the dish photos, pointed at the new bucket.

CREATE POLICY "Authenticated can upload card art"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'card-art');

CREATE POLICY "Card art is readable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'card-art');
