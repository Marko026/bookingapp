-- Booking overlap exclusion constraint + additional indexes
-- This prevents race-condition double-bookings at the database level

-- 1. Add btree_gist extension (required for exclusion constraints with =)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Add exclusion constraint to prevent overlapping bookings
-- This ensures no two non-cancelled bookings for the same apartment can have overlapping date ranges
ALTER TABLE bookings ADD CONSTRAINT booking_no_overlap EXCLUDE
  USING gist (apartment_id WITH =, daterange(check_in::date, check_out::date) WITH &&)
  WHERE (status != 'cancelled');

-- 3. Add indexes not yet covered by existing migrations
CREATE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS apartments_name_idx ON apartments(name);
