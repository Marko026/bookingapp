-- Migration: Add apartment_images table for image gallery support
-- Run this in your Supabase SQL Editor

-- Create apartment_images table
CREATE TABLE IF NOT EXISTS apartment_images (
  id SERIAL PRIMARY KEY,
  apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_apartment_images_apartment_id ON apartment_images(apartment_id);
CREATE INDEX idx_apartment_images_display_order ON apartment_images(display_order);

-- Create storage bucket for apartment images
INSERT INTO storage.buckets (id, name, public)
VALUES ('apartment-images', 'apartment-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for apartment-images bucket
-- Allow public read access
CREATE POLICY "Public read access for apartment images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'apartment-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload apartment images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'apartment-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete apartment images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'apartment-images');

-- Optional: Add RLS policies for apartment_images table
ALTER TABLE apartment_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for apartment images table"
ON apartment_images FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert apartment images"
ON apartment_images FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update apartment images"
ON apartment_images FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete apartment images"
ON apartment_images FOR DELETE
TO authenticated
USING (true);
