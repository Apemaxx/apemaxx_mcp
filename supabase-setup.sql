-- Supabase SQL Setup for Logistics Dashboard Profile System
-- Run this in your Supabase SQL Editor

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  job_title TEXT,
  organization_id UUID,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. Insert sample user
INSERT INTO users (id, email, password_hash)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'ricardo.lopes@apemax.com', '$2a$10$abcdefghijklmnopqrstuvwxyz')
ON CONFLICT (email) DO NOTHING;

-- 4. Insert sample profile
INSERT INTO profiles (user_id, first_name, last_name, avatar_url, bio, location, job_title)
VALUES (
  'user_1', 
  'Ricardo', 
  'Lopes', 
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 
  'Experienced logistics manager with 8+ years in international freight and supply chain optimization.', 
  'Miami, FL', 
  'Senior Logistics Manager'
)
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  job_title = EXCLUDED.job_title,
  updated_at = NOW();

-- 5. Enable Row Level Security (RLS) for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policy for profiles (users can only access their own profiles)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (user_id = current_user);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (user_id = current_user);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = current_user);

-- 7. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON users TO authenticated;