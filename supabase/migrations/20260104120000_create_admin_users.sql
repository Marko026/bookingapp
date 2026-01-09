CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- RLS Policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin_users table
-- Recursion prevention: we check if the user is in the list by direct lookup or if they are super admin (service role handles its own)
-- Since we need to check if a user is an admin to let them read this table, we might have a circular dependency if we use RLS to check RLS.
-- A simpler approach for the policy: allow users to read their OWN record.
-- For checking if *someone else* is an admin, we usually do that via secure server-side calls (service role) or we need a public definition of who is admin (not recommended).
-- However, for the middleware/server check, we'll use the service role key or `createServerClient` which respects RLS.
-- Let's define: Users can read their own entry.
CREATE POLICY "Users can read own admin status"
  ON admin_users FOR SELECT
  USING (auth.uid() = user_id);

-- Optional: Allow read access if you are already an admin (requires circular logic or a function). 
-- For now, "Users can read own admin status" is sufficient for "am I an admin?" checks.
