/*
  # Create storage bucket for property images
  
  1. New Storage
    - Create public bucket for property images
    - Set up RLS policies for:
      - Public read access
      - Authenticated user upload
      - Owner-only deletion
  
  2. Security
    - Enable public access for viewing
    - Restrict uploads to authenticated users
    - Allow owners to delete their images
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view images
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND owner = auth.uid()
);