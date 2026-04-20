-- Migration: Convert apartments from serial to UUID
-- This migration converts the apartments table id from serial integer to uuid,
-- and updates all foreign key references in apartment_images and bookings.

-- Step 1: Add uuid column to apartments
ALTER TABLE apartments ADD COLUMN uuid uuid NOT NULL DEFAULT gen_random_uuid();

-- Step 2: Create a unique index on the new uuid column
CREATE UNIQUE INDEX apartments_uuid_idx ON apartments (uuid);

-- Step 3: Drop the old primary key constraint and serial column
-- First, drop FKs that reference apartments.id
ALTER TABLE apartment_images DROP CONSTRAINT IF EXISTS apartment_images_apartment_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_apartment_id_fkey;

-- Step 4: Add new uuid columns to referencing tables
ALTER TABLE apartment_images ADD COLUMN apartment_uuid uuid;
ALTER TABLE bookings ADD COLUMN apartment_uuid uuid;

-- Step 5: Populate the new uuid columns by joining on old integer ids
UPDATE apartment_images
SET apartment_uuid = apartments.uuid
FROM apartments
WHERE apartment_images.apartment_id = apartments.id;

UPDATE bookings
SET apartment_uuid = apartments.uuid
FROM apartments
WHERE bookings.apartment_id = apartments.id;

-- Step 6: Make the new columns NOT NULL
ALTER TABLE apartment_images ALTER COLUMN apartment_uuid SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN apartment_uuid SET NOT NULL;

-- Step 7: Add new FK constraints
ALTER TABLE apartment_images
  ADD CONSTRAINT apartment_images_apartment_uuid_fkey
  FOREIGN KEY (apartment_uuid) REFERENCES apartments(uuid) ON DELETE CASCADE;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_apartment_uuid_fkey
  FOREIGN KEY (apartment_uuid) REFERENCES apartments(uuid) ON DELETE CASCADE;

-- Step 8: Drop old integer columns
ALTER TABLE apartment_images DROP COLUMN apartment_id;
ALTER TABLE bookings DROP COLUMN apartment_id;

-- Step 9: Recreate indexes
CREATE INDEX apartment_images_apartment_uuid_idx ON apartment_images (apartment_uuid);
CREATE INDEX booking_overlap_idx ON bookings (apartment_uuid, check_in, check_out);

-- Step 10: Drop old primary key and serial column from apartments
ALTER TABLE apartments DROP CONSTRAINT apartments_pkey;
ALTER TABLE apartments DROP COLUMN id;

-- Step 11: Set uuid as new primary key
ALTER TABLE apartments ADD PRIMARY KEY (uuid);

-- Step 12: Rename uuid column to id
ALTER TABLE apartments RENAME COLUMN uuid TO id;
ALTER TABLE apartment_images RENAME COLUMN apartment_uuid TO apartment_id;
ALTER TABLE bookings RENAME COLUMN apartment_uuid TO apartment_id;

-- Step 13: Recreate FK constraints with correct column names
ALTER TABLE apartment_images DROP CONSTRAINT apartment_images_apartment_uuid_fkey;
ALTER TABLE bookings DROP CONSTRAINT bookings_apartment_uuid_fkey;

ALTER TABLE apartment_images
  ADD CONSTRAINT apartment_images_apartment_id_fkey
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_apartment_id_fkey
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE;

-- Step 14: Recreate indexes with correct names
DROP INDEX IF EXISTS apartments_uuid_idx;
CREATE UNIQUE INDEX apartments_name_idx ON apartments (name);
DROP INDEX IF EXISTS apartment_images_apartment_uuid_idx;
CREATE INDEX apartment_images_apartment_id_idx ON apartment_images (apartment_id);
DROP INDEX IF EXISTS booking_overlap_idx;
CREATE INDEX booking_overlap_idx ON bookings (apartment_id, check_in, check_out);
