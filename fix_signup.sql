-- =====================================================
-- FIX: Allow profile creation on signup
-- Run this in Supabase SQL Editor if signup is failing
-- =====================================================

-- Add policy for users to insert their own profile
CREATE POLICY IF NOT EXISTS "Users can create own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Or if the policy already exists with a different name, try this:
-- DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Recreate admin policy with proper permissions
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Allow service role (triggers) to insert profiles
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;

-- Make sure the trigger function uses SECURITY DEFINER properly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name, subscription_end_date)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NOW() + INTERVAL '7 days'
    )
    ON CONFLICT (id) DO NOTHING; -- Prevent duplicate errors
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail auth
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
