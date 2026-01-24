-- Performance optimization indexes
-- Run this migration manually on Supabase Dashboard SQL Editor

-- Add index on apartment_images.apartment_id for faster JOINs
CREATE INDEX IF NOT EXISTS idx_apartment_images_apartment_id ON apartment_images(apartment_id);

-- Add index on attraction_images.attraction_id for faster JOINs  
CREATE INDEX IF NOT EXISTS idx_attraction_images_attraction_id ON attraction_images(attraction_id);

-- Add composite index on apartment_images for faster ordered queries
CREATE INDEX IF NOT EXISTS idx_apartment_images_display_order ON apartment_images(apartment_id, display_order);

-- Add composite index on attraction_images for faster ordered queries
CREATE INDEX IF NOT EXISTS idx_attraction_images_display_order ON attraction_images(attraction_id, display_order);

-- Note: bookings already has booking_overlap_idx on (apartment_id, check_in, check_out)
